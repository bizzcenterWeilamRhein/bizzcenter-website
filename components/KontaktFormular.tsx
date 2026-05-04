'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackLeadSubmitted } from './lib/tracking';

const SUBJECTS = [
  { value: 'Geschäftsadresse', de: 'Geschäftsadresse', en: 'Virtual Office', fr: 'Adresse commerciale' },
  { value: 'Coworking', de: 'Coworking', en: 'Coworking', fr: 'Coworking' },
  { value: 'Büro mieten', de: 'Büro mieten', en: 'Rent Office', fr: 'Louer bureau' },
  { value: 'Konferenzraum mieten', de: 'Konferenzraum mieten', en: 'Meeting Room Rental', fr: 'Louer salle de conférence' },
  { value: 'Coachingbüro mieten', de: 'Coachingbüro mieten', en: 'Coaching Room Rental', fr: 'Louer bureau de coaching' },
  { value: 'Schweizer Telefonnummer', de: 'Schweizer Telefonnummer', en: 'Swiss Phone Number', fr: 'Numéro suisse' },
  { value: 'Beamer mieten', de: 'Beamer mieten', en: 'Projector Rental', fr: 'Louer projecteur' },
  { value: 'Lautsprecher mieten', de: 'Lautsprecher mieten', en: 'Speaker Rental', fr: 'Louer enceintes' },
  { value: 'Parkplatz mieten', de: 'Parkplatz mieten', en: 'Parking Rental', fr: 'Louer parking' },
  { value: 'Musikbox mieten', de: 'Musikbox mieten', en: 'Music Box Rental', fr: 'Louer enceinte musicale' },
  { value: 'Fensterputzroboter mieten', de: 'Fensterputzroboter mieten', en: 'Window Cleaning Robot Rental', fr: 'Louer robot laveur de vitres' },
  { value: 'Sonstiges', de: 'Sonstiges', en: 'Other', fr: 'Autre' },
];

// Product slug → { subject, full display name }
const PRODUCT_MAP: Record<string, { subject: string; name: string }> = {
  'jbl-eon-715': { subject: 'Musikbox mieten', name: 'Musikbox mieten — JBL EON 715' },
  'musikbox-jbl': { subject: 'Musikbox mieten', name: 'Musikbox mieten — JBL EON 715' },
  'boomster-4': { subject: 'Musikbox mieten', name: 'Musikbox mieten — Teufel Boomster 4' },
  'musikbox-boomster': { subject: 'Musikbox mieten', name: 'Musikbox mieten — Teufel Boomster 4' },
  'beamer': { subject: 'Beamer mieten', name: 'Beamer mieten — Epson EH-TW650' },
  'beamer-epson': { subject: 'Beamer mieten', name: 'Beamer mieten — Epson EH-TW650' },
  'beamer-epson-eh-tw650': { subject: 'Beamer mieten', name: 'Beamer mieten — Epson EH-TW650' },
  'fensterputzroboter': { subject: 'Fensterputzroboter mieten', name: 'Fensterputzroboter mieten — Winbot W2S Omni' },
  'winbot-w2s': { subject: 'Fensterputzroboter mieten', name: 'Fensterputzroboter mieten — Winbot W2S Omni' },
  'fensterputzroboter-winbot-w2s': { subject: 'Fensterputzroboter mieten', name: 'Fensterputzroboter mieten — Winbot W2S Omni' },
};

