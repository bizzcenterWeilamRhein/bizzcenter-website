import type { NextApiRequest, NextApiResponse } from 'next';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://weil.bizzcenter.de';
const ZENDESK_TOKEN = process.env.ZENDESK_SELL_API_TOKEN || '';
const ZENDESK_API = 'https://api.getbase.com/v2';

// Price IDs from Stripe
const PRICES: Record<string, string> = {
  // Geschäftsadresse
  'ga_langzeit_ohne': 'price_1T9o4dJHXQhpcKhgA8cu5FcA',
  'ga_langzeit_mit': 'price_1T9o4eJHXQhpcKhgWi9nmIQF',
  'ga_standard_ohne': 'price_1T9o4eJHXQhpcKhgtxHqtpSm',
  'ga_standard_mit': 'price_1T9o4fJHXQhpcKhgVUSTXDQO',
  'ga_flex_ohne': 'price_1T9o4fJHXQhpcKhgOKE5WU5B',
  'ga_flex_mit': 'price_1T9o4fJHXQhpcKhgSXt3fi94',
  // Coworking
  'cw_tagespass': 'price_1T9o4gJHXQhpcKhgEvhhl86t',
  'cw_10er': 'price_1T9o4hJHXQhpcKhgQt7Bk7FH',
  'cw_monatspass': 'price_1T9o4hJHXQhpcKhgnqb5WlC4',
  'cw_monatsabo': 'price_1T9o4iJHXQhpcKhgGxLmtUuF',
  // Konferenzraum
  'konf_2pers_stunde': 'price_1T9o4iJHXQhpcKhg4f9q97J1',
  'konf_2pers_halbtags': 'price_1T9o4jJHXQhpcKhgp5AvD6QK',
  'konf_2pers_ganztags': 'price_1T9o4jJHXQhpcKhgrj6QlJGS',
  'konf_6pers_stunde': 'price_1T9o4kJHXQhpcKhgbS2UfXjY',
  'konf_6pers_halbtags': 'price_1T9o4kJHXQhpcKhgqVSqiMjy',
  'konf_6pers_ganztags': 'price_1T9o4kJHXQhpcKhgOrwa5ho1',
  'konf_15pers_stunde': 'price_1T9o4lJHXQhpcKhg1JDdKkrK',
  'konf_15pers_halbtags': 'price_1T9o4lJHXQhpcKhgjJ4IrXtw',
  'konf_15pers_ganztags': 'price_1T9o4lJHXQhpcKhgC44iUAis',
  'konf_25pers_stunde': 'price_1T9o4mJHXQhpcKhgF1yIo7oX',
  'konf_25pers_halbtags': 'price_1T9o4mJHXQhpcKhggHANaEYb',
  'konf_25pers_ganztags': 'price_1T9o4mJHXQhpcKhgrbx9LCJ8',
  // Tagesbüro
  'tb': 'price_1T9o4nJHXQhpcKhgqrQ95gxs',
  // Add-ons
  'addon_parkplatz': 'price_1T9o4oJHXQhpcKhgbEUDDEwb',
  'addon_kaffee': 'price_1T9o4oJHXQhpcKhgsLkqzfRu',
  'addon_monitor': 'price_1T9o4pJHXQhpcKhgyjto6kpz',
  'addon_schrank': 'price_1T9o4pJHXQhpcKhgFsScY4uu',
  'addon_scan': 'price_1T9o4qJHXQhpcKhgtzdpeiKG',
  'addon_firmenschild': 'price_1T9o4rJHXQhpcKhgKee1emBB',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  const allowedOrigins = ['https://weil.bizzcenter.de', 'https://www.bizzcenter.de', 'https://bizzcenter.de', 'https://bizzcenter-website.vercel.app'];
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes('ngrok-free.dev') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { priceId, addons, successUrl, cancelUrl, customerEmail, customerName, firma } = req.body;

    if (!priceId || !PRICES[priceId]) {
      return res.status(400).json({ error: 'Ungültiges Produkt' });
    }

    // Build line items
    const lineItems: Array<{ price: string; quantity: number }> = [
      { price: PRICES[priceId], quantity: 1 },
    ];

    // Add selected add-ons
    if (addons && Array.isArray(addons)) {
      for (const addon of addons) {
        if (PRICES[addon]) {
          lineItems.push({ price: PRICES[addon], quantity: 1 });
        }
      }
    }

    // Determine mode: subscription if any recurring price
    const recurringKeys = new Set([
      ...Object.keys(PRICES).filter(k => k.startsWith('ga_')),
      ...Object.keys(PRICES).filter(k => k.startsWith('cw_monats')),
      ...Object.keys(PRICES).filter(k => k.startsWith('addon_') && k !== 'addon_firmenschild'),
    ]);
    
    const allKeys = [priceId, ...(addons || [])];
    const hasRecurring = allKeys.some(k => recurringKeys.has(k));
    const mode = hasRecurring ? 'subscription' : 'payment';

    // Create Stripe Checkout Session
    const params = new URLSearchParams();
    params.append('mode', mode);
    params.append('success_url', successUrl || `${SITE_URL}/buchung-bestaetigt`);
    params.append('cancel_url', cancelUrl || `${SITE_URL}`);
    params.append('billing_address_collection', 'required');
    params.append('customer_creation', 'always');
    params.append('locale', 'de');
    params.append('tax_id_collection[enabled]', 'true');
    params.append('automatic_tax[enabled]', 'true');
    
    // Pre-fill customer email
    if (customerEmail) {
      params.append('customer_email', customerEmail);
    }

    // Store customer data as metadata
    if (firma) {
      params.append('metadata[firma]', firma);
    }
    if (customerName) {
      params.append('metadata[customer_name]', customerName);
    }

    // Line items
    lineItems.forEach((item, i) => {
      params.append(`line_items[${i}][price]`, item.price);
      params.append(`line_items[${i}][quantity]`, String(item.quantity));
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session.error);
      return res.status(500).json({ error: session.error?.message || 'Stripe Fehler' });
    }

    // ─── Zendesk Sell Lead erstellen (parallel, non-blocking) ───
    if (ZENDESK_TOKEN && (customerEmail || firma)) {
      const nameParts = (customerName || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Build description with booking details
      const descParts: string[] = [];
      descParts.push(`Quelle: stripe-checkout`);
      descParts.push(`Produkt: ${priceId}`);
      if (addons?.length) descParts.push(`Add-ons: ${addons.join(', ')}`);
      descParts.push(`Stripe Session: ${session.id}`);
      descParts.push(`Modus: ${mode}`);
      const description = descParts.join('\n');

      // Fire-and-forget — don't block checkout on CRM
      fetch(`${ZENDESK_API}/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ZENDESK_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            first_name: firstName,
            last_name: lastName || undefined,
            organization_name: firma || undefined,
            email: customerEmail || undefined,
            description,
            tags: ['website', 'stripe-checkout', priceId.split('_')[0]],
          },
        }),
      }).catch(err => console.error('Zendesk Sell lead error:', err));
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
