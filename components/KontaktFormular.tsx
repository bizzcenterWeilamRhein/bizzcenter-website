'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const STRINGS = {
  de: {
    title: 'Kontaktformular',
    subtitle: 'Schreiben Sie uns — wir melden uns zeitnah bei Ihnen.',
    labelFirstName: 'Vorname',
    placeholderFirstName: 'Ihr Vorname',
    labelLastName: 'Nachname',
    placeholderLastName: 'Ihr Nachname',
    labelCompany: 'Firma',
    placeholderCompany: 'Firmenname (optional)',
    labelPhone: 'Telefon',
    placeholderPhone: '+49 ...',
    labelMessage: 'Ihre Anfrage',
    placeholderMessage: 'Wie können wir Ihnen helfen?',
    submitting: 'Wird gesendet...',
    submit: 'Nachricht senden',
    errorGeneric: 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder rufen Sie uns an.',
    successTitle: 'Nachricht gesendet',
    successBody: 'Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen.',
  },
  en: {
    title: 'Contact form',
    subtitle: 'Write to us — we will get back to you shortly.',
    labelFirstName: 'First name',
    placeholderFirstName: 'Your first name',
    labelLastName: 'Last name',
    placeholderLastName: 'Your last name',
    labelCompany: 'Company',
    placeholderCompany: 'Company name (optional)',
    labelPhone: 'Phone',
    placeholderPhone: '+49 ...',
    labelMessage: 'Your inquiry',
    placeholderMessage: 'How can we help you?',
    submitting: 'Sending...',
    submit: 'Send message',
    errorGeneric: 'An error occurred while sending. Please try again or give us a call.',
    successTitle: 'Message sent',
    successBody: 'Thank you for your inquiry. We will get back to you shortly.',
  },
};

export function KontaktFormular() {
  const pathname = usePathname();
  const locale: 'de' | 'en' = pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];

  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [telefon, setTelefon] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = vorname.length >= 2 && nachname.length >= 2 && telefon.length >= 6 && nachricht.length >= 10;

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
          nachricht,
          quelle: 'kontaktformular',
          product: 'kontakt',
          bemerkungen: `Sprache: ${locale}`,
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      setSent(true);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#f0f4e8] border border-[#6b7f3e]/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
          <p className="text-gray-600">{t.successBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-500 mb-8">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vorname" className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelFirstName} <span className="text-red-500">*</span>
              </label>
              <input
                id="vorname"
                type="text"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                placeholder={t.placeholderFirstName}
              />
            </div>
            <div>
              <label htmlFor="nachname" className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelLastName} <span className="text-red-500">*</span>
              </label>
              <input
                id="nachname"
                type="text"
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                placeholder={t.placeholderLastName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firma" className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelCompany}
              </label>
              <input
                id="firma"
                type="text"
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                placeholder={t.placeholderCompany}
              />
            </div>
            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelPhone} <span className="text-red-500">*</span>
              </label>
              <input
                id="telefon"
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                required
                minLength={6}
                maxLength={30}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                placeholder={t.placeholderPhone}
              />
            </div>
          </div>

          <div>
            <label htmlFor="nachricht" className="block text-sm font-medium text-gray-700 mb-1">
              {t.labelMessage} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="nachricht"
              value={nachricht}
              onChange={(e) => setNachricht(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors resize-y"
              placeholder={t.placeholderMessage}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="w-full bg-[#6b7f3e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5a6c34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