const STRINGS = {
  de: {
    title: 'Kontaktformular',
    subtitle: 'Schreiben Sie uns — wir melden uns zeitnah bei Ihnen.',
    labelSubject: 'Anfrage betrifft',
    placeholderSubject: 'Bitte wählen...',
    labelFirstName: 'Vorname',
    placeholderFirstName: 'Ihr Vorname',
    labelLastName: 'Nachname',
    placeholderLastName: 'Ihr Nachname',
    labelCompany: 'Firma',
    placeholderCompany: 'Firmenname (optional)',
    labelEmail: 'E-Mail',
    placeholderEmail: 'ihre@email.de',
    labelPhone: 'Telefon',
    placeholderPhone: '+49 ...',
    labelMessage: 'Ihre Nachricht',
    placeholderMessage: 'Wie können wir Ihnen helfen?',
    productBadge: 'Produktanfrage',
    labelDateFrom: 'Wunschtermin von',
    labelDateTo: 'Wunschtermin bis',
    labelTimeRange: 'Uhrzeit / Zeitraum (optional)',
    placeholderTimeRange: 'z. B. „ab 14 Uhr", „ganztägig", „Abendveranstaltung"',
    trustNote: 'Wir melden uns innerhalb von 24 Stunden (werktags) mit einer Verfügbarkeitsbestätigung.',
    submitting: 'Wird gesendet...',
    submit: 'Nachricht senden',
    errorGeneric: 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    successTitle: 'Nachricht gesendet',
    successBody: 'Vielen Dank für Ihre Anfrage. Wir prüfen die Verfügbarkeit und melden uns innerhalb von 24 Stunden (werktags) bei Ihnen.',
  },
  en: {
    title: 'Contact form',
    subtitle: 'Write to us — we will get back to you shortly.',
    labelSubject: 'Inquiry about',
    placeholderSubject: 'Please choose...',
    labelFirstName: 'First name',
    placeholderFirstName: 'Your first name',
    labelLastName: 'Last name',
    placeholderLastName: 'Your last name',
    labelCompany: 'Company',
    placeholderCompany: 'Company name (optional)',
    labelEmail: 'Email',
    placeholderEmail: 'your@email.com',
    labelPhone: 'Phone',
    placeholderPhone: '+49 ...',
    labelMessage: 'Your message',
    placeholderMessage: 'How can we help you?',
    productBadge: 'Product inquiry',
    labelDateFrom: 'Preferred date from',
    labelDateTo: 'Preferred date to',
    labelTimeRange: 'Time / range (optional)',
    placeholderTimeRange: 'e.g. "from 2 pm", "all day", "evening event"',
    trustNote: 'We will get back to you within 24 hours (business days) with an availability confirmation.',
    submitting: 'Sending...',
    submit: 'Send message',
    errorGeneric: 'An error occurred while sending. Please try again.',
    successTitle: 'Message sent',
    successBody: 'Thank you for your inquiry. We will check availability and get back to you within 24 hours (business days).',
  },
  fr: {
    title: 'Formulaire de contact',
    subtitle: 'Écrivez-nous — nous vous répondrons rapidement.',
    labelSubject: 'Objet de la demande',
    placeholderSubject: 'Veuillez choisir...',
    labelFirstName: 'Prénom',
    placeholderFirstName: 'Votre prénom',
    labelLastName: 'Nom',
    placeholderLastName: 'Votre nom',
    labelCompany: 'Entreprise',
    placeholderCompany: 'Nom de l\'entreprise (facultatif)',
    labelEmail: 'E-mail',
    placeholderEmail: 'votre@email.com',
    labelPhone: 'Téléphone',
    placeholderPhone: '+49 ...',
    labelMessage: 'Votre message',
    placeholderMessage: 'Comment pouvons-nous vous aider ?',
    productBadge: 'Demande produit',
    labelDateFrom: 'Date souhaitée à partir du',
    labelDateTo: 'Date souhaitée jusqu\'au',
    labelTimeRange: 'Horaire / plage (facultatif)',
    placeholderTimeRange: 'ex. « à partir de 14h », « toute la journée », « soirée »',
    trustNote: 'Nous vous répondrons sous 24 heures (jours ouvrés) avec une confirmation de disponibilité.',
    submitting: 'Envoi en cours...',
    submit: 'Envoyer le message',
    errorGeneric: 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.',
    successTitle: 'Message envoyé',
    successBody: 'Merci pour votre demande. Nous vérifions la disponibilité et vous répondrons sous 24 heures (jours ouvrés).',
  },
};

interface KontaktFormularProps {
  embedded?: boolean;
}

