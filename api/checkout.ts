import type { NextApiRequest, NextApiResponse } from 'next';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://weil.bizzcenter.de';

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
  'tb_tag': 'price_1TQlQZJHXQhpcKhghYjwFQ4i',
  'tb_woche': 'price_1TQlQZJHXQhpcKhgPr3jCNG4',
  'tb_10er': 'price_1TQlQaJHXQhpcKhgUa5EM2lK',
  'tb_monat': 'price_1TQlQaJHXQhpcKhgyHt3eikF',
  // Add-ons (monatlich)
  'addon_parkplatz': 'price_1T9o4oJHXQhpcKhgbEUDDEwb',
  'addon_parkplatz_fest': 'price_1TQlQbJHXQhpcKhgSKaCIF1e',
  'addon_kaffee': 'price_1T9o4oJHXQhpcKhgsLkqzfRu',
  'addon_monitor': 'price_1T9o4pJHXQhpcKhgyjto6kpz',
  'addon_schrank': 'price_1T9o4pJHXQhpcKhgFsScY4uu',
  'addon_scan': 'price_1T9o4qJHXQhpcKhgtzdpeiKG',
  'addon_firmenschild': 'price_1T9o4rJHXQhpcKhgKee1emBB',
  // Add-ons (einmalig — Tagespass / 10er)
  'addon_kaffee_tag': 'price_1T9pwHJHXQhpcKhge5UguPpX',
  'addon_monitor_tag': 'price_1TI23fJHXQhpcKhg2FiMCBEg',
  'addon_parkplatz_tag': 'price_1T9pwMJHXQhpcKhgvhgn43QW',
  'addon_parkplatz_10er': 'price_1T9r4gJHXQhpcKhgMHWRIYix',
};

// Cached tax rate ID — fetched/created once per cold start
let cachedTaxRateId: string | null = null;

async function getOrCreateTaxRate(): Promise<string> {
  if (cachedTaxRateId) return cachedTaxRateId;

  // Search for existing DE MwSt 19% tax rate
  const listRes = await fetch('https://api.stripe.com/v1/tax_rates?active=true&limit=100', {
    headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
  });
  const listData = await listRes.json();

  if (listData.data?.length > 0) {
    const existing = listData.data.find(
      (tr: { percentage: number; display_name: string }) =>
        tr.percentage === 19 &&
        (tr.display_name.includes('MwSt') || tr.display_name.includes('VAT'))
    );
    if (existing) {
      cachedTaxRateId = existing.id;
      return cachedTaxRateId!;
    }
  }

  // Create new tax rate
  const createParams = new URLSearchParams();
  createParams.append('display_name', 'MwSt.');
  createParams.append('percentage', '19');
  createParams.append('inclusive', 'false');
  createParams.append('country', 'DE');
  createParams.append('jurisdiction', 'DE');

  const createRes = await fetch('https://api.stripe.com/v1/tax_rates', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: createParams.toString(),
  });
  const createData = await createRes.json();

  if (!createData.id) throw new Error('Failed to create tax rate: ' + JSON.stringify(createData));
  cachedTaxRateId = createData.id;
  return cachedTaxRateId!;
}

const RECURRING_KEYS = new Set(
  Object.keys(PRICES).filter(k =>
    k.startsWith('ga_') || k.startsWith('cw_monats') || k === 'tb_monat' ||
    (k.startsWith('addon_') && k !== 'addon_firmenschild' && !k.endsWith('_tag') && !k.endsWith('_10er'))
  )
);

