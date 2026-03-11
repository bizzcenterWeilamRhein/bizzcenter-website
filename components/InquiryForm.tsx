'use client';

import React, { useState } from 'react';

interface InquiryFormProps {
  title?: string;
  description?: string;
  product: string;
  /** Optional extra fields to include */
  fields?: string[];
}

export function InquiryForm({ title = 'Anfrage senden', description, product, fields }: InquiryFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [firma, setFirma] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.length >= 2 && email.includes('@') && email.includes('.');

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
          vorname: name,
          nachname: '',
          firma,
          email,
          telefon,
          nachricht,
          quelle: 'anfrage-formular',
          product,
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

  if (sent) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-[#f0f4e8] rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Anfrage erhalten</h3>
            <p className="text-gray-600">Vielen Dank! Wir melden uns in Kürze bei Ihnen.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h2>}
        {description && <p className="text-gray-600 mb-8 text-center">{description}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder="ihre@email.de"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={telefon}
              onChange={e => setTelefon(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder="+49 ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
            <input
              type="text"
              value={firma}
              onChange={e => setFirma(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder="Firmenname (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
            <textarea
              value={nachricht}
              onChange={e => setNachricht(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-none"
              placeholder="Ihre Anfrage oder Fragen..."
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="w-full py-3 px-6 bg-[#6b7f3e] text-white font-semibold rounded-lg hover:bg-[#5a6b34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Wird gesendet...' : 'Anfrage senden'}
          </button>

          <p className="text-xs text-gray-400 text-center">* Pflichtfelder</p>
        </form>
      </div>
    </section>
  );
}
