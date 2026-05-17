import { JWT } from 'google-auth-library';

const SA_JSON = process.env.GMAIL_SA_JSON || '';
const IMPERSONATE_USER = 'torben@greenofficeweil.com';
const SENDER_FROM = '"bizzcenter Weil am Rhein" <info@greenofficeweil.com>';

export const INTERNAL_NOTIFICATION_EMAIL =
  process.env.INTERNAL_NOTIFICATION_EMAIL || 'torben@greenofficeweil.com';

export interface MailAttachment {
  name: string;
  contentType: string;
  contentBase64: string;
}

export interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}

let cachedClient: JWT | null = null;
let lastClientError: string | null = null;

function getClient(): JWT | null {
  if (cachedClient) return cachedClient;
  if (!SA_JSON) {
    lastClientError = 'GMAIL_SA_JSON env var is empty or unset';
    return null;
  }
  try {
    const credentials = JSON.parse(SA_JSON);
    if (!credentials.client_email || !credentials.private_key) {
      lastClientError = 'GMAIL_SA_JSON is missing client_email or private_key';
      return null;
    }
    // Vercel speichert mehrzeilige Werte häufig als String mit literalen \n —
    // Google's JWT erwartet aber echte Zeilenumbrüche im PEM-Format.
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');
    cachedClient = new JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      subject: IMPERSONATE_USER,
    });
    return cachedClient;
  } catch (err) {
    lastClientError = `GMAIL_SA_JSON parse failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error('mailer:', lastClientError);
    return null;
  }
}

export interface SendMailResult {
  ok: boolean;
  error?: string;
  status?: number;
  messageId?: string;
}

export async function sendMailVerbose(args: SendMailArgs): Promise<SendMailResult> {
  const client = getClient();
  if (!client) {
    return { ok: false, error: lastClientError ?? 'client unavailable' };
  }
  try {
    const raw = toBase64Url(Buffer.from(buildMessage(args), 'utf8'));
    const res = await client.request<{ id?: string }>({
      method: 'POST',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      data: { raw },
    });
    const ok = res.status >= 200 && res.status < 300;
    return { ok, status: res.status, messageId: res.data?.id };
  } catch (err: any) {
    const msg = err?.response?.data
      ? JSON.stringify(err.response.data)
      : err?.message || String(err);
    console.error('sendMail failed:', msg);
    return { ok: false, error: msg, status: err?.response?.status };
  }
}

function encodeSubject(s: string): string {
  return `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`;
}

function toBase64Url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildMessage(args: SendMailArgs): string {
  const boundary = `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const hasAttachments = args.attachments && args.attachments.length > 0;

  const headers = [
    `From: ${SENDER_FROM}`,
    `To: ${args.to}`,
    ...(args.replyTo ? [`Reply-To: ${args.replyTo}`] : []),
    `Subject: ${encodeSubject(args.subject)}`,
    'MIME-Version: 1.0',
  ];

  if (!hasAttachments) {
    return [
      ...headers,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(args.html, 'utf8').toString('base64'),
    ].join('\r\n');
  }

  const parts: string[] = [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(args.html, 'utf8').toString('base64'),
  ];

  for (const att of args.attachments!) {
    parts.push(
      '',
      `--${boundary}`,
      `Content-Type: ${att.contentType}; name="${att.name}"`,
      `Content-Disposition: attachment; filename="${att.name}"`,
      'Content-Transfer-Encoding: base64',
      '',
      att.contentBase64,
    );
  }

  parts.push('', `--${boundary}--`);
  return parts.join('\r\n');
}

export async function sendMail(args: SendMailArgs): Promise<boolean> {
  const result = await sendMailVerbose(args);
  return result.ok;
}
