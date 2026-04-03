'use client';

import React, { useState } from 'react';

// ─── Tarife ──────────────────────────────────────────────────────────

const TARIFE = [
  {
    id: 'langzeit',
    label: 'Langzeit',
    laufzeit: '12 Monate',
    priceOhne: 49,
    priceMit: 79,
    popular: true,
  },
  {
    id: 'standard',
    label: 'Standard',
    laufzeit: '6 Monate',
    priceOhne: 69,
    priceMit: 99,
  },
  {
    id: 'flex',
    label: 'Flex',
    laufzeit: '3 Monate',
    priceOhne: 99,
    priceMit: 129,
  },
];

const ADDONS = [
  { id: 'scanpaket', label: 'Scanpaket', price: 'EUR 49,-/Mon.' },
  { id: 'parkplatz', label: 'Parkplatz', price: 'EUR 49,-/Mon.' },
  { id: 'firmenschild', label: 'Firmenschild', price: 'EUR 179,- einmalig' },
  { id: 'telefon', label: 'Telefonservice', price: 'auf Anfrage' },
  { id: 'sekretariat', label: 'Sekretariatsservice', price: 'auf Anfrage' },
];

const RECHTSFORMEN = [
  'Einzelunternehmen',
  'GbR',
  'GmbH',
  'UG (haftungsbeschränkt)',
  'KG',
  'OHG',
  'AG',
  'Freiberufler',
  'Verein (e.V.)',
  'Zweigniederlassung',
  'Sonstige',
];

// ─── Component ───────────────────────────────────────────────────────

interface GeschaeftsadresseAnfrageProps {
  title?: string;
}

