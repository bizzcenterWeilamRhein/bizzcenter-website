// TEMPORARY diagnostic / template-bootstrap endpoint.
// To be removed once the English draft is in place.
//
// Actions (key=DIAG_SECRET required):
//   ?action=list                            (GET)  — list drafts in shared mailbox
//   ?action=read&id=X                       (GET)  — read message body + attachment metadata
//   ?action=clone&srcId=X                   (POST) — clone attachments from src, create new draft
//                                                    body: { subject, htmlBody }

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

const MS_TENANT_ID = process.env.MS_TENANT_ID || '';
const MS_CLIENT_ID = process.env.MS_CLIENT_ID || '';
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || '';
const SHARED_MAILBOX = 'info@greenofficeweil.com';
const DIAG_SECRET = 'diag-3fK9a-bizzcenter-temp';

const GRAPH = 'https://graph.microsoft.com/v1.0';
const MBX = `${GRAPH}/users/${encodeURIComponent(SHARED_MAILBOX)}`;

async function getToken(): Promise<string> {
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
  if (!data.access_token) throw new Error('Token failed: ' + JSON.stringify(data));
  return data.access_token;
}

interface GraphAttachment {
  '@odata.type'?: string;
  id: string;
  name: string;
  contentType: string;
  contentBytes?: string;
  contentId?: string;
  isInline: boolean;
  size?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== DIAG_SECRET) return res.status(404).end();
  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET) {
    return res.status(500).json({ error: 'missing credentials' });
  }

  const action = String(req.query.action || 'list');

  try {
    const token = await getToken();
    const auth = { Authorization: `Bearer ${token}` };

    if (action === 'list') {
      const r = await fetch(`${MBX}/mailFolders/drafts/messages?$select=id,subject,hasAttachments,lastModifiedDateTime&$top=20`, { headers: auth });
      const data = await r.json();
      return res.status(200).json({ httpStatus: r.status, value: data.value });
    }

    if (action === 'read') {
      const id = String(req.query.id || '');
      if (!id) return res.status(400).json({ error: 'missing id' });
      const m = await fetch(`${MBX}/messages/${encodeURIComponent(id)}?$select=id,subject,body,hasAttachments,bodyPreview`, { headers: auth });
      const mData = await m.json();
      const a = await fetch(`${MBX}/messages/${encodeURIComponent(id)}/attachments?$select=id,name,contentType,contentId,isInline,size`, { headers: auth });
      const aData = await a.json();
      return res.status(200).json({
        httpStatus: m.status,
        message: mData,
        attachments: (aData.value as GraphAttachment[]) || [],
      });
    }

    if (action === 'clone') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
      const srcId = String(req.query.srcId || '');
      const { subject, htmlBody } = req.body as { subject?: string; htmlBody?: string };
      if (!srcId || !subject || !htmlBody) return res.status(400).json({ error: 'missing srcId, subject or htmlBody' });

      const a = await fetch(`${MBX}/messages/${encodeURIComponent(srcId)}/attachments`, { headers: auth });
      const aData = await a.json();
      if (!a.ok) return res.status(500).json({ error: 'failed to read source attachments', details: aData });

      const clonedAttachments = ((aData.value || []) as GraphAttachment[]).map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.name,
        contentType: att.contentType,
        contentBytes: att.contentBytes,
        contentId: att.contentId,
        isInline: att.isInline,
      }));

      const create = await fetch(`${MBX}/messages`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body: { contentType: 'HTML', content: htmlBody },
          attachments: clonedAttachments,
          isDraft: true,
        }),
      });
      const cData = await create.json();
      return res.status(200).json({
        httpStatus: create.status,
        clonedAttachmentCount: clonedAttachments.length,
        result: { id: cData.id, subject: cData.subject, hasAttachments: cData.hasAttachments },
        ...(create.ok ? {} : { fullResult: cData }),
      });
    }

    return res.status(400).json({ error: 'unknown action' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
