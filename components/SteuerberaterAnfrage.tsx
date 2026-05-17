'use client';

import React, { useState, useEffect } from 'react';
import { trackLeadSubmitted } from './lib/tracking';
import { captureMarketingAttribution, getMarketingAttribution } from './lib/marketing';
import PhoneInput from './PhoneInput';

const TITEL_OPTIONS = [
  '(kein Titel)',
  'Dr.',
  'Dr. Dr.',
  'Prof. Dr.',
];

const ANREDE_OPTIONS = [
  'Herr',
  'Frau',
  'Divers',
  'Keine Angabe',
];

const TAETIGKEITSSCHWERPUNKTE = [
  'International Tax',
  'Unternehmensbesteuerung',
  'Lohnsteuer',
  'Einkommensteuer',
  'Buchhaltung & Bilanzierung',
  'Steuerberatungsgesellschaft',
  'Andere',
];

const STARTZEITPUNKTE = [
  'Sofort',
  'Innerhalb 3 Monaten',
  'Später',
];

interface SteuerberaterAnfrageProps {
  title?: string;
  description?: string;
  variant?: 'full' | 'compact';
}

export function SteuerberaterAnfrage({
  title = 'Berufsniederlassung anfragen',
  description,
  variant = 'full',
}: SteuerberaterAnfrageProps) {
  const [titel, setTitel] = useState('');
  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [schwerpunkt, setSchwerpunkt] = useState('');
  const [startzeit, setStartzeit] = useState('');
  const [anmerkungen, setAnmerkungen] = useState('');

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { captureMarketingAttribution(); }, []);

  const canSubmit =
    vorname.trim().length >= 2 &&
    nachname.trim().length >= 2 &&
    email.includes('@') && email.includes('.') &&
    telefon.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setError('');

    const titelClean = titel && titel !== '(kein Titel)' ? titel : '';
    const anredeClean = anrede && anrede !== 'Keine Angabe' ? anrede : '';
    const firmaDisplay = [titelClean, anredeClean].filter(Boolean).join(' ').trim() || 'Steuerberater';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname,
          nachname,
          firma: firmaDisplay,
          email,
          telefon,
          nachricht: [
            '--- Steuerberater-Anfrage ---',
            titelClean ? `Titel: ${titelClean}` : '',
            anredeClean ? `Anrede: ${anredeClean}` : '',
            schwerpunkt ? `Tätigkeitsschwerpunkt: ${schwerpunkt}` : '',
            startzeit ? `Gewünschter Start: ${startzeit}` : '',
            anmerkungen ? `\nAnmerkungen: ${anmerkungen}` : '',
          ].filter(Boolean).join('\n'),
          quelle: 'steuerberater-landingpage',
          product: 'geschaeftsadresse',
          bedarfKategorie: 'geschaeftsadresse',
          zielgruppe: 'steuerberater',
          titel: titelClean,
          anrede: anredeClean,
          taetigkeitsschwerpunkt: schwerpunkt,
          startzeit,
          timestamp: new Date().toISOString(),
          ...getMarketingAttribution(),
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      const responseData = await res.json().catch(() => ({}));

      trackLeadSubmitted('steuerberater_landingpage', {
        leadId: responseData?.leadId,
        zielgruppe: 'steuerberater',
        taetigkeitsschwerpunkt: schwerpunkt,
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
    const successCard = (
      <div className="bg-[#f0f4e8] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Vielen Dank für Ihre Anfrage!</h3>
        <p className="text-gray-600 text-sm">
          Wir melden uns innerhalb von 24 Stunden persönlich bei Ihnen. Mit 22 Jahren Erfahrung im Dreiländereck unterstützen wir Sie gerne.
        </p>
      </div>
    );
    if (variant === 'compact') return successCard;
    return (
      <section className="py-16 px-4" id="formular">
        <div className="max-w-2xl mx-auto">{successCard}</div>
      </section>
    );
  }

  const formInner = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Titel</label>
          <select value={titel} onChange={e => setTitel(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white">
            <option value="">Bitte wählen</option>
            {TITEL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Anrede</label>
          <select value={anrede} onChange={e => setAnrede(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white">
            <option value="">Bitte wählen</option>
            {ANREDE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Vorname *</label>
          <input type="text" value={vorname} onChange={e => setVorname(e.target.value)} required minLength={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm" placeholder="Vorname" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nachname *</label>
          <input type="text" value={nachname} onChange={e => setNachname(e.target.value)} required minLength={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm" placeholder="Nachname" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">E-Mail *</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm" placeholder="ihre@kanzlei-mail.de" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Telefon *</label>
        <PhoneInput value={telefon} onChange={setTelefon} required placeholder="+49 123 456 789" inputClassName="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm" selectClassName="px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tätigkeitsschwerpunkt</label>
          <select value={schwerpunkt} onChange={e => setSchwerpunkt(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white">
            <option value="">Bitte wählen</option>
            {TAETIGKEITSSCHWERPUNKTE.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start</label>
          <select value={startzeit} onChange={e => setStartzeit(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white">
            <option value="">Bitte wählen</option>
            {STARTZEITPUNKTE.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>

      {variant === 'full' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Anmerkungen</label>
          <textarea value={anmerkungen} onChange={e => setAnmerkungen(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-none text-sm" placeholder="z.B. StBK-Bezirk, Steuerberatungsgesellschaft geplant, Sonderwünsche..." />
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={!canSubmit || sending} className="w-full py-3 px-6 bg-[#6b7f3e] text-white font-semibold rounded-lg hover:bg-[#5a6b34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
        {sending ? 'Wird gesendet...' : 'Anfrage senden'}
      </button>

      <p className="text-[11px] text-gray-500 text-center leading-relaxed">
        Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten zur Bearbeitung Ihrer Anfrage zu.
        Details in unserer <a href="/datenschutz" className="text-[#6b7f3e] hover:underline">Datenschutzerklärung</a>.
      </p>
    </form>
  );

  if (variant === 'compact') {
    return (
      <div className="w-full">
        <p className="text-sm font-bold text-gray-900 mb-3 text-center">{title}</p>
        {formInner}
      </div>
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
          {formInner}
        </div>
      </div>
    </section>
  );
}
