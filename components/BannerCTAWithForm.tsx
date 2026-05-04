'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackLeadSubmitted } from './lib/tracking';

const STRINGS = {
  de: {
    defaultTitle: 'Kontakt aufnehmen',
    defaultSubtext: 'Schreiben Sie uns — wir melden uns zeitnah bei Ihnen.',
    asCompany: 'Anfrage als Firma',
    asPrivate: 'Anfrage als Privatperson',
    phFirstName: 'Vorname *',
    phLastName: 'Nachname *',
    phCompany: 'Firmenname *',
    phPhone: 'Telefon *',
    bereichLabel: 'Worum geht es? *',
    bereichOptions: [
      { value: 'geschaeftsadresse', label: 'Geschäftsadresse' },
      { value: 'coworking', label: 'Coworking' },
      { value: 'buero', label: 'Büro mieten' },
      { value: 'konferenzraum', label: 'Konferenzraum / Meetingraum' },
      { value: 'sonstiges', label: 'Sonstiges' },
    ],
    phMessage: 'Ihre Anfrage *',
    sending: 'Wird gesendet...',
    submit: 'Nachricht senden',
    successTitle: 'Nachricht gesendet',
    successText: 'Vielen Dank! Wir melden uns zeitnah bei Ihnen.',
    errorMsg: 'Fehler beim Senden. Bitte versuchen Sie es erneut oder rufen Sie uns an.',
    privateMarker: 'Anfrage als Privatperson',
    companyMarker: 'Anfrage als Firma',
  },
  en: {
    defaultTitle: 'Get in touch',
    defaultSubtext: 'Send us a message — we will get back to you shortly.',
    asCompany: 'Request as company',
    asPrivate: 'Request as private person',
    phFirstName: 'First name *',
    phLastName: 'Last name *',
    phCompany: 'Company name *',
    phPhone: 'Phone *',
    bereichLabel: 'What is this about? *',
    bereichOptions: [
      { value: 'geschaeftsadresse', label: 'Business address' },
      { value: 'coworking', label: 'Coworking' },
      { value: 'buero', label: 'Rent an office' },
      { value: 'konferenzraum', label: 'Conference / Meeting room' },
      { value: 'sonstiges', label: 'Other' },
    ],
    phMessage: 'Your request *',
    sending: 'Sending...',
    submit: 'Send message',
    successTitle: 'Message sent',
    successText: 'Thank you! We will get back to you shortly.',
    errorMsg: 'Error sending. Please try again or call us.',
    privateMarker: 'Request as private person',
    companyMarker: 'Request as company',
  },
  fr: {
    defaultTitle: 'Nous contacter',
    defaultSubtext: 'Écrivez-nous — nous vous répondrons rapidement.',
    asCompany: "Demande en tant qu'entreprise",
    asPrivate: 'Demande en tant que particulier',
    phFirstName: 'Prénom *',
    phLastName: 'Nom *',
    phCompany: "Nom de l'entreprise *",
    phPhone: 'Téléphone *',
    bereichLabel: "De quoi s'agit-il ? *",
    bereichOptions: [
      { value: 'geschaeftsadresse', label: 'Adresse commerciale' },
      { value: 'coworking', label: 'Coworking' },
      { value: 'buero', label: 'Louer un bureau' },
      { value: 'konferenzraum', label: 'Salle de conférence / réunion' },
      { value: 'sonstiges', label: 'Autre' },
    ],
    phMessage: 'Votre demande *',
    sending: 'Envoi en cours...',
    submit: 'Envoyer le message',
    successTitle: 'Message envoyé',
    successText: 'Merci ! Nous vous répondrons rapidement.',
    errorMsg: "Erreur lors de l'envoi. Veuillez réessayer ou nous appeler.",
    privateMarker: 'Demande en tant que particulier',
    companyMarker: "Demande en tant qu'entreprise",
  },
  it: {
    defaultTitle: 'Contattaci',
    defaultSubtext: 'Scrivici — ti risponderemo a breve.',
    asCompany: 'Richiesta come azienda',
    asPrivate: 'Richiesta come privato',
    phFirstName: 'Nome *',
    phLastName: 'Cognome *',
    phCompany: "Nome dell'azienda *",
    phPhone: 'Telefono *',
    bereichLabel: 'Di cosa si tratta? *',
    bereichOptions: [
      { value: 'geschaeftsadresse', label: 'Indirizzo commerciale' },
      { value: 'coworking', label: 'Coworking' },
      { value: 'buero', label: 'Affittare ufficio' },
      { value: 'konferenzraum', label: 'Sala riunioni / conferenze' },
      { value: 'sonstiges', label: 'Altro' },
    ],
    phMessage: 'La tua richiesta *',
    sending: 'Invio in corso...',
    submit: 'Invia messaggio',
    successTitle: 'Messaggio inviato',
    successText: 'Grazie! Ti risponderemo a breve.',
    errorMsg: "Errore durante l'invio. Riprova o chiamaci.",
    privateMarker: 'Richiesta come privato',
    companyMarker: 'Richiesta come azienda',
  },
};

