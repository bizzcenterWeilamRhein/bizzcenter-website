import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMailVerbose, INTERNAL_NOTIFICATION_EMAIL } from '../lib/mailer';

// TEMPORÄRER Diagnose-Endpunkt für Gmail-API-Migration.
// Schutz: ?secret=... muss MAIL_TEST_SECRET entsprechen.
// Schickt eine Test-Mail und gibt die exakte API-Antwort/Fehlermeldung zurück.
//
// Beispiel:
//   https://weil.bizzcenter.de/api/mail-diagnose?secret=XXX
//   https://weil.bizzcenter.de/api/mail-diagnose?secret=XXX&to=test@example.com

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expected = process.env.MAIL_TEST_SECRET;
  if (!expected) {
    return res.status(503).json({ error: 'MAIL_TEST_SECRET nicht gesetzt' });
  }
  if (req.query.secret !== expected) {
    return res.status(401).json({ error: 'invalid secret' });
  }

  const to = (typeof req.query.to === 'string' ? req.query.to : '') || INTERNAL_NOTIFICATION_EMAIL;
  const ts = new Date().toISOString();

  // Pre-flight check: ist GMAIL_SA_JSON überhaupt gesetzt + parsebar?
  const saJson = process.env.GMAIL_SA_JSON || '';
  const diagnose = {
    timestamp: ts,
    to,
    env_check: {
      GMAIL_SA_JSON_set: !!saJson,
      GMAIL_SA_JSON_length: saJson.length,
      starts_with_brace: saJson.trim().startsWith('{'),
      ends_with_brace: saJson.trim().endsWith('}'),
    },
    parse_check: null as { ok: boolean; client_email?: string; has_private_key?: boolean; private_key_starts_with?: string; error?: string } | null,
    send_result: null as { ok: boolean; error?: string; status?: number; messageId?: string } | null,
  };

  try {
    const creds = JSON.parse(saJson);
    diagnose.parse_check = {
      ok: true,
      client_email: creds.client_email,
      has_private_key: !!creds.private_key,
      private_key_starts_with: creds.private_key ? creds.private_key.substring(0, 30) : undefined,
    };
  } catch (e) {
    diagnose.parse_check = { ok: false, error: e instanceof Error ? e.message : String(e) };
    return res.status(500).json(diagnose);
  }

  diagnose.send_result = await sendMailVerbose({
    to,
    subject: `Gmail-API Diagnose-Test ${ts}`,
    html: `<p>Test vom Diagnose-Endpunkt.</p>
      <p>Zeitstempel: ${ts}</p>
      <p>Falls diese Mail ankommt: Gmail-API funktioniert.</p>`,
  });

  const httpStatus = diagnose.send_result.ok ? 200 : 500;
  return res.status(httpStatus).json(diagnose);
}
