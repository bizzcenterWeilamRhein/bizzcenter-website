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

const MS_TENANT_ID = process.env.MS_TENANT_ID || '';
const MS_CLIENT_ID = process.env.MS_CLIENT_ID || '';
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || '';
const WELCOME_MAILBOX = 'info@greenofficeweil.com';

// Stripe-Price-IDs, die die Coworking-Welcome-Mail auslösen
const COWORKING_WELCOME_PRICE_IDS = new Set([
  'price_1T9o4gJHXQhpcKhgEvhhl86t', // cw_tagespass
]);

// Betreff der Vorlagen-Entwürfe in der Shared Mailbox (muss exakt mit dem
// Outlook-Entwurf übereinstimmen, sonst wird die Vorlage nicht gefunden)
const WELCOME_DRAFT_SUBJECTS: Record<'de' | 'en', string> = {
  de: 'bizzcenter Weil am Rhein | Coworking Tagespass | Anfahrtsbeschreibung | Infos',
  en: 'bizzcenter Weil am Rhein | Coworking Day Pass | Directions | Information',
};

const stripe = new Stripe(STRIPE_KEY);

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function findContactByEmail(email: string): Promise<{ id: number; organizationId: number | null } | null> {
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
  const data = await res.json() as { items?: Array<{ data: { id: number; contact_id?: number | null } }> };
  const hit = data.items?.[0]?.data;
  if (!hit) return null;
  return { id: hit.id, organizationId: hit.contact_id ?? null };
}