type Locale = keyof typeof STRINGS;

function useLocale(): Locale {
  const pathname = usePathname();
  if (pathname?.startsWith('/it')) return 'it';
  if (pathname?.startsWith('/fr')) return 'fr';
  if (pathname?.startsWith('/en')) return 'en';
  return 'de';
}

interface BannerCTAWithFormProps {
  title?: string;
  subtext?: string;
  backgroundImage?: string;
}

export function BannerCTAWithForm({
  title,
  subtext,
  backgroundImage = '/images/hero/kesselhaus.jpg',
}: BannerCTAWithFormProps) {
  const locale = useLocale();
  const t = STRINGS[locale];

  const headlineText = title ?? t.defaultTitle;
  const subtextText = subtext ?? t.defaultSubtext;

  const [anfrageAls, setAnfrageAls] = useState<'firma' | 'privat'>('firma');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [telefon, setTelefon] = useState('');
  const [bereich, setBereich] = useState('');
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
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    form.addEventListener('focusin', handleFocusIn);
    return () => form.removeEventListener('focusin', handleFocusIn);
  }, []);

  const canSubmit =
    vorname.length >= 2 &&
    nachname.length >= 2 &&
    telefon.length >= 6 &&
    nachricht.length >= 10 &&
    bereich !== '' &&
    (anfrageAls === 'privat' || firma.length >= 2);

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
          firma: anfrageAls === 'firma' ? firma : '',
          telefon,
          nachricht,
          quelle: 'hero-formular',
          product: 'startseite',
          bedarfKategorie: bereich,
          bemerkungen: `${anfrageAls === 'privat' ? t.privateMarker : t.companyMarker} · Sprache: ${locale}`,
        }),
      });
      if (!res.ok) throw new Error('Fehler');
      const responseData = await res.json().catch(() => ({}));
      trackLeadSubmitted('banner_cta_startseite', { leadId: responseData?.leadId, anfrageAls, bereich });
      setSent(true);
    } catch {
      setError(t.errorMsg);
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{headlineText}</h2>
          <p className="text-lg text-white/80 mb-6">{subtextText}</p>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 text-[#6b7f3e]">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
              <p className="text-gray-600">{t.successText}</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Anfrageart-Toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(['firma', 'privat'] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setAnfrageAls(kind)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                      anfrageAls === kind
                        ? 'border-[#6b7f3e] bg-[#f0f4e8] text-[#6b7f3e]'
                        : 'border-gray-300 bg-white text-gray-500 hover:border-[#6b7f3e]'
                    }`}
                  >
                    {kind === 'firma' ? t.asCompany : t.asPrivate}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" value={vorname} onChange={(e) => setVorname(e.target.value)}
                  placeholder={t.phFirstName} required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
                <input
                  type="text" value={nachname} onChange={(e) => setNachname(e.target.value)}
                  placeholder={t.phLastName} required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
              </div>
              {anfrageAls === 'firma' ? (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" value={firma} onChange={(e) => setFirma(e.target.value)}
                    placeholder={t.phCompany} required minLength={2} maxLength={200}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  />
                  <input
                    type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                    placeholder={t.phPhone} required minLength={6} maxLength={30}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  />
                </div>
              ) : (
                <input
                  type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                  placeholder={t.phPhone} required minLength={6} maxLength={30}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
              )}
              <select
                value={bereich} onChange={(e) => setBereich(e.target.value)} required
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white ${bereich === '' ? 'text-gray-500' : 'text-gray-900'}`}
              >
                <option value="" disabled>{t.bereichLabel}</option>
                {t.bereichOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <textarea
                value={nachricht} onChange={(e) => setNachricht(e.target.value)}
                placeholder={t.phMessage} required minLength={10} maxLength={2000} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm resize-y"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit" disabled={!canSubmit || sending}
                className="w-full bg-[#6b7f3e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5a6c34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? t.sending : t.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
