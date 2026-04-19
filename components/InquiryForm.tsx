'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const STRINGS = {
  de: {
    defaultTitle: 'Anfrage senden',
    successTitle: 'Anfrage erhalten',
    successBody: 'Vielen Dank! Wir melden uns in Kuerze bei Ihnen.',
    labelName: 'Name *',
    placeholderName: 'Vor- und Nachname',
    labelEmail: 'E-Mail *',
    placeholderEmail: 'ihre@email.de',
    labelPhone: 'Telefon *',
    placeholderPhone: '+49 ...',
    labelCompany: 'Firma',
    placeholderCompany: 'Firmenname (optional)',
    labelMessage: 'Nachricht',
    placeholderMessage: 'Ihre Anfrage oder Fragen...',
    submitting: 'Wird gesendet...',
    submit: 'Anfrage senden',
    errorGeneric: 'Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.',
    requiredFields: '* Pflichtfelder',
  },
  en: {
    defaultTitle: 'Send inquiry',
    successTitle: 'Inquiry received',
    successBody: 'Thank you! We will get back to you shortly.',
    labelName: 'Name *',
    placeholderName: 'First and last name',
    labelEmail: 'Email *',
    placeholderEmail: 'your@email.com',
    labelPhone: 'Phone *',
    placeholderPhone: '+49 ...',
    labelCompany: 'Company',
    placeholderCompany: 'Company name (optional)',
    labelMessage: 'Message',
    placeholderMessage: 'Your inquiry or questions...',
    submitting: 'Sending...',
    submit: 'Send inquiry',
    errorGeneric: 'There was a problem sending your inquiry. Please try again.',
    requiredFields: '* Required fields',
  },
  fr: {
    defaultTitle: 'Envoyer une demande',
    successTitle: 'Demande recue',
    successBody: 'Merci ! Nous vous recontacterons sous peu.',
    labelName: 'Nom *',
    placeholderName: 'Prenom et nom',
    labelEmail: 'E-mail *',
    placeholderEmail: 'votre@email.fr',
    labelPhone: 'Telephone *',
    placeholderPhone: '+49 ...',
    labelCompany: 'Entreprise',
    placeholderCompany: 'Nom de l\'entreprise (facultatif)',
    labelMessage: 'Message',
    placeholderMessage: 'Votre demande ou vos questions...',
    submitting: 'Envoi en cours...',
    submit: 'Envoyer la demande',
    errorGeneric: 'Un probleme est survenu lors de l\'envoi. Veuillez reessayer.',
    requiredFields: '* Champs obligatoires',
  },
};

interface InquiryFormProps {
  title?: string;
  description?: string;
  product: string;
  /** Optional extra fields to include */
  fields?: string[];
}

export function InquiryForm({ title, description, product, fields }: InquiryFormProps) {
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' = pathname?.startsWith('/fr') ? 'fr' : pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [firma, setFirma] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.length >= 2 && email.includes('@') && email.includes('.') && telefon.length >= 6;

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
      setError(t.errorGeneric);
    } finally {
      setSending(false);
    }
  };

  const displayTitle = title || t.defaultTitle;

  if (sent) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-[#f0f4e8] rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.successTitle}</h3>
            <p className="text-gray-600">{t.successBody}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        {displayTitle && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{displayTitle}</h2>}
        {description && <p className="text-gray-600 mb-8 text-center">{description}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelName}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder={t.placeholderName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelEmail}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder={t.placeholderEmail}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelPhone}</label>
            <input
              type="tel"
              value={telefon}
              onChange={e => setTelefon(e.target.value)}
              required
              minLength={6}
              maxLength={30}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder={t.placeholderPhone}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelCompany}</label>
            <input
              type="text"
              value={firma}
              onChange={e => setFirma(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              placeholder={t.placeholderCompany}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelMessage}</label>
            <textarea
              value={nachricht}
              onChange={e => setNachricht(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-none"
              placeholder={t.placeholderMessage}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="w-full py-3 px-6 bg-[#6b7f3e] text-white font-semibold rounded-lg hover:bg-[#5a6b34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? t.submitting : t.submit}
          </button>

          <p className="text-xs text-gray-400 text-center">{t.requiredFields}</p>
        </form>
      </div>
    </section>
  );
}
