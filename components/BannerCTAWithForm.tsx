'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const formRef = useRef<HTMLFormElement>(null);

  // Scroll focused input into view when mobile keyboard opens
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Small delay to let the keyboard finish opening
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    form.addEventListener('focusin', handleFocusIn);
    return () => form.removeEventListener('focusin', handleFocusIn);
  }, []);

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
        body: JSON.stringify({ vorname, nachname, firma, telefon, nachricht, quelle: 'hero-formular', product: 'startseite' }),
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
    <section className="relative py-20 pb-28 sm:pb-20 px-4 overflow-hidden">
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
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
