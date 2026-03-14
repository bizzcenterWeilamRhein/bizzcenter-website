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

// Mapping quelle → lesbarer Name + Seite
function getQuelleInfo(quelle: string): { name: string; seite: string } {
  const map: Record<string, { name: string; seite: string }> = {
    'buero-anfrage': { name: 'Büro-Anfrage-Formular', seite: '/weil-am-rhein/privates-buero (unten auf Seite)' },
    'beamer-buchung': { name: 'Beamer-Buchungs-Formular', seite: '/weil-am-rhein/beamer-mieten (unten auf Seite)' },
    'kontaktformular': { name: 'Kontaktformular', seite: '/kontakt (Haupt-Kontaktseite)' },
    'hero-formular': { name: 'Hero-Formular (Startseite)', seite: '/ (oben im Banner)' },
    'konferenzraum-buchung': { name: 'Konferenzraum-Buchung', seite: '/weil-am-rhein/konferenzraum-buchen' },
    'coworking-buchung': { name: 'Coworking-Buchung', seite: '/weil-am-rhein/coworking' },
    'geschaeftsadresse-buchung': { name: 'Geschäftsadresse-Buchung', seite: '/weil-am-rhein/geschaeftsadresse' },
    'anfrage-formular': { name: 'Allgemeines Anfrage-Formular', seite: '(Service-Seiten: Parkplatz, Lautsprecher, etc.)' },
  };
  return map[quelle] || { name: quelle, seite: 'unbekannt' };
}

async function sendNotificationEmail(lead: { firstName: string; lastName: string; firma?: string; telefon?: string; email?: string; nachricht?: string; quelle: string; product?: string }) {
  const token = await getM365Token();
  if (!token) {
    console.warn('M365 token not available — skipping email notification');
    return;
  }

  const quelleInfo = getQuelleInfo(lead.quelle);
  const subject = `Neue Anfrage: ${lead.firstName} ${lead.lastName}${lead.firma ? ` (${lead.firma})` : ''} — ${quelleInfo.name}`;

  const lines = [
    `<h2>Neue Anfrage über ${quelleInfo.name}</h2>`,
    `<p style="color:#666;font-size:13px;margin:0 0 16px 0;">Quelle: <strong>${quelleInfo.seite}</strong></p>`,
    `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">`,
    `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name:</td><td>${lead.firstName} ${lead.lastName}</td></tr>`,
    lead.firma ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Firma:</td><td>${lead.firma}</td></tr>` : '',
    lead.telefon ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td><a href="tel:${lead.telefon}">${lead.telefon}</a></td></tr>` : '',
    lead.email ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">E-Mail:</td><td><a href="mailto:${lead.email}">${lead.email}</a></td></tr>` : '',
    lead.product ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Produkt/Service:</td><td>${lead.product}</td></tr>` : '',
    `</table>`,
    lead.nachricht ? `<h3 style="margin:20px 0 8px 0;">Nachricht:</h3><p style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap;">${lead.nachricht}</p>` : '',
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

    // Map website form source to DB enum (LeadSource)
    const quelleToEnum: Record<string, string> = {
      'buero-anfrage': 'WEBSITE_FORM',
      'beamer-buchung': 'WEBSITE_FORM',
      'kontaktformular': 'WEBSITE_FORM',
      'hero-formular': 'WEBSITE_FORM',
      'konferenzraum-buchung': 'WEBSITE_FORM',
      'coworking-buchung': 'WEBSITE_FORM',
      'geschaeftsadresse-buchung': 'WEBSITE_FORM',
      'anfrage-formular': 'WEBSITE_FORM',
    };
    const dbQuelle = quelleToEnum[data.quelle] || 'WEBSITE_FORM';

    // Parallel: CRM + E-Mail
    const results = await Promise.allSettled([
      // 1. CRM Lead - TEMP WORKAROUND: Direct DB insert statt API
      (async () => {
        try {
          const { Client } = await import('pg');
          const client = new Client({
            connectionString: process.env.CRM_DATABASE_URL || 
              'postgresql://postgres.stvzofvgwrkuucisesgr:mjb.FWM*ptw1jnt9vtg@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
          });
          await client.connect();
          
          // 1. Find or create Kontakt
          let kontaktResult = data.email 
            ? await client.query(
                'SELECT id FROM kontakte WHERE email = $1 AND "deletedAt" IS NULL LIMIT 1',
                [data.email]
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
              [firstName, lastName || '(kein Nachname)', data.email || null, data.telefon || null]
            );
            kontaktId = insertKontakt.rows[0].id;
          }
          
          // 2. Find or create Unternehmen (if firma)
          let unternehmenId = null;
          if (data.firma) {
            const untResult = await client.query(
              'SELECT id FROM unternehmen WHERE firmenname = $1 AND "deletedAt" IS NULL LIMIT 1',
              [data.firma]
            );
            if (untResult.rows.length > 0) {
              unternehmenId = untResult.rows[0].id;
            } else {
              const insertUnt = await client.query(
                `INSERT INTO unternehmen (id, firmenname, "createdAt", "updatedAt")
                 VALUES (gen_random_uuid(), $1, NOW(), NOW())
                 RETURNING id`,
                [data.firma]
              );
              unternehmenId = insertUnt.rows[0].id;
            }
          }
          
          // 3. Create Lead (dbQuelle = valid enum value, original quelle preserved in notizen)
          await client.query(
            `INSERT INTO leads (id, "kontaktId", "unternehmenId", quelle, "bedarfKategorie", notizen, "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
            [kontaktId, unternehmenId, dbQuelle, data.product || null, description]
          );
          
          await client.end();
          return 'crm-ok';
        } catch (err) {
          console.error('Direct CRM DB insert failed:', err);
          throw err;
        }
      })(),
      
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

    const crmError = !crmSuccess && results[0].status === 'rejected' 
      ? (results[0].reason?.message || String(results[0].reason)) 
      : undefined;
    const emailError = !emailSuccess && results[1].status === 'rejected'
      ? (results[1].reason?.message || String(results[1].reason))
      : undefined;

    if (!crmSuccess) console.error('CRM lead creation failed:', crmError);
    if (!emailSuccess) console.error('Email notification failed:', emailError);

    // Success wenn mindestens einer erfolgreich
    if (crmSuccess || emailSuccess) {
      const warnings = [];
      if (!crmSuccess) warnings.push('CRM');
      if (!emailSuccess) warnings.push('E-Mail');
      
      return res.status(200).json({
        success: true,
        ...(warnings.length && { 
          warning: `${warnings.join(' + ')} fehlgeschlagen`,
        }),
      });
    }

    // Beide fehlgeschlagen
    return res.status(500).json({ error: 'Lead konnte nicht erstellt werden' });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
