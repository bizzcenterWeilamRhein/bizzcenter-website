import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail, INTERNAL_NOTIFICATION_EMAIL } from '../lib/mailer';
import { MAIL_SIGNATURE_WITH_WHATSAPP } from '../lib/mailSignature';

// Zendesk Sell
const ZENDESK_TOKEN = process.env.ZENDESK_SELL_API_TOKEN || '';
const ZENDESK_API = 'https://api.getbase.com/v2';

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
  bedarfKategorie?: string;
  bemerkungen?: string;
  raum?: string;
  dauer?: string;
  termine?: string[];
  addons?: string[];
  gesamtpreis?: number;
  // Product inquiry fields (structured so CRM can later generate booking from it)
  wunschterminVon?: string;
  wunschterminBis?: string;
  zeitraumFreitext?: string;
  // Marketing-Attribution (von /components/lib/marketing.ts mitgegeben)
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
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
    'geschaeftsadresse-anfrage': { name: 'Geschäftsadresse Anfrage', seite: '/geschaeftsadresse-mieten (Anfrage-Formular)' },
    'geschaeftsadresse-partial': { name: 'Geschäftsadresse (Auto-Save)', seite: '/geschaeftsadresse-mieten (Formular nicht abgeschickt)' },
    'geschaeftsadresse-partial-update': { name: 'Geschäftsadresse (Auto-Save Update)', seite: '/geschaeftsadresse-mieten (Formular nicht abgeschickt)' },
  };
  return map[quelle] || { name: quelle, seite: 'unbekannt' };
}

// Liefert den Produkt-Namen für den Zendesk-Deal-Namen ("WEIL: <Produkt>, …").
function getProduktForDealName(data: LeadData): string {
  const explicitProduct = (data.product || '').trim();
  const cat = (data.bedarfKategorie || '').trim();
  switch (data.quelle) {
    case 'buero-anfrage': return 'Büro';
    case 'geschaeftsadresse-anfrage':
    case 'geschaeftsadresse-buchung':
    case 'geschaeftsadresse-partial':
    case 'geschaeftsadresse-partial-update':
      return 'Geschäftsadresse';
    case 'konferenzraum-buchung': return 'Konferenzraum';
    case 'coworking-buchung': return 'Coworking';
    case 'beamer-buchung': return 'Beamer';
    case 'fensterputzroboter-buchung': return 'Fensterputzroboter';
    case 'angebot-vertrag': return 'Angebot/Vertrag';
    default:
      return explicitProduct || cat || 'Anfrage';
  }
}

function buildDealName(firstName: string, lastName: string, firma: string | undefined, data: LeadData): string {
  const fullName = `${firstName} ${lastName}`.trim();
  const produkt = getProduktForDealName(data);
  const parts = [`WEIL: ${produkt}`, fullName];
  if (firma && firma.trim()) parts.push(firma.trim());
  return parts.join(', ');
}

// HTML-Escape to prevent XSS in email templates
function esc(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}

function telHref(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('0')) return '+49' + cleaned.slice(1);
  return '+' + cleaned;
}

function telDisplay(raw: string): string {
  const e164 = telHref(raw);
  if (!e164) return raw;
  for (const dial of ['+352', '+351', '+353', '+358', '+385', '+386', '+420', '+421', '+359', '+380', '+49', '+41', '+33', '+43', '+39', '+31', '+32', '+34', '+44', '+48', '+45', '+46', '+47', '+30', '+36', '+40', '+90', '+1', '+7']) {
    if (e164.startsWith(dial)) {
      const rest = e164.slice(dial.length);
      return rest ? `${dial} ${rest.slice(0, 3)} ${rest.slice(3)}`.trim() : dial;
    }
  }
  return e164;
}

