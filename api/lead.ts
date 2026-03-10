import type { VercelRequest, VercelResponse } from '@vercel/node';

const ZENDESK_TOKEN = process.env.ZENDESK_SELL_API_TOKEN || '';
const ZENDESK_API = 'https://api.getbase.com/v2';

interface LeadData {
  firma?: string;
  anrede?: string;
  name: string;
  email: string;
  telefon?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  quelle: string; // z.B. 'kontakt', 'konferenzraum-buchung', 'coworking', 'geschaeftsadresse'
  bemerkungen?: string;
  // Buchungsspezifisch
  raum?: string;
  dauer?: string;
  termine?: string[];
  addons?: string[];
  gesamtpreis?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data: LeadData = req.body;

    if (!data.name || !data.email) {
      return res.status(400).json({ error: 'Name und E-Mail sind Pflichtfelder.' });
    }

    // Name aufsplitten
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Beschreibung zusammenbauen
    const descParts: string[] = [];
    descParts.push(`Quelle: ${data.quelle}`);
    if (data.anrede) descParts.push(`Anrede: ${data.anrede}`);
    if (data.raum) descParts.push(`Raum: ${data.raum}`);
    if (data.dauer) descParts.push(`Dauer: ${data.dauer}`);
    if (data.termine?.length) descParts.push(`Termine: ${data.termine.join(', ')}`);
    if (data.addons?.length) descParts.push(`Add-ons: ${data.addons.join(', ')}`);
    if (data.gesamtpreis) descParts.push(`Gesamtpreis: EUR ${data.gesamtpreis},- zzgl. MwSt.`);
    if (data.bemerkungen) descParts.push(`Bemerkungen: ${data.bemerkungen}`);

    const description = descParts.join('\n');

    // Zendesk Sell Lead erstellen
    const zendeskPayload = {
      data: {
        first_name: firstName,
        last_name: lastName,
        organization_name: data.firma || undefined,
        email: data.email,
        phone: data.telefon || undefined,
        address: (data.strasse || data.plz || data.ort) ? {
          line1: data.strasse || undefined,
          postal_code: data.plz || undefined,
          city: data.ort || undefined,
          country: 'DE',
        } : undefined,
        description,
        tags: ['website', data.quelle],
      },
    };

    const zendeskRes = await fetch(`${ZENDESK_API}/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZENDESK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zendeskPayload),
    });

    const zendeskData = await zendeskRes.json();

    if (!zendeskRes.ok) {
      console.error('Zendesk Sell error:', JSON.stringify(zendeskData));
      return res.status(502).json({ error: 'Lead konnte nicht gespeichert werden.', detail: zendeskData });
    }

    return res.status(200).json({
      success: true,
      leadId: zendeskData.data?.id,
    });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: 'Interner Fehler' });
  }
}
