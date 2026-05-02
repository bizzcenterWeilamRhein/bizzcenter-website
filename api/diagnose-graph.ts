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

    if (action === 'find') {
      const subject = String(req.query.subject || '');
      if (!subject) return res.status(400).json({ error: 'missing subject' });
      const filter = `subject eq '${subject.replace(/'/g, "''")}'`;
      const url = `${MBX}/mailFolders/drafts/messages?$filter=${encodeURIComponent(filter)}&$top=5&$select=id,subject`;
      const r = await fetch(url, { headers: auth });
      const data = await r.json();
      return res.status(200).json({ httpStatus: r.status, url, found: (data.value || []).length, data });
    }

    if (action === 'simulate-welcome') {
      const to = String(req.query.to || '');
      const localeParam = String(req.query.locale || 'de');
      if (!to) return res.status(400).json({ error: 'missing to' });
      const subjects: Record<string, string> = {
        de: 'bizzcenter Weil am Rhein | Coworking Tagespass | Anfahrtsbeschreibung | Infos',
        en: 'bizzcenter Weil am Rhein | Coworking Day Pass | Directions | Information',
      };
      const subject = subjects[localeParam] || subjects.de;
      const filter = `subject eq '${subject.replace(/'/g, "''")}'`;
      const listRes = await fetch(`${MBX}/mailFolders/drafts/messages?$filter=${encodeURIComponent(filter)}&$top=1&$select=id,subject`, { headers: auth });
      const listData = await listRes.json();
      const draft = listData.value?.[0];
      if (!draft) return res.status(200).json({ step: 'find-draft', failed: true, listStatus: listRes.status, listData });

      const msgRes = await fetch(`${MBX}/messages/${encodeURIComponent(draft.id)}?$select=subject,body`, { headers: auth });
      const msg = await msgRes.json();
      const attRes = await fetch(`${MBX}/messages/${encodeURIComponent(draft.id)}/attachments`, { headers: auth });
      const attData = await attRes.json();
      const attachments = ((attData.value || []) as GraphAttachment[]).map(a => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: a.name,
        contentType: a.contentType,
        contentBytes: a.contentBytes,
        contentId: a.contentId,
        isInline: a.isInline,
      }));
      const payload = {
        message: {
          subject: msg.subject,
          body: { contentType: msg.body?.contentType, content: msg.body?.content },
          toRecipients: [{ emailAddress: { address: to } }],
          attachments,
        },
        saveToSentItems: true,
      };
      const payloadStr = JSON.stringify(payload);
      const sendRes = await fetch(`${MBX}/sendMail`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: payloadStr,
      });
      return res.status(200).json({
        draftId: draft.id,
        draftSubject: msg.subject,
        bodyLength: msg.body?.content?.length,
        attachmentCount: attachments.length,
        payloadSizeBytes: payloadStr.length,
        payloadSizeMB: (payloadStr.length / 1024 / 1024).toFixed(2),
        sendStatus: sendRes.status,
        sendResponse: sendRes.ok ? 'OK' : await sendRes.text(),
      });
    }

    if (action === 'test-send') {
      const to = String(req.query.to || '');
      if (!to) return res.status(400).json({ error: 'missing to' });
      const sendRes = await fetch(`${MBX}/sendMail`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            subject: 'Test from diagnose-graph',
            body: { contentType: 'Text', content: 'Test mail aus dem bizzcenter diagnose-graph Endpoint.' },
            toRecipients: [{ emailAddress: { address: to } }],
          },
          saveToSentItems: false,
        }),
      });
      const txt = sendRes.ok ? 'OK' : await sendRes.text();
      return res.status(200).json({ httpStatus: sendRes.status, response: txt });
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
