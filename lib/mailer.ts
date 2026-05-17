import { JWT } from 'google-auth-library';

const SA_JSON = process.env.GMAIL_SA_JSON || '';
const IMPERSONATE_USER = 'torben@greenofficeweil.com';
const SENDER_FROM = 'info@greenofficeweil.com';

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

function getClient(): JWT | null {
  if (cachedClient) return cachedClient;
  if (!SA_JSON) return null;
  try {
    const credentials = JSON.parse(SA_JSON);
    cachedClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      subject: IMPERSONATE_USER,
    });
    return cachedClient;
  } catch (err) {
    console.error('mailer: GMAIL_SA_JSON parse failed', err);
    return null;
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
  const client = getClient();
  if (!client) {
    console.error('sendMail: GMAIL_SA_JSON missing or invalid — mail not sent');
    return false;
  }
  try {
    const raw = toBase64Url(Buffer.from(buildMessage(args), 'utf8'));
    const res = await client.request<{ id?: string }>({
      method: 'POST',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      data: { raw },
    });
    return res.status >= 200 && res.status < 300;
  } catch (err) {
    console.error('sendMail failed:', err);
    return false;
  }
}
