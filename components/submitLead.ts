export interface LeadPayload {
  firma?: string;
  anrede?: string;
  name: string;
  email: string;
  telefon?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  quelle: string;
  bemerkungen?: string;
  raum?: string;
  dauer?: string;
  termine?: string[];
  addons?: string[];
  gesamtpreis?: number;
}

export async function submitLead(data: LeadPayload): Promise<{ success: boolean; leadId?: number; error?: string }> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json.error || 'Unbekannter Fehler' };
    }

    return { success: true, leadId: json.leadId };
  } catch {
    return { success: false, error: 'Netzwerkfehler — bitte versuchen Sie es erneut.' };
  }
}
