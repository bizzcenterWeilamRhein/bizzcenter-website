'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackLeadSubmitted } from './lib/tracking';
import { captureMarketingAttribution, getMarketingAttribution } from './lib/marketing';
import { AnfrageartToggle, getAnfrageartStrings, type AnfrageArt } from './AnfrageartToggle';
import PhoneInput from './PhoneInput';

const STRINGS = {
  de: {
    defaultTitle: 'Anfrage senden',
    successTitle: 'Vielen Dank für Ihre Anfrage!',
    successBody: 'Wir melden uns innerhalb von 24 Stunden persönlich bei Ihnen. Mit 22 Jahren Erfahrung im Dreiländereck unterstützen wir Sie gerne.',
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
    successTitle: 'Thank you for your inquiry!',
    successBody: 'We will get back to you personally within 24 hours. With 22 years of experience in the tri-border area, we are happy to support you.',
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
    successTitle: 'Merci pour votre demande !',
    successBody: 'Nous vous recontacterons personnellement sous 24 heures. Avec 22 ans d\'expérience dans la région des trois frontières, vous êtes entre de bonnes mains chez nous.',
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
  const tArt = getAnfrageartStrings(locale);

  const [anfrageAls, setAnfrageAls] = useState<AnfrageArt>('firma');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [firma, setFirma] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Marketing-Attribution beim Mount erfassen
  useEffect(() => { captureMarketingAttribution(); }, []);

  const canSubmit = name.length >= 2 && email.includes('@') && email.includes('.') && telefon.length >= 6 && (anfrageAls === 'privat' || firma.length >= 2);

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
          firma: anfrageAls === 'firma' ? firma : '',
          email,
          telefon,
          nachricht,
          quelle: 'anfrage-formular',
          product,
          bemerkungen: anfrageAls === 'privat' ? tArt.privateMarker : tArt.companyMarker,
          timestamp: new Date().toISOString(),
          ...getMarketingAttribution(),
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      const responseData = await res.json().catch(() => ({}));
      trackLeadSubmitted('anfrage_produkt', {
        leadId: responseData?.leadId,
        product,
      });
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
          <AnfrageartToggle value={anfrageAls} onChange={setAnfrageAls} />

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
            <PhoneInput
              value={telefon}
              onChange={setTelefon}
              required
              placeholder={t.placeholderPhone}
              inputClassName="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              selectClassName="px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none bg-white"
            />
          </div>

          {anfrageAls === 'firma' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tArt.companyNamePlaceholder.replace(' *', '')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={firma}
                onChange={e => setFirma(e.target.value)}
                required
                minLength={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
                placeholder={t.placeholderCompany}
              />
            </div>
          )}

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
