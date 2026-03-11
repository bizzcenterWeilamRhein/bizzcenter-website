'use client';

import React, { useState } from 'react';

interface LeadFormProps {
  standort: string;
  angebotSlug: string;
  title?: string;
  description?: string;
}

const TARIFE = [
  { id: '12m', laufzeit: '12 Monate', kuendigung: 'zum Quartalsende', preis: 49, beliebt: true },
  { id: '6m', laufzeit: '6 Monate', kuendigung: 'zum Quartalsende', preis: 69 },
  { id: '3m', laufzeit: '3 Monate', kuendigung: 'zum Quartalsende', preis: 99 },
];

const POSTVERSAND_AUFPREIS = 30; // EUR/Monat

export function LeadForm({ standort, angebotSlug, title, description }: LeadFormProps) {
  const [step, setStep] = useState(1);
  const [selectedTarif, setSelectedTarif] = useState('12m');
  const [mitPostversand, setMitPostversand] = useState(false);
  // Postversand Aufpreis — einheitlich

  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);

  const tarif = TARIFE.find(t => t.id === selectedTarif)!;
  const monatspreis = tarif.preis + (mitPostversand ? POSTVERSAND_AUFPREIS : 0);

  const canSubmit = anrede && vorname && nachname && firma && email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);

    const leadData = {
      anrede, vorname, nachname, firma, email, telefon, nachricht, standort,
      tarif: tarif.laufzeit,
      postversand: mitPostversand,
      monatspreis,
      timestamp: new Date().toISOString(),
      source: 'geschaeftsadresse-formular',
    };

    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
    } catch { /* Lead-Capture fehlgeschlagen — nicht blockieren */ }

    const params = new URLSearchParams({
      anrede, vorname, nachname, firma, email,
      ...(telefon && { telefon }),
      ...(nachricht && { nachricht }),
      tarif: tarif.id,
      postversand: mitPostversand ? 'ja' : 'nein',
    });

    window.location.href = `/angebot/${angebotSlug}?${params.toString()}`;
  };

  const inputCls = "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]";
  const labelCls = "text-xs font-medium text-foreground block mb-1";

  return (
    <div id="formular" className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8">
        {title && <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 1 ? 'bg-[#6b7f3e] text-white' : 'bg-[#f0f4e8] text-[#6b7f3e]'}`}>1</div>
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full transition-all ${step >= 2 ? 'bg-[#6b7f3e] w-full' : 'w-0'}`} /></div>
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 2 ? 'bg-[#6b7f3e] text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Laufzeit wählen</p>
              <div className="space-y-2">
                {TARIFE.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTarif(t.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      selectedTarif === t.id
                        ? 'border-[#6b7f3e] bg-[#f0f4e8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTarif === t.id ? 'border-[#6b7f3e]' : 'border-gray-300'
                      }`}>
                        {selectedTarif === t.id && <div className="w-2.5 h-2.5 rounded-full bg-[#6b7f3e]" />}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{t.laufzeit}</span>
                        <span className="text-xs text-gray-500 ml-2">Kündigung {t.kuendigung}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6b7f3e]">EUR {t.preis},-</span>
                      <span className="text-xs text-gray-400">/Monat</span>
                      {t.beliebt && <span className="text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">Beliebt</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Postversand Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setMitPostversand(!mitPostversand)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                  mitPostversand ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                    mitPostversand ? 'bg-[#6b7f3e] border-[#6b7f3e] text-white' : 'border-gray-300'
                  }`}>{mitPostversand && '✓'}</div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Postversand hinzubuchen</span>
                    <p className="text-xs text-gray-500">Wöchentliche Weiterleitung Ihrer Post</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#6b7f3e]">+ EUR {POSTVERSAND_AUFPREIS},-</span>
                  <span className="text-xs text-gray-400">/Monat</span>
                </div>
              </button>
            </div>

            {/* Zusammenfassung */}
            <div className="bg-[#f5f0eb] rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Basispaket ({tarif.laufzeit})</span>
                <span className="font-semibold">EUR {tarif.preis},-</span>
              </div>
              {mitPostversand && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Postversand</span>
                  <span className="font-semibold">EUR {POSTVERSAND_AUFPREIS},-</span>
                </div>
              )}
              <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Gesamt / Monat</span>
                <span className="font-bold text-[#6b7f3e]">EUR {monatspreis},- <span className="text-xs font-normal text-gray-400">zzgl. MwSt.</span></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-lg py-3 text-sm font-bold bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm transition-all"
            >
              Weiter zu Ihren Daten
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Gewählter Tarif */}
            <div className="bg-[#f0f4e8] rounded-lg p-3 flex justify-between items-center mb-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">{tarif.laufzeit}</span>
                {mitPostversand && <span className="text-gray-500"> + Postversand</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#6b7f3e]">EUR {monatspreis},-/Monat</span>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#6b7f3e] underline">Ändern</button>
              </div>
            </div>

            {/* Anrede + Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: '12px' }}>
              <div>
                <label className={labelCls}>Anrede *</label>
                <select value={anrede} onChange={e => setAnrede(e.target.value)} className={inputCls}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', appearance: 'none' as const }}>
                  <option value="">Bitte...</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Herr Dr.">Herr Dr.</option>
                  <option value="Frau Dr.">Frau Dr.</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Vorname *</label>
                <input type="text" value={vorname} onChange={e => setVorname(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nachname *</label>
                <input type="text" value={nachname} onChange={e => setNachname(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Firma */}
            <div>
              <label className={labelCls}>Firma *</label>
              <input type="text" value={firma} onChange={e => setFirma(e.target.value)} className={inputCls} />
            </div>

            {/* E-Mail + Telefon */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className={labelCls}>E-Mail *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Telefon</label>
                <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="+49..." className={inputCls} />
              </div>
            </div>

            {/* Nachricht */}
            <div>
              <label className={labelCls}>Nachricht</label>
              <textarea value={nachricht} onChange={e => setNachricht(e.target.value)} rows={3}
                placeholder="Ihre Fragen oder Anmerkungen..." className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="rounded-lg py-3 px-5 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                Zurück
              </button>
              <button type="submit" disabled={!canSubmit || sending}
                className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                  canSubmit && !sending ? 'bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {sending ? 'Angebot wird erstellt...' : 'Angebot erstellen'}
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Kostenlos und unverbindlich. Wir melden uns umgehend.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
