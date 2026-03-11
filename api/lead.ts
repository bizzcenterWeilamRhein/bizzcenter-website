import type { VercelRequest, VercelResponse } from '@vercel/node';

// M365 Graph API for email notifications
const MS_TENANT_ID = process.env.MS_TENANT_ID || '';
const MS_CLIENT_ID = process.env.MS_CLIENT_ID || '';
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || '';
const NOTIFICATION_EMAIL = 'weil@bizzcenter.onmicrosoft.com';

interface LeadData {
  // Kontaktformular fields
  vorname?: string;
  nachname?: string;
  // Legacy single name field
  name?: string;
  firma?: string;
  anrede?: string;
  email?: string;
  telefon?: string;
  nachricht?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  quelle: string;
  product?: string;
  bemerkungen?: string;
  raum?: string;
  dauer?: string;
  termine?: string[];
  addons?: string[];
  gesamtpreis?: number;
}

async function getM365Token(): Promise<string | null> {
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
  } catch {
    return null;
  }
}

async function sendNotificationEmail(lead: { firstName: string; lastName: string; firma?: string; telefon?: string; email?: string; nachricht?: string; quelle: string; product?: string }) {
  const token = await getM365Token();
  if (!token) {
    console.warn('M365 token not available — skipping email notification');
    return;
  }

  const subject = `Neue Anfrage: ${lead.firstName} ${lead.lastName}${lead.firma ? ` (${lead.firma})` : ''} — ${lead.quelle}`;

  const lines = [
    `<h2>Neue Anfrage über ${lead.quelle}</h2>`,
    `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">`,
    `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name:</td><td>${lead.firstName} ${lead.lastName}</td></tr>`,
    lead.firma ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Firma:</td><td>${lead.firma}</td></tr>` : '',
    lead.telefon ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td>${lead.telefon}</td></tr>` : '',
    lead.email ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">E-Mail:</td><td>${lead.email}</td></tr>` : '',
    lead.product ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Produkt:</td><td>${lead.product}</td></tr>` : '',
    `</table>`,
    lead.nachricht ? `<h3>Nachricht:</h3><p style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap;">${lead.nachricht}</p>` : '',
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://graph.microsoft.com/v1.0/users/${NOTIFICATION_EMAIL}/sendMail`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: 'HTML', content: lines },
          toRecipients: [{ emailAddress: { address: NOTIFICATION_EMAIL } }],
        },
      }),
    });
  } catch (err) {
    console.error('Email notification failed:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const allowedOrigins = ['https://weil.bizzcenter.de', 'https://www.bizzcenter.de', 'https://bizzcenter.de', 'https://bizzcenter-website.vercel.app'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || origin.includes('ngrok-free.dev') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data: LeadData = req.body;

    // Support both vorname/nachname and legacy name field
    let firstName = '';
    let lastName = '';
    if (data.vorname && data.nachname) {
      firstName = data.vorname.trim();
      lastName = data.nachname.trim();
    } else if (data.name) {
      const nameParts = data.name.trim().split(/\s+/);
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Kontaktformular: telefon is required, email is optional
    // Other forms: email is required
    if (!firstName) {
      return res.status(400).json({ error: 'Name ist ein Pflichtfeld.' });
    }

    // Beschreibung zusammenbauen
    const descParts: string[] = [];
    descParts.push(`Quelle: ${data.quelle}`);
    if (data.product) descParts.push(`Produkt: ${data.product}`);
    if (data.anrede) descParts.push(`Anrede: ${data.anrede}`);
    if (data.telefon) descParts.push(`Telefon: ${data.telefon}`);
    if (data.raum) descParts.push(`Raum: ${data.raum}`);
    if (data.dauer) descParts.push(`Dauer: ${data.dauer}`);
    if (data.termine?.length) descParts.push(`Termine: ${data.termine.join(', ')}`);
    if (data.addons?.length) descParts.push(`Add-ons: ${data.addons.join(', ')}`);
    if (data.gesamtpreis) descParts.push(`Gesamtpreis: EUR ${data.gesamtpreis},- zzgl. MwSt.`);
    if (data.nachricht) descParts.push(`Nachricht: ${data.nachricht}`);
    if (data.bemerkungen) descParts.push(`Bemerkungen: ${data.bemerkungen}`);

    const description = descParts.join('\n');

    // Parallel: CRM + E-Mail
    const results = await Promise.allSettled([
      // 1. CRM Lead (public external route)
      fetch('https://crm.bizzcenter.de/api/leads/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName: lastName || '(kein Nachname)',
          email: data.email,
          telefon: data.telefon,
          firma: data.firma,
          quelle: data.quelle,
          product: data.product,
          nachricht: description,
        }),
      }).then(r => r.ok ? 'crm-ok' : Promise.reject('CRM failed')),
      
      // 2. E-Mail Notification
      sendNotificationEmail({
        firstName,
        lastName,
        firma: data.firma,
        telefon: data.telefon,
        email: data.email,
        nachricht: data.nachricht || data.bemerkungen,
        quelle: data.quelle,
        product: data.product,
      }).then(() => 'email-ok'),
    ]);

    const crmSuccess = results[0].status === 'fulfilled';
    const emailSuccess = results[1].status === 'fulfilled';

    if (!crmSuccess) console.error('CRM lead creation failed:', results[0]);
    if (!emailSuccess) console.error('Email notification failed:', results[1]);

    // Success wenn mindestens einer erfolgreich
    if (crmSuccess || emailSuccess) {
      const warnings = [];
      if (!crmSuccess) warnings.push('CRM');
      if (!emailSuccess) warnings.push('E-Mail');
      
      return res.status(200).json({
        success: true,
        ...(warnings.length && { warning: `${warnings.join(' + ')} fehlgeschlagen` }),
      });
    }

    // Beide fehlgeschlagen
    return res.status(500).json({ error: 'Lead konnte nicht erstellt werden' });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
