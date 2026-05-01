// TEMPORARY diagnostic endpoint — to be removed after Graph access verification.
// Checks whether the existing Microsoft Graph credentials can read drafts
// from the info@greenofficeweil.com shared mailbox.

import type { NextApiRequest, NextApiResponse } from 'next';

const MS_TENANT_ID = process.env.MS_TENANT_ID || '';
const MS_CLIENT_ID = process.env.MS_CLIENT_ID || '';
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || '';
const SHARED_MAILBOX = 'info@greenofficeweil.com';
const DIAG_SECRET = 'diag-3fK9a-bizzcenter-temp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== DIAG_SECRET) {
    return res.status(404).end();
  }

  const out: Record<string, unknown> = {};

  out.envCheck = {
    MS_TENANT_ID: !!MS_TENANT_ID,
    MS_CLIENT_ID: !!MS_CLIENT_ID,
    MS_CLIENT_SECRET: !!MS_CLIENT_SECRET,
  };

  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET) {
    return res.status(200).json({ ...out, error: 'missing credentials' });
  }

  // Get token
  let token: string;
  try {
    const tokRes = await fetch(`https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    const tokData = await tokRes.json();
    out.tokenStatus = tokRes.status;
    if (!tokData.access_token) {
      return res.status(200).json({ ...out, error: 'token failed', details: tokData });
    }
    token = tokData.access_token;
  } catch (err) {
    return res.status(200).json({ ...out, error: 'token request error', details: String(err) });
  }

  // Try listing drafts
  const draftsUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SHARED_MAILBOX)}/mailFolders/drafts/messages?$select=id,subject,hasAttachments,lastModifiedDateTime&$top=20`;
  try {
    const dRes = await fetch(draftsUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    out.draftsStatus = dRes.status;
    const dBody = await dRes.text();
    if (!dRes.ok) {
      return res.status(200).json({ ...out, error: 'drafts read failed', body: dBody });
    }
    const dData = JSON.parse(dBody);
    out.draftsCount = (dData.value || []).length;
    out.drafts = (dData.value || []).map((m: { id: string; subject?: string; hasAttachments?: boolean; lastModifiedDateTime?: string }) => ({
      id: m.id,
      subject: m.subject,
      hasAttachments: m.hasAttachments,
      lastModifiedDateTime: m.lastModifiedDateTime,
    }));
  } catch (err) {
    return res.status(200).json({ ...out, error: 'drafts request error', details: String(err) });
  }

  return res.status(200).json(out);
}
