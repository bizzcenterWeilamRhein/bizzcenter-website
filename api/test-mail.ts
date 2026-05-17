import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail, INTERNAL_NOTIFICATION_EMAIL } from '../lib/mailer';

// TEMPORÄRER Test-Endpunkt — nach erfolgreicher Gmail-API-Migration entfernen.
// Schutz: ?secret=... muss MAIL_TEST_SECRET entsprechen.
//
// Beispiel-Aufruf:
//   curl "https://<deployment>.vercel.app/api/test-mail?secret=XXX&to=test@example.com"
//
// Triggert KEINE Side-Effects (kein Zendesk, kein Sheets, kein Telegram, keine DB).

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expected = process.env.MAIL_TEST_SECRET;
  if (!expected) {
    return res.status(503).json({ error: 'MAIL_TEST_SECRET not configured' });
  }
  if (req.query.secret !== expected) {
    return res.status(401).json({ error: 'invalid secret' });
  }

  const to = (typeof req.query.to === 'string' ? req.query.to : '') || INTERNAL_NOTIFICATION_EMAIL;
  const ts = new Date().toISOString();

  const ok = await sendMail({
    to,
    subject: `Mailer-Test ${ts}`,
    html: `
      <p>Dies ist eine Test-Mail vom neuen Gmail-API-Mailer.</p>
      <ul>
        <li><strong>Zeitstempel:</strong> ${ts}</li>
        <li><strong>Empfänger:</strong> ${to}</li>
        <li><strong>Erwarteter Absender:</strong> info@greenofficeweil.com</li>
      </ul>
      <p>Wenn diese Mail ankommt, funktioniert die Migration. Der Endpunkt wird danach wieder entfernt.</p>
    `,
  });

  return res.status(ok ? 200 : 500).json({ sent: ok, to, ts });
}