const ALLOWED_ORIGINS = [
  'https://weil.bizzcenter.de', 'https://www.bizzcenter.de', 'https://bizzcenter.de',
  'https://bizzcenter-website.vercel.app',
];

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin) || origin.includes('ngrok-free.dev') || origin.includes('localhost');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '';
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { priceId, addons, successUrl, cancelUrl, customerEmail, customerName, customerPhone, firma, locale } = req.body;
    const checkoutLocale: 'de' | 'en' | 'fr' | 'it' = ['de', 'en', 'fr', 'it'].includes(locale) ? locale : 'de';

    if (!priceId || !PRICES[priceId]) {
      return res.status(400).json({ error: 'Ungültiges Produkt' });
    }

    // Resolve MwSt. tax rate (cached after first call)
    const taxRateId = await getOrCreateTaxRate();

    // Input validation
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
    }
    if (customerName && customerName.length > 200) {
      return res.status(400).json({ error: 'Name zu lang' });
    }
    if (firma && firma.length > 200) {
      return res.status(400).json({ error: 'Firmenname zu lang' });
    }

    // ─── Upsell mapping: which add-on keys are available per product category ───
    // (Park-Optionen nur bei Monatsbuchungen — laut Geschäftsregel)
    const UPSELL_MAP: Record<string, string[]> = {
      'cw_tagespass': ['addon_kaffee_tag', 'addon_monitor_tag'],
      'cw_10er': [],
      'cw_monatspass': ['addon_kaffee', 'addon_parkplatz_fest', 'addon_monitor', 'addon_schrank'],
      'cw_monatsabo': ['addon_kaffee', 'addon_parkplatz_fest', 'addon_monitor', 'addon_schrank'],
      'tb_tag': ['addon_kaffee_tag', 'addon_monitor_tag', 'addon_parkplatz_tag'],
      'tb_woche': [],
      'tb_10er': ['addon_parkplatz_10er'],
      'tb_monat': ['addon_kaffee', 'addon_parkplatz_fest', 'addon_monitor'],
    };
    // Konferenzraum upsells (Kaffee als Tages-Add-on, kein Parkplatz)
    for (const prefix of ['konf_2pers', 'konf_6pers', 'konf_15pers', 'konf_25pers']) {
      for (const dur of ['_stunde', '_halbtags', '_ganztags']) {
        UPSELL_MAP[prefix + dur] = ['addon_kaffee_tag'];
      }
    }

    // Build line items
    const lineItems: Array<{ price: string; quantity: number; adjustable?: boolean }> = [
      { price: PRICES[priceId], quantity: 1 },
    ];

    const selectedAddonKeys = new Set<string>(addons || []);

    if (addons && Array.isArray(addons)) {
      for (const addon of addons) {
        if (PRICES[addon]) {
          lineItems.push({ price: PRICES[addon], quantity: 1 });
        }
      }
    }

    // Upsell items: pre-selected at qty 1, adjustable down to 0 so customers can opt out
    const upsellKeys = UPSELL_MAP[priceId] || [];
    for (const upsellKey of upsellKeys) {
      if (!selectedAddonKeys.has(upsellKey) && PRICES[upsellKey]) {
        lineItems.push({ price: PRICES[upsellKey], quantity: 1, adjustable: true });
      }
    }

    const allKeys = [priceId, ...(addons || [])];
    const hasRecurring = allKeys.some((k: string) => RECURRING_KEYS.has(k));
    const mode = hasRecurring ? 'subscription' : 'payment';

    // ─── Create or find Stripe Customer (prefill billing data) ───
    let stripeCustomerId: string | null = null;
    if (customerEmail) {
      try {
        // Search existing customer by email
        const searchRes = await fetch(
          `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${customerEmail}"`)}`,
          { headers: { 'Authorization': `Bearer ${STRIPE_KEY}` } }
        );
        const searchData = await searchRes.json();

        if (searchData.data?.length > 0) {
          stripeCustomerId = searchData.data[0].id;
          // Update existing customer with latest info
          const updateParams = new URLSearchParams();
          if (customerName) updateParams.append('name', customerName);
          if (customerPhone) updateParams.append('phone', customerPhone);
          if (firma) updateParams.append('metadata[firma]', firma);
          if (updateParams.toString()) {
            await fetch(`https://api.stripe.com/v1/customers/${stripeCustomerId}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
              body: updateParams.toString(),
            });
          }
        } else {
          // Create new customer
          const custParams = new URLSearchParams();
          custParams.append('email', customerEmail);
          if (customerName) custParams.append('name', customerName);
          if (customerPhone) custParams.append('phone', customerPhone);
          if (firma) custParams.append('metadata[firma]', firma);

          const custRes = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: custParams.toString(),
          });
          const custData = await custRes.json();
          if (custData.id) stripeCustomerId = custData.id;
        }
      } catch (err) {
        console.error('Stripe customer creation failed:', err);
        // Continue without customer — fallback to customer_email
      }
    }

    // Build Stripe params
    const params = new URLSearchParams();
    params.append('mode', mode);
    params.append('currency', 'eur');
    params.append('success_url', successUrl || `${SITE_URL}/buchung-bestaetigt`);
    params.append('cancel_url', cancelUrl || SITE_URL);
    params.append('billing_address_collection', 'required');
    if (mode === 'payment' && !stripeCustomerId) {
      params.append('customer_creation', 'always');
    }
    params.append('locale', checkoutLocale);
    params.append('payment_method_types[0]', 'card');
    params.append('tax_id_collection[enabled]', 'true');
    params.append('phone_number_collection[enabled]', 'true');

    // Use customer object (prefills name, email, phone) or fallback to email
    if (stripeCustomerId) {
      params.append('customer', stripeCustomerId);
      params.append('customer_update[name]', 'auto');
      params.append('customer_update[address]', 'auto');
    } else if (customerEmail) {
      params.append('customer_email', customerEmail);
    }

    if (firma) params.append('metadata[firma]', firma);
    if (customerName) params.append('metadata[customer_name]', customerName);
    if (customerPhone) params.append('metadata[phone]', customerPhone);
    params.append('metadata[locale]', checkoutLocale);

    lineItems.forEach((item, i) => {
      params.append(`line_items[${i}][price]`, item.price);
      params.append(`line_items[${i}][quantity]`, String(item.quantity));
      if (mode === 'payment') {
        params.append(`line_items[${i}][tax_rates][0]`, taxRateId);
      }
      if (item.adjustable) {
        params.append(`line_items[${i}][adjustable_quantity][enabled]`, 'true');
        params.append(`line_items[${i}][adjustable_quantity][minimum]`, '0');
        params.append(`line_items[${i}][adjustable_quantity][maximum]`, '1');
      }
    });

    if (mode === 'subscription') {
      params.append('subscription_data[default_tax_rates][0]', taxRateId);
    }

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

    // ─── Lead sync: CRM (fire-and-forget) ───
    // Zendesk Sell wird über api/stripe-webhook.ts NACH erfolgreicher Zahlung befüllt
    // (Upsert by Email → Kontakt + Deal). Hier nur noch interner CRM-Eintrag.
    const nameParts = (customerName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const descParts: string[] = [];
    descParts.push(`Quelle: stripe-checkout`);
    descParts.push(`Produkt: ${priceId}`);
    if (addons?.length) descParts.push(`Add-ons: ${addons.join(', ')}`);
    descParts.push(`Stripe Session: ${session.id}`);
    descParts.push(`Modus: ${mode}`);
    const description = descParts.join('\n');

    // CRM (Supabase DB)
    (async () => {
      try {
        const { Client } = await import('pg');
        const dbUrl = process.env.CRM_DATABASE_URL;
        if (!dbUrl) { console.warn('CRM_DATABASE_URL not configured — skipping CRM'); return; }
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        // Find or create Kontakt
        let kontaktResult = customerEmail
          ? await client.query(
              'SELECT id FROM kontakte WHERE email = $1 AND "deletedAt" IS NULL LIMIT 1',
              [customerEmail]
            )
          : { rows: [] };

        let kontaktId;
        if (kontaktResult.rows.length > 0) {
          kontaktId = kontaktResult.rows[0].id;
        } else {
          const insertKontakt = await client.query(
            `INSERT INTO kontakte (id, vorname, nachname, email, telefon, "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
             RETURNING id`,
            [firstName, lastName || '(kein Nachname)', customerEmail || null, customerPhone || null]
          );
          kontaktId = insertKontakt.rows[0].id;
        }

        // Find or create Unternehmen
        let unternehmenId = null;
        if (firma) {
          const untResult = await client.query(
            'SELECT id FROM unternehmen WHERE firmenname = $1 AND "deletedAt" IS NULL LIMIT 1',
            [firma]
          );
          if (untResult.rows.length > 0) {
            unternehmenId = untResult.rows[0].id;
          } else {
            const insertUnt = await client.query(
              `INSERT INTO unternehmen (id, firmenname, "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, NOW(), NOW())
               RETURNING id`,
              [firma]
            );
            unternehmenId = insertUnt.rows[0].id;
          }
        }

        // Create Lead
        const productTag = priceId.split('_')[0];
        const produktMap: Record<string, string> = { ga: 'geschaeftsadresse', cw: 'coworking', konf: 'konferenzraum', tb: 'tagesbuero' };
        await client.query(
          `INSERT INTO leads (id, "kontaktId", "unternehmenId", quelle, "bedarfKategorie", notizen, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, 'WEBSITE_FORM', $3, $4, NOW(), NOW())`,
          [kontaktId, unternehmenId, produktMap[productTag] || priceId, description]
        );

        await client.end();
      } catch (err) {
        console.error('CRM lead from checkout failed:', err);
      }
    })();

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
