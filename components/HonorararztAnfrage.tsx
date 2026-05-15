'use client';

import React, { useState, useEffect } from 'react';
import { trackLeadSubmitted } from './lib/tracking';
import { captureMarketingAttribution, getMarketingAttribution } from './lib/marketing';
import PhoneInput from './PhoneInput';

const FACHRICHTUNGEN = [
  'Anästhesie',
  'Chirurgie',
  'Radiologie',
  'Innere Medizin',
  'Psychiatrie',
  'Andere',
];

const SITUATIONEN = [
  'Bereits Honorararzt',
  'Wechsel von Klinik',
  'Neu-Niederlassung',
  'Sonstiges',
];

const STARTZEITPUNKTE = [
  'Sofort',
  'Innerhalb 3 Monaten',
  'Später',
];

interface HonorararztAnfrageProps {
  title?: string;
  description?: string;
}

export function HonorararztAnfrage({
  title = 'Praxisadresse anfragen',
  description,
}: HonorararztAnfrageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [fachrichtung, setFachrichtung] = useState('');
  const [situation, setSituation] = useState('');
  const [startzeit, setStartzeit] = useState('');
  const [anmerkungen, setAnmerkungen] = useState('');
  const [dsgvo, setDsgvo] = useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { captureMarketingAttribution(); }, []);

  const canSubmit =
    name.trim().length >= 2 &&
    email.includes('@') && email.includes('.') &&
    telefon.length >= 6 &&
    fachrichtung &&
    dsgvo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setError('');

    const nameParts = name.trim().split(/\s+/);
    const vorname = nameParts[0] || '';
    const nachname = nameParts.slice(1).join(' ') || '';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname,
          nachname,
          email,
          telefon,
          nachricht: [
            '--- Honorararzt-Anfrage ---',
            `Fachrichtung: ${fachrichtung}`,
            situation ? `Aktuelle Situation: ${situation}` : '',
            startzeit ? `Gewünschter Start: ${startzeit}` : '',
            anmerkungen ? `\nAnmerkungen: ${anmerkungen}` : '',
          ].filter(Boolean).join('\n'),
          quelle: 'honorararzt-landingpage',
          product: 'geschaeftsadresse',
          bedarfKategorie: 'geschaeftsadresse',
          zielgruppe: 'honorararzt',
          fachrichtung,
          situation,
          startzeit,
          timestamp: new Date().toISOString(),
          ...getMarketingAttribution(),
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      const responseData = await res.json().catch(() => ({}));

      trackLeadSubmitted('honorararzt_landingpage', {
        leadId: responseData?.leadId,
        zielgruppe: 'honorararzt',
        fachrichtung,
        situation,
        startzeit,
      });

      setSent(true);
    } catch {
      setError('Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setSending(false);
    }
  };

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
              Vielen Dank für Ihr Interesse. Wir melden uns innerhalb von 24 Stunden bei Ihnen — diskret und unverbindlich.
            </p>
            <p className="text-sm text-gray-500">
              Bei Rückfragen:{' '}
              <a href="tel:+4976217960310" className="text-[#6b7f3e] font-medium hover:underline">
                +49 7621 796 0310
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4" id="formular">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h2>
        {description && (
          <p className="text-gray-500 text-center mb-10 text-sm">{description}</p>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + E-Mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder="Dr. med. Mustermann"
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
                  placeholder="ihre@praxis-mail.de"
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
              <PhoneInput
                value={telefon}
                onChange={setTelefon}
                required
                placeholder="+49 123 456 789"
                inputClassName="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                selectClassName="px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white"
              />
            </div>

            {/* Fachrichtung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fachrichtung *</label>
              <select
                value={fachrichtung}
                onChange={e => setFachrichtung(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white"
              >
                <option value="">Bitte wählen</option>
                {FACHRICHTUNGEN.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Situation + Startzeitpunkt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelle Situation</label>
                <select
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white"
                >
                  <option value="">Bitte wählen</option>
                  {SITUATIONEN.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gewünschter Startzeitpunkt</label>
                <select
                  value={startzeit}
                  onChange={e => setStartzeit(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white"
                >
                  <option value="">Bitte wählen</option>
                  {STARTZEITPUNKTE.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Anmerkungen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anmerkungen</label>
              <textarea
                value={anmerkungen}
                onChange={e => setAnmerkungen(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-none text-sm"
                placeholder="z.B. KV-Bezirk, Sprechzeiten, Sonderwünsche..."
              />
            </div>

            {/* DSGVO */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="dsgvo-honorararzt"
                checked={dsgvo}
                onChange={e => setDsgvo(e.target.checked)}
                required
                className="w-4 h-4 mt-1 text-[#6b7f3e] border-gray-300 rounded focus:ring-[#6b7f3e]"
              />
              <label htmlFor="dsgvo-honorararzt" className="text-xs text-gray-600 leading-relaxed">
                Ich willige ein, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert
                und verwendet werden. Weitere Informationen in der{' '}
                <a href="/datenschutz" className="text-[#6b7f3e] hover:underline">Datenschutzerklärung</a>. *
              </label>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || sending}
              className="w-full py-3.5 px-6 bg-[#6b7f3e] text-white font-semibold rounded-lg hover:bg-[#5a6b34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
            >
              {sending ? 'Wird gesendet...' : 'Anfrage senden'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Wir melden uns innerhalb von 24 Stunden zurück. Diskret und unverbindlich.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