async function sendNotificationEmail(lead: { firstName: string; lastName: string; firma?: string; telefon?: string; email?: string; nachricht?: string; quelle: string; product?: string; wunschterminVon?: string; wunschterminBis?: string; zeitraumFreitext?: string }) {
  const quelleInfo = getQuelleInfo(lead.quelle);
  const produkt = getProduktForDealName({ quelle: lead.quelle, product: lead.product } as LeadData);
  const hasTimeRange = lead.wunschterminVon && lead.wunschterminBis;
  const subject = `${produkt}: ${lead.firstName} ${lead.lastName}`;

  // Prominent time-range block (rendered above the regular details)
  const timeRangeBlock = hasTimeRange
    ? `<div style="background:#f0f4e8;border-left:4px solid #6b7f3e;padding:12px 16px;margin:0 0 16px 0;border-radius:4px;">
         <p style="margin:0 0 4px 0;font-size:12px;font-weight:bold;color:#6b7f3e;text-transform:uppercase;letter-spacing:0.05em;">Wunschtermin</p>
         <p style="margin:0;font-size:16px;font-weight:600;color:#1f2a37;">${esc(lead.wunschterminVon!)} — ${esc(lead.wunschterminBis!)}</p>
         ${lead.zeitraumFreitext ? `<p style="margin:4px 0 0 0;font-size:14px;color:#374151;">Zeitraum: ${esc(lead.zeitraumFreitext)}</p>` : ''}
       </div>`
    : '';

  const lines = [
    `<h2>Neue ${esc(produkt)}-Anfrage</h2>`,
    `<p style="color:#666;font-size:13px;margin:0 0 16px 0;">Quelle: <strong>${esc(quelleInfo.seite)}</strong></p>`,
    lead.product && lead.product !== produkt ? `<p style="font-size:15px;margin:0 0 12px 0;"><strong>Produkt/Service:</strong> ${esc(lead.product)}</p>` : '',
    timeRangeBlock,
    `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">`,
    `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name:</td><td>${esc(lead.firstName)} ${esc(lead.lastName)}</td></tr>`,
    lead.firma ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Firma:</td><td>${esc(lead.firma)}</td></tr>` : '',
    lead.telefon ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td><a href="tel:${esc(telHref(lead.telefon))}">${esc(telDisplay(lead.telefon))}</a></td></tr>` : '',
    lead.email ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">E-Mail:</td><td><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></td></tr>` : '',
    `</table>`,
    lead.nachricht ? `<h3 style="margin:20px 0 8px 0;">Nachricht:</h3><p style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap;">${esc(lead.nachricht)}</p>` : '',
  ].filter(Boolean).join('\n');

  await sendMail({
    to: INTERNAL_NOTIFICATION_EMAIL,
    subject,
    html: lines,
  });
}

