'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { trackLeadSubmitted } from './lib/tracking';

const STRINGS = {
  de: {
    formTitle: 'Geschäftsadresse anfragen',
    pvWithout: 'Ohne Postversand',
    pvWith: 'Mit Postversand',
    phFirstName: 'Vorname',
    phLastName: 'Nachname',
    phEmail: 'E-Mail-Adresse',
    phPhone: 'Telefon',
    phCompany: 'Firmenname',
    firmaUnbekannt: 'Firma wird neu gegründet',
    legalFormPlaceholder: 'Rechtsform',
    legalForms: [
      { value: 'gmbh', label: 'GmbH' },
      { value: 'ug', label: 'UG (haftungsbeschränkt)' },
      { value: 'gmbh-co-kg', label: 'GmbH & Co. KG' },
      { value: 'ag', label: 'AG' },
      { value: 'ek', label: 'e.K.' },
      { value: 'einzelunternehmen', label: 'Einzelunternehmen' },
      { value: 'freiberufler', label: 'Freiberufler/in' },
      { value: 'gbr', label: 'GbR' },
      { value: 'sonstige', label: 'Sonstige' },
    ],
    phMessage: 'Ihre Nachricht (optional)',
    sending: 'Wird gesendet...',
    submit: 'Unverbindlich anfragen →',
    footnote: 'Keine Zahlungsdaten nötig · Angebot innerhalb 24h',
    successTitle: 'Anfrage erhalten!',
    successBody: 'Wir melden uns innerhalb von 24h.',
  },
  en: {
    formTitle: 'Request a business address',
    pvWithout: 'Without mail forwarding',
    pvWith: 'With mail forwarding',
    phFirstName: 'First name',
    phLastName: 'Last name',
    phEmail: 'Email address',
    phPhone: 'Phone',
    phCompany: 'Company name',
    firmaUnbekannt: 'Company is being newly founded',
    legalFormPlaceholder: 'Legal form',
    legalForms: [
      { value: 'gmbh', label: 'GmbH' },
      { value: 'ug', label: 'UG (mini-GmbH)' },
      { value: 'gmbh-co-kg', label: 'GmbH & Co. KG' },
      { value: 'ag', label: 'AG' },
      { value: 'ek', label: 'e.K.' },
      { value: 'einzelunternehmen', label: 'Sole proprietorship' },
      { value: 'freiberufler', label: 'Freelancer' },
      { value: 'gbr', label: 'GbR' },
      { value: 'sonstige', label: 'Other' },
    ],
    phMessage: 'Your message (optional)',
    sending: 'Sending...',
    submit: 'Request without obligation →',
    footnote: 'No payment details needed · Offer within 24h',
    successTitle: 'Request received!',
    successBody: 'We will get back to you within 24h.',
  },
  fr: {
    formTitle: 'Demander une adresse commerciale',
    pvWithout: 'Sans réexpédition du courrier',
    pvWith: 'Avec réexpédition du courrier',
    phFirstName: 'Prénom',
    phLastName: 'Nom',
    phEmail: 'Adresse e-mail',
    phPhone: 'Téléphone',
    phCompany: "Nom de l'entreprise",
    firmaUnbekannt: "L'entreprise est en cours de création",
    legalFormPlaceholder: 'Forme juridique',
    legalForms: [
      { value: 'gmbh', label: 'GmbH' },
      { value: 'ug', label: 'UG (SARL simplifiée)' },
      { value: 'gmbh-co-kg', label: 'GmbH & Co. KG' },
      { value: 'ag', label: 'AG' },
      { value: 'ek', label: 'e.K.' },
      { value: 'einzelunternehmen', label: 'Entreprise individuelle' },
      { value: 'freiberufler', label: 'Profession libérale' },
      { value: 'gbr', label: 'GbR' },
      { value: 'sonstige', label: 'Autre' },
    ],
    phMessage: 'Votre message (facultatif)',
    sending: 'Envoi en cours...',
    submit: 'Demander sans engagement →',
    footnote: 'Aucune donnée de paiement requise · Offre sous 24h',
    successTitle: 'Demande reçue !',
    successBody: 'Nous vous répondrons sous 24h.',
  },
  it: {
    formTitle: 'Richiedi indirizzo aziendale',
    pvWithout: 'Senza inoltro postale',
    pvWith: 'Con inoltro postale',
    phFirstName: 'Nome',
    phLastName: 'Cognome',
    phEmail: 'Indirizzo email',
    phPhone: 'Telefono',
    phCompany: "Nome dell'azienda",
    firmaUnbekannt: 'Azienda in fase di costituzione',
    legalFormPlaceholder: 'Forma giuridica',
    legalForms: [
      { value: 'gmbh', label: 'GmbH' },
      { value: 'ug', label: 'UG (responsabilità limitata)' },
      { value: 'gmbh-co-kg', label: 'GmbH & Co. KG' },
      { value: 'ag', label: 'AG' },
      { value: 'ek', label: 'e.K.' },
      { value: 'einzelunternehmen', label: 'Impresa individuale' },
      { value: 'freiberufler', label: 'Libero professionista' },
      { value: 'gbr', label: 'GbR' },
      { value: 'sonstige', label: 'Altro' },
    ],
    phMessage: 'Il tuo messaggio (facoltativo)',
    sending: 'Invio in corso...',
    submit: 'Richiedi senza impegno →',
    footnote: 'Nessun dato di pagamento · Offerta entro 24h',
    successTitle: 'Richiesta ricevuta!',
    successBody: 'Ti risponderemo entro 24h.',
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

interface Props {
  id?: string;
  title?: string;
  description?: string;
}

export function GeschaeftsadresseFormular({ id, title, description }: Props) {
  const locale = useLocale();
  const t = STRINGS[locale];

  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent'>('idle');
  const [postversand, setPostversand] = React.useState<'ohne' | 'mit'>('ohne');
  const [firmaUnbekannt, setFirmaUnbekannt] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((v, k) => { data[k] = v.toString(); });

    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vorname: data.vorname || '',
        nachname: data.nachname || '',
        firma: firmaUnbekannt ? '(Firma wird neu gegründet — Name noch unbekannt)' : (data.firma || ''),
        email: data.email || '',
        telefon: data.telefon || '',
        nachricht: [
          '--- Geschäftsadresse Anfrage ---',
          `Sprache: ${locale}`,
          `Postversand: ${postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand'}`,
          firmaUnbekannt ? 'Hinweis: Firma wird neu gegründet — Firmenname noch unbekannt' : '',
          data.rechtsform ? `Rechtsform: ${data.rechtsform}` : '',
          data.nachricht ? `Nachricht: ${data.nachricht}` : '',
        ].filter(Boolean).join('\n'),
        quelle: 'geschaeftsadresse-anfrage',
        product: 'geschaeftsadresse',
        timestamp: new Date().toISOString(),
      }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        trackLeadSubmitted('geschaeftsadresse_formular', { leadId: body?.leadId, postversand });
        setStatus('sent');
      })
      .catch(() => {
        trackLeadSubmitted('geschaeftsadresse_formular', { postversand });
        setStatus('sent');
      });
  }

  const formContent = status === 'sent' ? (
    <div className="text-center py-4">
      <div className="w-12 h-12 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-sm font-bold text-foreground">{t.successTitle}</p>
      <p className="text-xs text-muted-foreground mt-1">{t.successBody}</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{t.formTitle}</p>

      {/* Postversand Toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['ohne', 'mit'] as const).map(pv => (
          <button
            key={pv}
            type="button"
            onClick={() => setPostversand(pv)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
              postversand === pv
                ? 'border-[#6b7f3e] bg-[#f0f4e8] text-[#6b7f3e]'
                : 'border-border bg-background text-muted-foreground hover:border-[#6b7f3e]'
            }`}
          >
            {pv === 'ohne' ? t.pvWithout : t.pvWith}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input name="vorname" type="text" placeholder={t.phFirstName} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
        <input name="nachname" type="text" placeholder={t.phLastName} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
      </div>
      <input name="email" type="email" placeholder={t.phEmail} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
      <input name="telefon" type="tel" placeholder={t.phPhone} required minLength={6} maxLength={30} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
      <div className="grid grid-cols-2 gap-2">
        <input name="firma" type="text" placeholder={t.phCompany} required={!firmaUnbekannt} disabled={firmaUnbekannt} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] disabled:opacity-50 disabled:cursor-not-allowed" />
        <select name="rechtsform" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
          <option value="">{t.legalFormPlaceholder}</option>
          {t.legalForms.map(lf => (
            <option key={lf.value} value={lf.value}>{lf.label}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={firmaUnbekannt}
          onChange={(e) => setFirmaUnbekannt(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-[#6b7f3e] cursor-pointer"
        />
        <span>{t.firmaUnbekannt}</span>
      </label>
      <textarea
        name="nachricht"
        placeholder={t.phMessage}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] resize-none"
      />
      <button type="submit" disabled={status === 'sending'} className="w-full rounded-lg bg-[#6b7f3e] text-white px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
        {status === 'sending' ? t.sending : t.submit}
      </button>
      <p className="text-[10px] text-muted-foreground text-center">{t.footnote}</p>
    </form>
  );

  if (title) {
    return (
      <section id={id} className="py-12 md:py-16" style={{ scrollMarginTop: '100px' }}>
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground text-center mb-6">{description}</p>}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {formContent}
          </div>
        </div>
      </section>
    );
  }

  return formContent;
}
