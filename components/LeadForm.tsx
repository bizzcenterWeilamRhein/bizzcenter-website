'use client';

import React, { useState } from 'react';

interface LeadFormProps {
  standort: string;
  angebotSlug: string;
  title?: string;
  description?: string;
}

export function LeadForm({ standort, angebotSlug, title, description }: LeadFormProps) {
  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = anrede && vorname && nachname && firma && email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);

    const leadData = {
      anrede,
      vorname,
      nachname,
      firma,
      email,
      telefon,
      nachricht,
      standort,
      timestamp: new Date().toISOString(),
      source: 'geschaeftsadresse-formular',
    };

    // Lead erfassen (fire-and-forget — Angebot wird trotzdem geladen)
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
    } catch {
      // Lead-Capture fehlgeschlagen — nicht blockieren
    }

    // Weiterleitung zum Angebot mit vorausgefüllten Daten
    const params = new URLSearchParams({
      anrede,
      vorname,
      nachname,
      firma,
      email,
      ...(telefon && { telefon }),
      ...(nachricht && { nachricht }),
    });

    window.location.href = `/angebot/${angebotSlug}?${params.toString()}`;
  };

  return (
    <div id="formular" className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8">
        {title && <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Anrede + Name */}
          <div className="grid grid-cols-[130px_1fr_1fr] gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Anrede *</label>
              <select
                value={anrede}
                onChange={e => setAnrede(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="">Bitte...</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Herr Dr.">Herr Dr.</option>
                <option value="Frau Dr.">Frau Dr.</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Vorname *</label>
              <input type="text" value={vorname} onChange={e => setVorname(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Name *</label>
              <input type="text" value={nachname} onChange={e => setNachname(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>
          </div>

          {/* Firma */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Firma *</label>
            <input type="text" value={firma} onChange={e => setFirma(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
          </div>

          {/* E-Mail + Telefon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">E-Mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Telefon</label>
              <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="+49..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>
          </div>

          {/* Nachricht */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Nachricht</label>
            <textarea value={nachricht} onChange={e => setNachricht(e.target.value)} rows={3}
              placeholder="Ihre Fragen oder Anmerkungen..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] resize-none" />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className={`w-full rounded-lg py-3 text-sm font-bold transition-all ${
              canSubmit && !sending
                ? 'bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? 'Angebot wird erstellt...' : 'Angebot erstellen'}
          </button>

          <p className="text-[10px] text-muted-foreground text-center">
            Kostenlos und unverbindlich. Wir melden uns innerhalb von 24 Stunden.
          </p>
        </form>
      </div>
    </div>
  );
}
