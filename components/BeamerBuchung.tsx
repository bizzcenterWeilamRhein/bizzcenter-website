'use client';

import React, { useState } from 'react';

interface Tarif {
  id: string;
  label: string;
  preis: number;
  beschreibung: string;
  details: string[];
}

const TARIFE: Tarif[] = [
  {
    id: 'beamer-only',
    label: 'Nur Beamer',
    preis: 39,
    beschreibung: 'Profi-Beamer ohne Leinwand',
    details: ['Full-HD-Projektor', 'HDMI-Kabel + VGA-Adapter', 'Fernbedienung', 'Transporttasche'],
  },
  {
    id: 'beamer-leinwand',
    label: 'Beamer + Leinwand',
    preis: 59,
    beschreibung: 'Komplett-Set mit Stativ-Leinwand',
    details: ['Full-HD-Projektor', 'Portable Stativ-Leinwand', 'HDMI-Kabel + VGA-Adapter', 'Fernbedienung + Verlängerungskabel', 'Transporttasche'],
  },
];

export function BeamerBuchung() {
  const [selectedTarif, setSelectedTarif] = useState<string | null>(null);
  const [startDatum, setStartDatum] = useState('');
  const [endDatum, setEndDatum] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [telefon, setTelefon] = useState('');
  const [bemerkungen, setBemerkungen] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const tarif = TARIFE.find((t) => t.id === selectedTarif);
  const today = new Date().toISOString().split('T')[0];

  // Tage berechnen
  let tage = 1;
  if (startDatum && endDatum) {
    const diff = new Date(endDatum).getTime() - new Date(startDatum).getTime();
    tage = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  const gesamtpreis = tarif ? tarif.preis * tage : 0;
  const canSubmit = selectedTarif && startDatum && vorname.length >= 2 && nachname.length >= 2 && telefon.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname,
          nachname,
          firma,
          telefon,
          quelle: 'beamer-buchung',
          product: selectedTarif,
          nachricht: [
            `Tarif: ${tarif?.label}`,
            `Zeitraum: ${startDatum}${endDatum && endDatum !== startDatum ? ' bis ' + endDatum : ''}`,
            `Tage: ${tage}`,
            `Gesamtpreis: EUR ${gesamtpreis},- zzgl. MwSt.`,
            bemerkungen ? `Bemerkungen: ${bemerkungen}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });
      if (!res.ok) throw new Error('Fehler');
      setSent(true);
    } catch {
      setError('Fehler beim Senden. Bitte versuchen Sie es erneut oder rufen Sie uns an.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-[#f0f4e8] border border-[#6b7f3e]/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4 text-[#6b7f3e]">✓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Buchungsanfrage gesendet</h3>
          <p className="text-gray-600">Vielen Dank! Wir prüfen die Verfügbarkeit und melden uns zeitnah bei Ihnen.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Beamer buchen</h2>
        <p className="text-gray-500 mb-8">Wählen Sie Ihr Paket, den Zeitraum und senden Sie die Buchungsanfrage.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tarif-Auswahl */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">1. Paket wählen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TARIFE.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTarif(t.id)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    selectedTarif === t.id
                      ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900">{t.label}</span>
                    <span className="text-[#6b7f3e] font-bold text-lg">EUR {t.preis},-</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{t.beschreibung}</p>
                  <ul className="space-y-1">
                    {t.details.map((d, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-[#6b7f3e]">✓</span> {d}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">pro Tag zzgl. MwSt.</p>
                </button>
              ))}
            </div>
          </div>

          {/* Datum */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">2. Zeitraum wählen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDatum" className="block text-sm font-medium text-gray-700 mb-1">
                  Abholdatum <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDatum"
                  type="date"
                  value={startDatum}
                  min={today}
                  onChange={(e) => {
                    setStartDatum(e.target.value);
                    if (!endDatum || e.target.value > endDatum) setEndDatum(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                />
              </div>
              <div>
                <label htmlFor="endDatum" className="block text-sm font-medium text-gray-700 mb-1">
                  Rückgabedatum <span className="text-gray-400">(optional, bei mehrtägig)</span>
                </label>
                <input
                  id="endDatum"
                  type="date"
                  value={endDatum}
                  min={startDatum || today}
                  onChange={(e) => setEndDatum(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                />
              </div>
            </div>
            {tarif && startDatum && (
              <div className="mt-3 bg-[#f5f0eb] rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {tarif.label} × {tage} {tage === 1 ? 'Tag' : 'Tage'}
                </span>
                <span className="font-bold text-gray-900">EUR {gesamtpreis},- <span className="text-xs font-normal text-gray-500">zzgl. MwSt.</span></span>
              </div>
            )}
          </div>

          {/* Kontaktdaten */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">3. Ihre Daten</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text" value={vorname} onChange={(e) => setVorname(e.target.value)}
                  placeholder="Vorname *" required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                />
                <input
                  type="text" value={nachname} onChange={(e) => setNachname(e.target.value)}
                  placeholder="Nachname *" required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text" value={firma} onChange={(e) => setFirma(e.target.value)}
                  placeholder="Firma (optional)" maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                />
                <input
                  type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                  placeholder="Telefon *" required minLength={6} maxLength={30}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                />
              </div>
              <textarea
                value={bemerkungen} onChange={(e) => setBemerkungen(e.target.value)}
                placeholder="Bemerkungen (optional)" maxLength={1000} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-y"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">Abholung im Kesselhaus, Am Kesselhaus 3, 79576 Weil am Rhein. Keine Lieferung.</p>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="w-full bg-[#6b7f3e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5a6c34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {sending ? 'Wird gesendet...' : 'Buchungsanfrage senden'}
          </button>
        </form>
      </div>
    </section>
  );
}
