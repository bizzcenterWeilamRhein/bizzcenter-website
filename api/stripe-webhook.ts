import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const ZENDESK_TOKEN = process.env.ZENDESK_SELL_API_TOKEN || '';
const ZENDESK_API = 'https://api.getbase.com/v2';
const ZENDESK_WON_STAGE_ID = process.env.ZENDESK_WON_STAGE_ID
  ? Number(process.env.ZENDESK_WON_STAGE_ID)
  : undefined;

const stripe = new Stripe(STRIPE_KEY);

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function findContactByEmail(email: string): Promise<number | null> {
  const url = `${ZENDESK_API}/contacts?email=${encodeURIComponent(email)}&per_page=1`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    console.error('Zendesk contact search failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = await res.json() as { items?: Array<{ data: { id: number } }> };
  return data.items?.[0]?.data?.id ?? null;
}

async function createContact(args: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<number | null> {
  const res = await fetch(`${ZENDESK_API}/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        first_name: args.firstName,
        last_name: args.lastName || '(kein Nachname)',
        email: args.email,
        phone: args.phone || undefined,
        is_organization: false,
      },
    }),
  });
  if (!res.ok) {
    console.error('Zendesk contact create failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = await res.json() as { data: { id: number } };
  return data.data.id;
}

async function createDeal(args: {
  contactId: number;
  name: string;
  value: number;
  currency: string;
  productCode: string;
  sessionId: string;
  description: string;
}): Promise<void> {
  const body: Record<string, unknown> = {
    name: args.name,
    contact_id: args.contactId,
    value: args.value,
    currency: args.currency,
    tags: ['website', 'stripe-paid', args.productCode],
    custom_fields: {},
    source_id: undefined,
  };
  if (ZENDESK_WON_STAGE_ID) body.stage_id = ZENDESK_WON_STAGE_ID;

  const res = await fetch(`${ZENDESK_API}/deals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) {
    console.error('Zendesk deal create failed:', res.status, await res.text().catch(() => ''));
    return;
  }
  const dealData = await res.json() as { data: { id: number } };

  // Notiz mit Stripe-Session-ID anhängen, damit man die Zahlung in Stripe wiederfindet
  await fetch(`${ZENDESK_API}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        resource_type: 'deal',
        resource_id: dealData.data.id,
        content: args.description,
      },
    }),
  }).catch(err => console.error('Zendesk note attach failed:', err));
}

async function processCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (!ZENDESK_TOKEN) {
    console.warn('ZENDESK_SELL_API_TOKEN nicht gesetzt — Webhook übersprungen');
    return;
  }

  const email = session.customer_details?.email || session.customer_email || '';
  if (!email) {
    console.warn('Stripe webhook: keine E-Mail in Session', session.id);
    return;
  }

  const fullName = (session.customer_details?.name || '').trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');
  const phone = session.customer_details?.phone || undefined;

  // Line Items für Geschäftsname / Produkt-Code laden
  let dealName = 'Stripe-Zahlung';
  let productCode = 'unknown';
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
    if (lineItems.data.length > 0) {
      const first = lineItems.data[0];
      dealName = first.description || dealName;
      const priceId = typeof first.price === 'string' ? first.price : first.price?.id || '';
      productCode = priceId.split('_')[0] || productCode;
      if (lineItems.data.length > 1) {
        dealName += ` + ${lineItems.data.length - 1} weitere`;
      }
    }
  } catch (err) {
    console.error('Stripe listLineItems failed:', err);
  }

  const value = Math.round((session.amount_total || 0)) / 100;
  const currency = (session.currency || 'eur').toUpperCase();

  // Kontakt suchen oder anlegen (Upsert by Email)
  let contactId = await findContactByEmail(email);
  if (!contactId) {
    contactId = await createContact({ email, firstName, lastName, phone });
  }
  if (!contactId) {
    console.error('Zendesk: Kontakt konnte weder gefunden noch angelegt werden:', email);
    return;
  }

  const description = [
    `Quelle: stripe-checkout`,
    `Stripe Session: ${session.id}`,
    `Betrag: ${value.toFixed(2)} ${currency}`,
    `Modus: ${session.mode}`,
  ].join('\n');

  await createDeal({
    contactId,
    name: dealName,
    value,
    currency,
    productCode,
    sessionId: session.id,
    description,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Stripe-Signature header fehlt');
  }
  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET nicht konfiguriert');
    return res.status(500).send('Webhook secret nicht konfiguriert');
  }

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('Webhook signature verification failed:', msg);
    return res.status(400).send(`Invalid signature: ${msg}`);
  }

  // Stripe so schnell wie möglich antworten — Verarbeitung im Hintergrund
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    processCheckoutCompleted(session).catch(err => {
      console.error('processCheckoutCompleted error:', err);
    });
  }

  return res.status(200).json({ received: true });
}
