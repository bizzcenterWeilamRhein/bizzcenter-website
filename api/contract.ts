import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail, INTERNAL_NOTIFICATION_EMAIL } from '../lib/mailer';

interface ContractSubmission {
  // Vertragsdaten
  slug: string;
  firma: string;
  rechtsform: string;
  vertreter: string;
  vertreterAnrede: string;
  email: string;
  telefon?: string;
  tarifName: string;
  tarifLaufzeit: string;
  preisNetto: number;
  preisBrutto: number;
  addons: { label: string; preisNetto: number }[];
  starttermin: string;
  
  // Signatur
  signatur: {
    dataUrl: string;
    timestamp: string;
    method: 'draw' | 'upload' | 'type';
  };
  
  // Tracking
  gclid?: string;
  
  // Dokumente (base64)
  dokumente?: {
    ausweis?: string;
    handelsregister?: string;
    transparenzregister?: string;
    gewerbeanmeldung?: string;
  };
}

function esc(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}

async function sendContractNotification(data: ContractSubmission, clientIp: string) {
  const gesamtNetto = data.preisNetto + data.addons.reduce((s, a) => s + a.preisNetto, 0);
  const signedAt = new Date(data.signatur.timestamp);

  // E-Mail an bizzcenter
  const internalHtml = `
    <h2 style="color:#6b7f3e;">Neuer Vertrag unterschrieben!</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Firma:</td><td>${esc(data.firma)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Vertreter:</td><td>${esc(data.vertreterAnrede)} ${esc(data.vertreter)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">E-Mail:</td><td><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
      ${data.telefon ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td><a href="tel:${esc(data.telefon)}">${esc(data.telefon)}</a></td></tr>` : ''}
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tarif:</td><td>${esc(data.tarifName)} (${esc(data.tarifLaufzeit)})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Monatlich netto:</td><td>EUR ${gesamtNetto.toFixed(2)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Starttermin:</td><td>${esc(data.starttermin)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Unterschrieben am:</td><td>${signedAt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Methode:</td><td>${data.signatur.method}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">IP:</td><td>${esc(clientIp)}</td></tr>
      ${data.gclid ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Google Ads GCLID:</td><td>${esc(data.gclid)}</td></tr>` : ''}
    </table>
    ${data.addons.length > 0 ? `
      <h3>Zusatzleistungen:</h3>
      <ul>${data.addons.map(a => `<li>${esc(a.label)} — EUR ${a.preisNetto.toFixed(2)} netto</li>`).join('')}</ul>
    ` : ''}
    <p style="margin-top:20px;"><a href="https://weil.bizzcenter.de/vertrag/${esc(data.slug)}" style="color:#6b7f3e;font-weight:bold;">Vertrag online ansehen</a></p>
  `;

  // E-Mail an Kunden
  const customerHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#6b7f3e;">Vielen Dank für Ihren Vertragsabschluss!</h2>
      <p>Sehr geehrte/r ${esc(data.vertreterAnrede)} ${esc(data.vertreter)},</p>
      <p>wir haben Ihren unterschriebenen Vertrag erhalten. Hier eine Zusammenfassung:</p>
      <table style="border-collapse:collapse;font-size:14px;margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Firma:</td><td>${esc(data.firma)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Adresse:</td><td>Am Kesselhaus 3, 79576 Weil am Rhein</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tarif:</td><td>${esc(data.tarifName)} (${esc(data.tarifLaufzeit)})</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Monatlich netto:</td><td>EUR ${gesamtNetto.toFixed(2)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Starttermin:</td><td>${esc(data.starttermin)}</td></tr>
      </table>
      <p><strong>Nächste Schritte:</strong></p>
      <ol>
        <li>Laden Sie die erforderlichen Dokumente hoch (Ausweis, Handelsregister etc.)</li>
        <li>Richten Sie Ihre Zahlungsmethode über Stripe ein</li>
        <li>Wir prüfen Ihre Unterlagen (innerhalb von 24 Stunden)</li>
        <li>Sie erhalten den gegengezeichneten Vertrag als PDF per E-Mail</li>
        <li>Ihre Geschäftsadresse wird zum vereinbarten Starttermin aktiviert</li>
      </ol>
      <p style="margin:16px 0;"><a href="https://weil.bizzcenter.de/vertrag/${esc(data.slug)}" style="display:inline-block;background:#6b7f3e;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Dokumente hochladen & Zahlung einrichten</a></p>
      <p style="font-size:12px;color:#666;">Oder kopieren Sie diesen Link: https://weil.bizzcenter.de/vertrag/${esc(data.slug)}</p>
      <p>Bei Fragen erreichen Sie uns unter:<br/>
      <strong>Torben Götz</strong> · <a href="tel:+4917153949009">+49 171 539 49 09</a> · <a href="mailto:weilamrhein@bizzcenter.de">weilamrhein@bizzcenter.de</a></p>
      <p style="color:#999;font-size:12px;margin-top:24px;">bizzcenter Weil am Rhein GmbH · Im Schwarzenbach 4 · 79576 Weil am Rhein</p>
    </div>
  `;

  await Promise.allSettled([
    sendMail({
      to: INTERNAL_NOTIFICATION_EMAIL,
      subject: `Vertrag unterschrieben: ${data.firma} — ${data.tarifName}`,
      html: internalHtml,
    }),
    data.email
      ? sendMail({
          to: data.email,
          subject: `Ihre Geschäftsadresse bei bizzcenter — Vertragsbestätigung`,
          html: customerHtml,
          replyTo: 'info@greenofficeweil.com',
        })
      : Promise.resolve(),
  ]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const allowedOrigins = ['https://weil.bizzcenter.de', 'https://bizzcenter-website.vercel.app'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data: ContractSubmission = req.body;

    // Validation
    if (!data.slug || !data.firma || !data.vertreter || !data.signatur?.dataUrl) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
      || req.headers['x-real-ip'] as string 
      || 'unknown';

    // 1. Vertrag in DB speichern
    let dbSuccess = false;
    try {
      const { Client } = await import('pg');
      const dbUrl = process.env.CRM_DATABASE_URL;
      if (!dbUrl) throw new Error('CRM_DATABASE_URL not configured');
      
      const client = new Client({ connectionString: dbUrl });
      await client.connect();

      // Vertrags-Tabelle erstellen falls nicht vorhanden
      await client.query(`
        CREATE TABLE IF NOT EXISTS vertraege (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug TEXT NOT NULL,
          firma TEXT NOT NULL,
          rechtsform TEXT,
          vertreter TEXT NOT NULL,
          vertreter_anrede TEXT,
          email TEXT,
          telefon TEXT,
          tarif_name TEXT NOT NULL,
          tarif_laufzeit TEXT NOT NULL,
          preis_netto NUMERIC(10,2) NOT NULL,
          preis_brutto NUMERIC(10,2),
          addons JSONB DEFAULT '[]',
          starttermin TEXT,
          signatur_data TEXT NOT NULL,
          signatur_timestamp TIMESTAMPTZ NOT NULL,
          signatur_method TEXT NOT NULL,
          client_ip TEXT,
          gclid TEXT,
          status TEXT DEFAULT 'unterschrieben',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await client.query(
        `INSERT INTO vertraege (slug, firma, rechtsform, vertreter, vertreter_anrede, email, telefon, 
          tarif_name, tarif_laufzeit, preis_netto, preis_brutto, addons, starttermin,
          signatur_data, signatur_timestamp, signatur_method, client_ip, gclid)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          data.slug, data.firma, data.rechtsform, data.vertreter, data.vertreterAnrede,
          data.email, data.telefon || null,
          data.tarifName, data.tarifLaufzeit, data.preisNetto, data.preisBrutto,
          JSON.stringify(data.addons), data.starttermin,
          data.signatur.dataUrl, data.signatur.timestamp, data.signatur.method,
          clientIp, data.gclid || null,
        ]
      );

      await client.end();
      dbSuccess = true;
    } catch (err) {
      console.error('DB insert failed:', err);
    }

    // 2. E-Mail-Benachrichtigungen senden
    let emailSuccess = false;
    try {
      await sendContractNotification(data, clientIp);
      emailSuccess = true;
    } catch (err) {
      console.error('Email failed:', err);
    }

    if (dbSuccess || emailSuccess) {
      return res.status(200).json({
        success: true,
        contractId: data.slug,
        ...((!dbSuccess || !emailSuccess) && {
          warning: `${!dbSuccess ? 'DB' : ''}${!dbSuccess && !emailSuccess ? ' + ' : ''}${!emailSuccess ? 'E-Mail' : ''} fehlgeschlagen`,
        }),
      });
    }

    return res.status(500).json({ error: 'Vertrag konnte nicht gespeichert werden' });
  } catch (err) {
    console.error('Contract API error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
