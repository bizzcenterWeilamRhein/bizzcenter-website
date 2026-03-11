'use client';

import React, { useState } from 'react';

interface BannerCTAWithFormProps {
  title?: string;
  subtext?: string;
  backgroundImage?: string;
}

export function BannerCTAWithForm({
  title = 'Kontakt aufnehmen',
  subtext = 'Schreiben Sie uns — wir melden uns zeitnah bei Ihnen.',
  backgroundImage = '/images/hero/kesselhaus.jpg',
}: BannerCTAWithFormProps) {
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
        body: JSON.stringify({ vorname, nachname, firma, telefon, nachricht, quelle: 'kontaktformular', product: 'startseite' }),
      });
      if (!res.ok) throw new Error('Fehler');
      setSent(true);
    } catch {
      setError('Fehler beim Senden. Bitte versuchen Sie es erneut oder rufen Sie uns an.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div className="text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-white/80 mb-6">{subtext}</p>
          <div className="flex items-center gap-3 text-white/70">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            <a href="tel:+4976219165547" className="hover:text-white transition-colors">+49 (0)7621 916 5547</a>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 text-[#6b7f3e]">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nachricht gesendet</h3>
              <p className="text-gray-600">Vielen Dank! Wir melden uns zeitnah bei Ihnen.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" value={vorname} onChange={(e) => setVorname(e.target.value)}
                  placeholder="Vorname *" required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
                <input
                  type="text" value={nachname} onChange={(e) => setNachname(e.target.value)}
                  placeholder="Nachname *" required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" value={firma} onChange={(e) => setFirma(e.target.value)}
                  placeholder="Firma (optional)" maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
                <input
                  type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                  placeholder="Telefon *" required minLength={6} maxLength={30}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
              </div>
              <textarea
                value={nachricht} onChange={(e) => setNachricht(e.target.value)}
                placeholder="Ihre Anfrage *" required minLength={10} maxLength={2000} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm resize-y"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit" disabled={!canSubmit || sending}
                className="w-full bg-[#6b7f3e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5a6c34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Wird gesendet...' : 'Nachricht senden'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