export function GeschaeftsadresseAnfrage({ title = 'Geschäftsadresse anfragen' }: GeschaeftsadresseAnfrageProps) {
  // Selection state
  const [tarif, setTarif] = useState<string | null>(null);
  const [postversand, setPostversand] = useState<'ohne' | 'mit'>('ohne');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  // Form state
  const [firma, setFirma] = useState('');
  const [rechtsform, setRechtsform] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [hrNummer, setHrNummer] = useState('');
  const [gewerbeschein, setGewerbeschein] = useState(false);
  const [startdatum, setStartdatum] = useState('');
  const [nachricht, setNachricht] = useState('');

  // UI state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTarif = TARIFE.find(t => t.id === tarif);
  const currentPrice = selectedTarif
    ? postversand === 'mit'
      ? selectedTarif.priceMit
      : selectedTarif.priceOhne
    : null;

  const canSubmit = firma.length >= 2 && name.length >= 2 && email.includes('@') && email.includes('.') && tarif;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setError('');

    try {
      const addonLabels = ADDONS.filter(a => selectedAddons.has(a.id)).map(a => a.label);

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: name,
          nachname: '',
          firma,
          email,
          telefon,
          nachricht: [
            `--- Geschäftsadresse Anfrage ---`,
            `Tarif: ${selectedTarif?.label} (${selectedTarif?.laufzeit})`,
            `Postversand: ${postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand'}`,
            `Preis: EUR ${currentPrice},-/Mon. zzgl. MwSt.`,
            `Rechtsform: ${rechtsform || 'nicht angegeben'}`,
            `HR-Nummer: ${hrNummer || 'nicht angegeben'}`,
            `Gewerbeschein vorhanden: ${gewerbeschein ? 'Ja' : 'Nein'}`,
            `Gewünschter Start: ${startdatum || 'nicht angegeben'}`,
            addonLabels.length > 0 ? `Add-ons: ${addonLabels.join(', ')}` : '',
            nachricht ? `\nNachricht: ${nachricht}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
          quelle: 'geschaeftsadresse-anfrage',
          product: 'geschaeftsadresse',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      setSent(true);
    } catch {
      setError('Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setSending(false);
    }
  };

  // ─── Success State ──────────────────────────────────────────────

  if (sent) {
    return (
      <section className="py-16 px-4" id="formular">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#f0f4e8] rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Anfrage erhalten</h3>
            <p className="text-gray-600 mb-2">
              Vielen Dank für Ihr Interesse! Wir prüfen Ihre Angaben und melden uns
              innerhalb von 24 Stunden mit einem individuellen Vertragsangebot bei Ihnen.
            </p>
            <p className="text-sm text-gray-500">
              Bei Rückfragen erreichen Sie uns unter{' '}
              <a href="tel:+4976217960310" className="text-[#6b7f3e] font-medium hover:underline">
                +49 7621 796 0310
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────

  return (
    <section className="py-16 px-4" id="formular">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h2>
        )}
        <p className="text-gray-500 text-center mb-10 text-sm">
          Wählen Sie Ihren Wunschtarif — wir prüfen Ihre Angaben und senden Ihnen ein
          individuelles Vertragsangebot per E-Mail.
        </p>

        {/* ── STEP 1: Postversand ── */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">1. Postbearbeitung</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['ohne', 'mit'] as const).map(pv => (
              <button
                key={pv}
                type="button"
                onClick={() => setPostversand(pv)}
                className={`rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                  postversand === pv
                    ? 'border-[#6b7f3e] bg-[#f0f4e8]'
                    : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">
                  {pv === 'ohne' ? 'Ohne Postversand' : 'Mit Postversand'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {pv === 'ohne'
                    ? 'Post wird vor Ort gesammelt, 24/7 abholbar'
                    : 'Wöchentliche Weiterleitung an eine Adresse im DACH-Raum'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 2: Tarif ── */}
        <div className="mb-8">
          <div className="mb-4 rounded-lg bg-[#6b7f3e] text-white text-center py-2 px-3">
            <p className="text-sm font-bold">Sommeraktion — 35% Nachlass bis 30.09.2026</p>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">2. Tarif wählen</h3>
          <p className="text-xs text-gray-500 mb-3">
            {postversand === 'mit' ? 'Inkl. wöchentlicher Postweiterleitung' : 'Ohne Postversand'} · Alle
            Preise zzgl. MwSt.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TARIFE.map(t => {
              const price = postversand === 'mit' ? t.priceMit : t.priceOhne;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTarif(t.id)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                    tarif === t.id
                      ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm'
                      : t.popular
                      ? 'border-[#6b7f3e]/50 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                      : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                  }`}
                >
                  {t.popular && tarif !== t.id && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">
                      Beliebt
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.laufzeit}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">EUR {price},-</p>
                  <p className="text-[10px] text-gray-400">/Mon. zzgl. MwSt.</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 3: Add-ons ── */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">3. Optionale Zusatzleistungen</h3>
          <p className="text-xs text-gray-500 mb-3">Nicht verpflichtend — können auch später hinzugebucht werden.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ADDONS.map(addon => (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  selectedAddons.has(addon.id)
                    ? 'border-[#6b7f3e] bg-[#f0f4e8]'
                    : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{addon.label}</div>
                <div className="text-xs font-bold text-gray-700 mt-0.5">+ {addon.price}</div>
                <div
                  className={`text-xs font-medium mt-1 ${
                    selectedAddons.has(addon.id) ? 'text-[#6b7f3e]' : 'text-[#6b7f3e]/50'
                  }`}
                >
                  {selectedAddons.has(addon.id) ? '✓ Gewählt' : '+ Hinzufügen'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Zusammenfassung ── */}
        {tarif && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-8">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ihre Auswahl</p>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Tarif</span>
              <span className="font-medium text-gray-900">
                {selectedTarif?.label} ({selectedTarif?.laufzeit})
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Postversand</span>
              <span className="font-medium text-gray-900">
                {postversand === 'mit' ? 'Mit Weiterleitung' : 'Ohne (Abholung vor Ort)'}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Monatlich</span>
              <span className="font-bold text-gray-900">EUR {currentPrice},-</span>
            </div>
            {selectedAddons.size > 0 && (
              <div className="border-t border-gray-200 mt-2 pt-2">
                {ADDONS.filter(a => selectedAddons.has(a.id)).map(a => (
                  <div key={a.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-500">+ {a.label}</span>
                    <span className="font-medium text-gray-700">{a.price}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2 text-right">Alle Preise zzgl. MwSt.</p>
          </div>
        )}

        {/* ── STEP 4: Anfrage-Formular ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">4. Ihre Angaben</h3>
          <p className="text-xs text-gray-500 mb-5">
            Wir prüfen Ihre Angaben und senden Ihnen ein verbindliches Angebot inkl. Vertrag per
            E-Mail zu.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Firma + Rechtsform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname *</label>
                <input
                  type="text"
                  value={firma}
                  onChange={e => setFirma(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder="Musterfirma GmbH"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rechtsform</label>
                <select
                  value={rechtsform}
                  onChange={e => setRechtsform(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white"
                >
                  <option value="">Bitte wählen</option>
                  {RECHTSFORMEN.map(rf => (
                    <option key={rf} value={rf}>
                      {rf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* HR-Nummer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handelsregister-Nummer
              </label>
              <input
                type="text"
                value={hrNummer}
                onChange={e => setHrNummer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                placeholder="z.B. HRB 12345 (falls vorhanden)"
              />
            </div>

            {/* Gewerbeschein */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="gewerbeschein"
                checked={gewerbeschein}
                onChange={e => setGewerbeschein(e.target.checked)}
                className="w-4 h-4 text-[#6b7f3e] border-gray-300 rounded focus:ring-[#6b7f3e]"
              />
              <label htmlFor="gewerbeschein" className="text-sm text-gray-700">
                Gewerbeschein / Gewerbeanmeldung vorhanden
              </label>
            </div>

            {/* Name + E-Mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ansprechpartner *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder="Vor- und Nachname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder="ihre@email.de"
                />
              </div>
            </div>

            {/* Telefon + Startdatum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={e => setTelefon(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder="+49 123 456 789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gewünschter Starttermin
                </label>
                <input
                  type="date"
                  value={startdatum}
                  onChange={e => setStartdatum(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
              </div>
            </div>

            {/* Nachricht */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anmerkungen / Fragen
              </label>
              <textarea
                value={nachricht}
                onChange={e => setNachricht(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-none text-sm"
                placeholder="z.B. besondere Anforderungen, Fragen zum Service..."
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || sending}
              className="w-full py-3.5 px-6 bg-[#6b7f3e] text-white font-semibold rounded-lg hover:bg-[#5a6b34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
            >
              {sending ? 'Wird gesendet...' : 'Unverbindlich anfragen'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              * Pflichtfelder · Keine Zahlungsdaten erforderlich · Wir melden uns innerhalb von 24h
            </p>
          </form>
        </div>

        {/* ── So geht's weiter ── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              title: 'Anfrage senden',
              desc: 'Wählen Sie Ihren Tarif und füllen Sie das Formular aus.',
            },
            {
              step: '2',
              title: 'Wir prüfen & erstellen Ihr Angebot',
              desc: 'Innerhalb von 24h erhalten Sie ein individuelles Vertragsangebot per E-Mail.',
            },
            {
              step: '3',
              title: 'Vertrag & Start',
              desc: 'Nach Unterschrift und Kaution ist Ihre Adresse innerhalb von 24h aktiv.',
            },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {s.step}
              </div>
              <p className="text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