async function sendCustomerConfirmation(lead: { firstName: string; email: string; product?: string; wunschterminVon?: string; wunschterminBis?: string; zeitraumFreitext?: string }) {
  const hasTimeRange = lead.wunschterminVon && lead.wunschterminBis;
  const isProductInquiry = !!lead.product && hasTimeRange;
  const subject = isProductInquiry
    ? `Ihre Anfrage bei bizzcenter: ${esc(lead.product!)}`
    : 'Ihre Anfrage bei bizzcenter Weil am Rhein';

  const intro = isProductInquiry
    ? `<p>vielen Dank für Ihre Anfrage zu <strong>${esc(lead.product!)}</strong>.</p>
       <p>Wir prüfen die Verfügbarkeit für den gewünschten Zeitraum und melden uns innerhalb von <strong>24 Stunden (werktags)</strong> bei Ihnen.</p>`
    : `<p>vielen Dank für Ihre Anfrage. Wir melden uns innerhalb von <strong>24 Stunden (werktags)</strong> bei Ihnen.</p>`;

  const summary = isProductInquiry
    ? `<div style="background:#f5f0eb;border-radius:8px;padding:16px;margin:16px 0;">
         <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;color:#6b7f3e;text-transform:uppercase;letter-spacing:0.05em;">Ihre Anfrage</p>
         <p style="margin:0 0 4px 0;"><strong>Produkt:</strong> ${esc(lead.product!)}</p>
         <p style="margin:0;"><strong>Wunschtermin:</strong> ${esc(lead.wunschterminVon!)} — ${esc(lead.wunschterminBis!)}</p>
         ${lead.zeitraumFreitext ? `<p style="margin:4px 0 0 0;"><strong>Zeitraum:</strong> ${esc(lead.zeitraumFreitext)}</p>` : ''}
       </div>`
    : '';

  const body = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2a37;max-width:600px;">
      <p>Hallo ${esc(lead.firstName)},</p>
      ${intro}
      ${summary}
      ${MAIL_SIGNATURE_WITH_WHATSAPP}
    </div>
  `;

  await sendMail({
    to: lead.email,
    subject,
    html: body,
    replyTo: 'info@greenofficeweil.com',
  });
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

    // Test-Marker: "test" in Vor- oder Nachnamen (case-insensitive) überspringt
    // alle externen Side-Effects (CRM-DB, Zendesk, Windmill). E-Mails werden trotzdem
    // verschickt, damit der Mailer end-to-end testbar bleibt.
    const isTestLead = /test/i.test(firstName) || /test/i.test(lastName);
    if (isTestLead) {
      console.log('Test-Lead erkannt (Marker "test" in Name) — Side-Effects werden übersprungen');
    }

    // Beschreibung zusammenbauen
    const descParts: string[] = [];
    descParts.push(`Quelle: ${data.quelle}`);
    if (data.product) descParts.push(`Produkt: ${data.product}`);
    if (data.wunschterminVon && data.wunschterminBis) {
      descParts.push(`Wunschtermin: ${data.wunschterminVon} bis ${data.wunschterminBis}`);
    }
    if (data.zeitraumFreitext) descParts.push(`Zeitraum: ${data.zeitraumFreitext}`);
    if (data.anrede) descParts.push(`Anrede: ${data.anrede}`);
    if (data.telefon) descParts.push(`Telefon: ${data.telefon}`);
    if (data.raum) descParts.push(`Raum: ${data.raum}`);
    if (data.dauer) descParts.push(`Dauer: ${data.dauer}`);
    if (data.termine?.length) descParts.push(`Termine: ${data.termine.join(', ')}`);
    if (data.addons?.length) descParts.push(`Add-ons: ${data.addons.join(', ')}`);
    if (data.gesamtpreis) descParts.push(`Gesamtpreis: EUR ${data.gesamtpreis},- zzgl. MwSt.`);

    // Vorgeschlagener Deal-Name fürs Zendesk-Konvertieren (Format: "WEIL: <Produkt>, <Name>, <Firma>").
    // Zendesk Sell bietet keine API zum Vorbelegen des Deal-Names — daher steht der Vorschlag
    // als erste Zeile in der Beschreibung, von wo Torben ihn beim Konvertieren ins
    // "Geschäftsname"-Feld kopiert.
    const dealNameSuggestion = buildDealName(firstName, lastName, data.firma, data);

    const descriptionForZendesk = [
      `[Geschäftsname-Vorschlag]`,
      dealNameSuggestion,
      ``,
      ...descParts,
    ].join('\n');

    if (data.nachricht) descParts.push(`Nachricht: ${data.nachricht}`);
    if (data.bemerkungen) descParts.push(`Bemerkungen: ${data.bemerkungen}`);
    const description = descParts.join('\n');

    const zendeskNoteContent = [
      data.nachricht && `Nachricht: ${data.nachricht}`,
      data.bemerkungen && `Bemerkungen: ${data.bemerkungen}`,
    ].filter(Boolean).join('\n\n');

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
      'geschaeftsadresse-anfrage': 'WEBSITE_FORM',
      'geschaeftsadresse-partial': 'WEBSITE_FORM',
      'geschaeftsadresse-partial-update': 'WEBSITE_FORM',
    };
    const dbQuelle = quelleToEnum[data.quelle] || 'WEBSITE_FORM';

    // CRM-Lead-ID wird im ersten Promise gesetzt (aus RETURNING id des INSERT).
    // Wird am Ende im Response an den Client zurückgegeben, damit
    // Tracking-Events (trackLeadSubmitted) mit der Lead-ID verknüpft werden können.
    let crmLeadId: string | undefined;

    // Parallel: CRM + E-Mail + Zendesk Sell
    const results = await Promise.allSettled([
      // 1. CRM Lead - Direct DB insert
      (async () => {
        if (isTestLead) return 'crm-skipped-test';
        try {
          const { Client } = await import('pg');
          const dbUrl = process.env.CRM_DATABASE_URL;
          if (!dbUrl) throw new Error('CRM_DATABASE_URL not configured');
          const client = new Client({ connectionString: dbUrl });
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
          const insertLead = await client.query(
            `INSERT INTO leads (id, "kontaktId", "unternehmenId", quelle, "bedarfKategorie", notizen, "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING id`,
            [kontaktId, unternehmenId, dbQuelle, data.product || null, description]
          );
          crmLeadId = insertLead.rows[0]?.id;

          await client.end();
          return 'crm-ok';
        } catch (err) {
          console.error('Direct CRM DB insert failed:', err);
          throw err;
        }
      })(),
      
      // 2. E-Mail Notification ans Team
      sendNotificationEmail({
        firstName,
        lastName,
        firma: data.firma,
        telefon: data.telefon,
        email: data.email,
        nachricht: data.nachricht || data.bemerkungen,
        quelle: data.quelle,
        product: data.product,
        wunschterminVon: data.wunschterminVon,
        wunschterminBis: data.wunschterminBis,
        zeitraumFreitext: data.zeitraumFreitext,
      }).then(() => 'email-ok'),

      // 2b. Bestätigungsmail an den Kunden (nur wenn E-Mail vorhanden)
      data.email
        ? sendCustomerConfirmation({
            firstName,
            email: data.email,
            product: data.product,
            wunschterminVon: data.wunschterminVon,
            wunschterminBis: data.wunschterminBis,
            zeitraumFreitext: data.zeitraumFreitext,
          }).then(() => 'customer-ok')
        : Promise.resolve('customer-skipped'),

      // 3. Zendesk Sell Lead (+ Notiz)
      (async () => {
        if (isTestLead) return 'zendesk-skipped-test';
        if (!ZENDESK_TOKEN) throw new Error('ZENDESK_SELL_API_TOKEN not configured');
        if (!data.email && !data.firma) throw new Error('No email or firma for Zendesk');

        const tags = ['website', data.quelle || 'anfrage'];
        if (data.product) tags.push(data.product);

        const zdRes = await fetch(`${ZENDESK_API}/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ZENDESK_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              first_name: firstName,
              last_name: lastName || undefined,
              organization_name: data.firma || undefined,
              email: data.email || undefined,
              phone: data.telefon || undefined,
              description: descriptionForZendesk,
              tags,
            },
          }),
        });

        if (!zdRes.ok) {
          const errBody = await zdRes.text().catch(() => '');
          throw new Error(`Zendesk ${zdRes.status}: ${errBody}`);
        }

        // Nachricht als Notiz an den Lead anhängen — überlebt Lead → Kontakt → Geschäft Konvertierung.
        if (zendeskNoteContent) {
          const zdLead = await zdRes.json().catch(() => null);
          const leadId = zdLead?.data?.id;
          if (leadId) {
            const noteRes = await fetch(`${ZENDESK_API}/notes`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${ZENDESK_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: {
                  resource_type: 'lead',
                  resource_id: leadId,
                  content: zendeskNoteContent,
                },
              }),
            });
            if (!noteRes.ok) {
              const errBody = await noteRes.text().catch(() => '');
              console.error(`Zendesk note creation failed: ${noteRes.status}: ${errBody}`);
              // Note-Failure soll den ganzen Zendesk-Promise nicht killen — der Lead ist ja schon angelegt.
            }
          }
        }

        return 'zendesk-ok';
      })(),

      // 4. Windmill-Webhook → Telegram-Notification + MS-To-Do-Task
      (async () => {
        if (isTestLead) return 'windmill-skipped-test';
        const url = process.env.WINDMILL_LEAD_WEBHOOK_URL;
        if (!url) return 'windmill-skipped-no-env';
        const wmRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: data.email || '',
            phone: data.telefon || '',
            firma: data.firma || '',
            quelle: data.quelle || '',
            bedarfKategorie: data.bedarfKategorie || '',
            product: data.product || '',
            nachricht: description,
            // Marketing-Attribution (alle optional)
            gclid: data.gclid || '',
            utm_source: data.utm_source || '',
            utm_medium: data.utm_medium || '',
            utm_campaign: data.utm_campaign || '',
            utm_term: data.utm_term || '',
            utm_content: data.utm_content || '',
            referrer: data.referrer || '',
            landing_page: data.landing_page || '',
          }),
        });
        if (!wmRes.ok) {
          const errBody = await wmRes.text().catch(() => '');
          throw new Error(`Windmill ${wmRes.status}: ${errBody.slice(0, 200)}`);
        }
        return 'windmill-ok';
      })(),
    ]);

    const crmSuccess = results[0].status === 'fulfilled';
    const emailSuccess = results[1].status === 'fulfilled';
    const customerSuccess = results[2].status === 'fulfilled';
    const zendeskSuccess = results[3].status === 'fulfilled';
    const windmillSuccess = results[4].status === 'fulfilled';

    if (!crmSuccess) console.error('CRM lead creation failed:', results[0].status === 'rejected' ? results[0].reason : 'unknown');
    if (!emailSuccess) console.error('Email notification failed:', results[1].status === 'rejected' ? results[1].reason : 'unknown');
    if (!customerSuccess) console.error('Customer confirmation failed:', results[2].status === 'rejected' ? results[2].reason : 'unknown');
    if (!zendeskSuccess) console.error('Zendesk Sell lead failed:', results[3].status === 'rejected' ? results[3].reason : 'unknown');
    if (!windmillSuccess) console.error('Windmill webhook failed:', results[4].status === 'rejected' ? results[4].reason : 'unknown');

    // Success wenn mindestens einer erfolgreich
    if (crmSuccess || emailSuccess || zendeskSuccess) {
      const warnings: string[] = [];
      if (!crmSuccess) warnings.push('CRM');
      if (!emailSuccess) warnings.push('E-Mail');
      if (!zendeskSuccess) warnings.push('Zendesk');
      
      return res.status(200).json({
        success: true,
        ...(crmLeadId && { leadId: crmLeadId }),
        ...(warnings.length && {
          warning: `${warnings.join(' + ')} fehlgeschlagen`,
        }),
      });
    }

    // Alle fehlgeschlagen
    return res.status(500).json({ error: 'Lead konnte nicht erstellt werden' });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