async function findOrganizationByName(name: string): Promise<number | null> {
  const url = `${ZENDESK_API}/contacts?name=${encodeURIComponent(name)}&is_organization=true&per_page=10`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    console.error('Zendesk org search failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = await res.json() as { items?: Array<{ data: { id: number; name?: string; is_organization?: boolean } }> };
  // Exact case-insensitive match (Zendesk's name= ist Substring-Filter)
  const match = data.items?.find(i => i.data.is_organization && (i.data.name || '').toLowerCase() === name.toLowerCase());
  return match?.data.id ?? null;
}

async function createOrganization(name: string): Promise<number | null> {
  const res = await fetch(`${ZENDESK_API}/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        name,
        is_organization: true,
      },
    }),
  });
  if (!res.ok) {
    console.error('Zendesk org create failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = await res.json() as { data: { id: number } };
  return data.data.id;
}

async function findOrCreateOrganization(firma: string | undefined): Promise<number | null> {
  if (!firma) return null;
  const existing = await findOrganizationByName(firma);
  if (existing) return existing;
  return await createOrganization(firma);
}

async function createContact(args: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationId?: number | null;
}): Promise<number | null> {
  const data: Record<string, unknown> = {
    first_name: args.firstName,
    last_name: args.lastName || '(kein Nachname)',
    email: args.email,
    phone: args.phone || undefined,
    is_organization: false,
  };
  // Zendesk Sell verwendet `contact_id` auf Person-Kontakten als Verweis
  // auf die Parent-Organization (eine Contact-Row mit is_organization=true).
  if (args.organizationId) data.contact_id = args.organizationId;

  const res = await fetch(`${ZENDESK_API}/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZENDESK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    console.error('Zendesk contact create failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const result = await res.json() as { data: { id: number } };
  return result.data.id;
}

async function getContactMeta(contactId: number): Promise<{ etag?: string } | null> {
  const r = await fetch(`${ZENDESK_API}/contacts/${contactId}`, {
    headers: { 'Authorization': `Bearer ${ZENDESK_TOKEN}`, 'Accept': 'application/json' },
  });
  if (!r.ok) return null;
  const data = await r.json() as { meta?: { http?: { etag?: string } } };
  return { etag: data.meta?.http?.etag };
}

async function attachContactToOrg(contactId: number, organizationId: number): Promise<void> {
  // Zendesk Sell verlangt If-Match Header beim Update
  const meta = await getContactMeta(contactId);
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${ZENDESK_TOKEN}`,
    'Content-Type': 'application/json',
  };
  if (meta?.etag) headers['If-Match'] = meta.etag;
  const r = await fetch(`${ZENDESK_API}/contacts/${contactId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ data: { contact_id: organizationId } }),
  });
  if (!r.ok) {
    console.error('Zendesk contact org attach failed:', r.status, await r.text().catch(() => ''));
  }
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

async function getGraphToken(): Promise<string | null> {
  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET) return null;
  try {
    const res = await fetch(`https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('Graph token failed:', err);
    return null;
  }
}

interface DraftAttachment {
  name: string;
  contentType: string;
  contentBytes?: string;
  contentId?: string;
  isInline: boolean;
}

async function sendWelcomeEmail(args: {
  customerEmail: string;
  customerName: string;
  locale: 'de' | 'en';
}): Promise<void> {
  const token = await getGraphToken();
  if (!token) {
    console.error('Welcome email: Graph token unavailable');
    return;
  }
  const auth = { Authorization: `Bearer ${token}` };
  const mbx = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(WELCOME_MAILBOX)}`;
  const draftSubject = WELCOME_DRAFT_SUBJECTS[args.locale];

  const filter = `subject eq '${draftSubject.replace(/'/g, "''")}'`;
  const listRes = await fetch(`${mbx}/mailFolders/drafts/messages?$filter=${encodeURIComponent(filter)}&$top=1&$select=id,subject`, { headers: auth });
  if (!listRes.ok) {
    console.error('Welcome email: list drafts failed:', listRes.status, await listRes.text().catch(() => ''));
    return;
  }
  const list = await listRes.json() as { value?: Array<{ id: string; subject: string }> };
  const draft = list.value?.[0];
  if (!draft) {
    console.error('Welcome email: draft not found for locale', args.locale, 'subject:', draftSubject);
    return;
  }

  const msgRes = await fetch(`${mbx}/messages/${encodeURIComponent(draft.id)}?$select=subject,body`, { headers: auth });
  if (!msgRes.ok) {
    console.error('Welcome email: read draft failed:', msgRes.status);
    return;
  }
  const msg = await msgRes.json() as { subject: string; body: { contentType: string; content: string } };

  const attRes = await fetch(`${mbx}/messages/${encodeURIComponent(draft.id)}/attachments`, { headers: auth });
  const attData = attRes.ok
    ? (await attRes.json() as { value?: DraftAttachment[] })
    : { value: [] };
  const attachments = (attData.value || []).map(a => ({
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: a.name,
    contentType: a.contentType,
    contentBytes: a.contentBytes,
    contentId: a.contentId,
    isInline: a.isInline,
  }));

  const sendRes = await fetch(`${mbx}/sendMail`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: msg.subject,
        body: { contentType: msg.body.contentType, content: msg.body.content },
        toRecipients: [{ emailAddress: { address: args.customerEmail, name: args.customerName || undefined } }],
        attachments,
      },
      saveToSentItems: true,
    }),
  });
  if (!sendRes.ok) {
    console.error('Welcome email: sendMail failed:', sendRes.status, await sendRes.text().catch(() => ''));
  }
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

  // Line Items für Geschäftsname / Produkt-Code / Welcome-Mail-Trigger laden
  let dealName = 'Stripe-Zahlung';
  let productCode = 'unknown';
  const allPriceIds: string[] = [];
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 25 });
    for (const item of lineItems.data) {
      const pid = typeof item.price === 'string' ? item.price : item.price?.id || '';
      if (pid) allPriceIds.push(pid);
    }
    if (lineItems.data.length > 0) {
      const first = lineItems.data[0];
      dealName = first.description || dealName;
      productCode = (allPriceIds[0] || '').split('_')[0] || productCode;
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
  const description = [
    `Quelle: stripe-checkout`,
    `Stripe Session: ${session.id}`,
    `Betrag: ${value.toFixed(2)} ${currency}`,
    `Modus: ${session.mode}`,
  ].join('\n');

  // Zendesk-Sync und Welcome-Mail unabhängig + parallel — Fehler in dem einen
  // soll den anderen nicht blockieren.
  const triggersWelcomeEmail = allPriceIds.some(pid => COWORKING_WELCOME_PRICE_IDS.has(pid));
  const localeMeta = (session.metadata?.locale || '').toLowerCase();
  const locale: 'de' | 'en' = localeMeta === 'de' ? 'de' : 'en';

  // Firma aus Custom-Field (Payment-Link / direkte Session) ODER Metadata (Wizard)
  const customFields = (session.custom_fields || []) as Array<{ key?: string; text?: { value?: string | null } }>;
  const firmaFromCustom = customFields.find(f => f.key === 'firma')?.text?.value || '';
  const firmaFromMeta = session.metadata?.firma || '';
  const firma = (firmaFromCustom || firmaFromMeta).trim() || undefined;

  const tasks: Promise<unknown>[] = [
    (async () => {
      // Schritt 1: Falls Firma vorhanden, Organization in Zendesk Sell finden oder anlegen
      const orgId = firma ? await findOrCreateOrganization(firma) : null;

      // Schritt 2: Kontakt suchen
      const existing = await findContactByEmail(email);
      let contactId: number | null = existing?.id || null;

      if (!contactId) {
        // Neuer Kontakt — direkt mit Org-Verknüpfung anlegen (falls vorhanden)
        contactId = await createContact({ email, firstName, lastName, phone, organizationId: orgId });
      } else if (orgId && existing && !existing.organizationId) {
        // Bestehender Kontakt ohne Org → Org nachträglich verknüpfen
        await attachContactToOrg(contactId, orgId);
      }

      if (!contactId) {
        console.error('Zendesk: Kontakt konnte weder gefunden noch angelegt werden:', email);
        return;
      }

      await createDeal({
        contactId,
        name: dealName,
        value,
        currency,
        productCode,
        sessionId: session.id,
        description,
      });
    })().catch(err => console.error('Zendesk-Sync fehlgeschlagen:', err)),
  ];

  if (triggersWelcomeEmail) {
    tasks.push(
      sendWelcomeEmail({ customerEmail: email, customerName: fullName, locale })
        .catch(err => console.error('sendWelcomeEmail error:', err))
    );
  }

  await Promise.allSettled(tasks);
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

  // Verarbeitung MUSS hier awaited werden, sonst killt Vercel die Async-Arbeit
  // nach dem Response (Serverless: kein Background nach return). Stripe
  // wartet bis ~30s, daher problemlos.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await processCheckoutCompleted(session);
    } catch (err) {
      console.error('processCheckoutCompleted error:', err);
    }
  }

  return res.status(200).json({ received: true });
}
