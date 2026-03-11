#!/usr/bin/env node
// Standalone Checkout API Server
// Runs alongside the ShipSite dev server

const http = require('http');
const https = require('https');

const PORT = 3002;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const ZENDESK_TOKEN = process.env.ZENDESK_SELL_API_TOKEN || '';
const ZENDESK_API = 'https://api.getbase.com/v2';

const PRICES = {
  'ga_langzeit_ohne': 'price_1T9o4dJHXQhpcKhgA8cu5FcA',
  'ga_langzeit_mit': 'price_1T9o4eJHXQhpcKhgWi9nmIQF',
  'ga_standard_ohne': 'price_1T9o4eJHXQhpcKhgtxHqtpSm',
  'ga_standard_mit': 'price_1T9o4fJHXQhpcKhgVUSTXDQO',
  'ga_flex_ohne': 'price_1T9o4fJHXQhpcKhgOKE5WU5B',
  'ga_flex_mit': 'price_1T9o4fJHXQhpcKhgSXt3fi94',
  'cw_tagespass': 'price_1T9o4gJHXQhpcKhgEvhhl86t',
  'cw_10er': 'price_1T9o4hJHXQhpcKhgQt7Bk7FH',
  'cw_monatspass': 'price_1T9o4hJHXQhpcKhgnqb5WlC4',
  'cw_monatsabo': 'price_1T9o4iJHXQhpcKhgGxLmtUuF',
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
  'tb': 'price_1T9o4nJHXQhpcKhgqrQ95gxs',
  'addon_parkplatz': 'price_1T9o4oJHXQhpcKhgbEUDDEwb',
  'addon_kaffee': 'price_1T9o4oJHXQhpcKhgsLkqzfRu',
  'addon_monitor': 'price_1T9o4pJHXQhpcKhgyjto6kpz',
  'addon_schrank': 'price_1T9o4pJHXQhpcKhgFsScY4uu',
  'addon_scan': 'price_1T9o4qJHXQhpcKhgtzdpeiKG',
  'addon_firmenschild': 'price_1T9o4rJHXQhpcKhgKee1emBB',
};

const RECURRING_KEYS = new Set(
  Object.keys(PRICES).filter(k =>
    k.startsWith('ga_') || k.startsWith('cw_monats') ||
    (k.startsWith('addon_') && k !== 'addon_firmenschild')
  )
);

function stripeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString();
    const req = https.request({
      hostname: 'api.stripe.com',
      path: `/v1${endpoint}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  const origin = req.headers.origin || '';
  if (origin.includes('ngrok-free.dev') || origin.includes('localhost') || origin.includes('bizzcenter') || origin.includes('vercel')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.method !== 'POST' || req.url !== '/api/checkout') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { priceId, addons, successUrl, cancelUrl, customerEmail, customerName, firma } = JSON.parse(body);

      if (!priceId || !PRICES[priceId]) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Ungültiges Produkt' }));
      }

      // Line items
      const lineItems = [{ price: PRICES[priceId], quantity: '1' }];
      if (addons && Array.isArray(addons)) {
        for (const addon of addons) {
          if (PRICES[addon]) {
            lineItems.push({ price: PRICES[addon], quantity: '1' });
          }
        }
      }

      const allKeys = [priceId, ...(addons || [])];
      const hasRecurring = allKeys.some(k => RECURRING_KEYS.has(k));
      const mode = hasRecurring ? 'subscription' : 'payment';

      const params = {};
      params['mode'] = mode;
      params['success_url'] = successUrl || 'https://weil.bizzcenter.de/buchung-bestaetigt';
      params['cancel_url'] = cancelUrl || 'https://weil.bizzcenter.de';
      params['billing_address_collection'] = 'required';
      params['customer_creation'] = 'always';
      params['locale'] = 'de';
      params['tax_id_collection[enabled]'] = 'true';
      params['automatic_tax[enabled]'] = 'true';

      if (customerEmail) params['customer_email'] = customerEmail;
      if (firma) params['metadata[firma]'] = firma;
      if (customerName) params['metadata[customer_name]'] = customerName;

      lineItems.forEach((item, i) => {
        params[`line_items[${i}][price]`] = item.price;
        params[`line_items[${i}][quantity]`] = item.quantity;
      });

      const result = await stripeRequest('/checkout/sessions', params);

      if (result.status !== 200) {
        console.error('Stripe error:', result.data.error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: result.data.error?.message || 'Stripe Fehler' }));
      }

      // Zendesk Sell Lead (fire-and-forget)
      if (ZENDESK_TOKEN && (customerEmail || firma)) {
        const nameParts = (customerName || '').trim().split(/\s+/);
        const zendeskBody = JSON.stringify({
          data: {
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || undefined,
            organization_name: firma || undefined,
            email: customerEmail || undefined,
            description: `Quelle: stripe-checkout\nProdukt: ${priceId}\nAdd-ons: ${(addons || []).join(', ')}\nStripe Session: ${result.data.id}`,
            tags: ['website', 'stripe-checkout', priceId.split('_')[0]],
          },
        });
        const zReq = https.request({
          hostname: 'api.getbase.com',
          path: '/v2/leads',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ZENDESK_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(zendeskBody),
          },
        });
        zReq.on('error', err => console.error('Zendesk error:', err.message));
        zReq.write(zendeskBody);
        zReq.end();
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: result.data.url, sessionId: result.data.id }));
    } catch (err) {
      console.error('Checkout error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Interner Fehler' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Checkout API running on port ${PORT}`);
});