export function KontaktFormular({ embedded = false }: KontaktFormularProps) {
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' = pathname?.startsWith('/fr') ? 'fr' : pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];

  const [produktInfo, setProduktInfo] = useState<{ subject: string; name: string } | null>(null);
  const [betreff, setBetreff] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [wunschterminVon, setWunschterminVon] = useState('');
  const [wunschterminBis, setWunschterminBis] = useState('');
  const [zeitraumFreitext, setZeitraumFreitext] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Read ?produkt=... from URL after mount (avoids SSG/Suspense issues)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('produkt');
    if (slug && PRODUCT_MAP[slug]) {
      const info = PRODUCT_MAP[slug];
      setProduktInfo(info);
      setBetreff(info.subject);
    }
  }, []);

  const isProductInquiry = produktInfo !== null;

  const baseValid = betreff.length > 0 && vorname.length >= 2 && nachname.length >= 2 && telefon.length >= 6 && email.includes('@') && email.includes('.') && nachricht.length >= 10;
  const productValid = !isProductInquiry || (wunschterminVon.length > 0 && wunschterminBis.length > 0);
  const canSubmit = baseValid && productValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setError('');

    const productName = produktInfo?.name ?? betreff;
    const bemerkungenParts = [`Sprache: ${locale}`, `Betreff: ${betreff}`];
    if (isProductInquiry) {
      bemerkungenParts.push(`Produkt: ${produktInfo.name}`);
      bemerkungenParts.push(`Wunschtermin: ${wunschterminVon} bis ${wunschterminBis}`);
      if (zeitraumFreitext) bemerkungenParts.push(`Zeitraum: ${zeitraumFreitext}`);
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname,
          nachname,
          firma,
          email,
          telefon,
          nachricht,
          quelle: 'kontaktformular',
          product: productName,
          wunschterminVon: isProductInquiry ? wunschterminVon : undefined,
          wunschterminBis: isProductInquiry ? wunschterminBis : undefined,
          zeitraumFreitext: isProductInquiry ? zeitraumFreitext : undefined,
          bemerkungen: bemerkungenParts.join(' | '),
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      const responseData = await res.json().catch(() => ({}));
      trackLeadSubmitted('kontakt_allgemein', {
        leadId: responseData?.leadId,
        betreff,
        product: produktInfo?.name,
        isProductInquiry,
      });
      setSent(true);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSending(false);
    }
  };

  const wrapperClass = embedded
    ? 'w-full'
    : 'max-w-2xl mx-auto px-4 py-12';

  if (sent) {
    return (
      <section className={wrapperClass}>
        <div className="bg-[#f0f4e8] border border-[#6b7f3e]/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
          <p className="text-gray-600">{t.successBody}</p>
        </div>
      </section>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className={wrapperClass}>
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-500 mb-6">{t.subtitle}</p>

        {isProductInquiry && (
          <div className="mb-6 rounded-lg border-2 border-[#6b7f3e] bg-[#f0f4e8] p-4">
            <p className="text-xs font-bold text-[#6b7f3e] uppercase tracking-wide mb-1">{t.productBadge}</p>
            <p className="text-base font-semibold text-gray-900">{produktInfo.name}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="betreff" className="block text-sm font-medium text-gray-700 mb-1">
              {t.labelSubject} <span className="text-red-500">*</span>
            </label>
            <select
              id="betreff"
              value={betreff}
              onChange={(e) => setBetreff(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors bg-white"
            >
              <option value="">{t.placeholderSubject}</option>
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>{s[locale]}</option>
              ))}
            </select>
          </div>

          {isProductInquiry && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wunschterminVon" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.labelDateFrom} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="wunschterminVon"
                    type="date"
                    value={wunschterminVon}
                    min={today}
                    onChange={(e) => setWunschterminVon(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="wunschterminBis" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.labelDateTo} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="wunschterminBis"
                    type="date"
                    value={wunschterminBis}
                    min={wunschterminVon || today}
                    onChange={(e) => setWunschterminBis(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="zeitraumFreitext" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.labelTimeRange}
                </label>
                <input
                  id="zeitraumFreitext"
                  type="text"
                  value={zeitraumFreitext}
                  onChange={(e) => setZeitraumFreitext(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                  placeholder={t.placeholderTimeRange}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">{t.trustNote}</p>
            </div>
          )}

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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelEmail} <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors"
                placeholder={t.placeholderEmail}
              />
            </div>
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
