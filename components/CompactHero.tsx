'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface CompactHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  buttonText?: string;
  buttonHref?: string;
  formId?: string;
  formVariant?: 'default' | 'geschaeftsadresse';
  children?: React.ReactNode;
}

export function CompactHero({ title, description, image, imageAlt, imagePosition, buttonText, buttonHref, formId, formVariant = 'default', children }: CompactHeroProps) {
  return (
    <>
      {/* Mobile: Bild mit Text-Overlay, Bullets darunter */}
      <section className="xl:hidden relative">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            {description && <p className="text-sm text-white/90">{description}</p>}
          </div>
        </div>
        <div className="px-4 py-4">
          {children}
          {buttonText && buttonHref && (
            <div className="mt-4">
              <a
                href={buttonHref}
                className="inline-flex items-center justify-center w-full rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {buttonText}
              </a>
            </div>
          )}
          {formId && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5" id={`${formId}-mobile`} style={{scrollMarginTop: '100px'}}>
              {formVariant === 'geschaeftsadresse' ? <GeschaeftsadresseHeroForm /> : <HeroForm />}
            </div>
          )}
        </div>
      </section>

      {/* Desktop: Bild volle Breite, Info links + Formular rechts */}
      <section className="hidden xl:block relative">
        <div className="relative overflow-hidden" style={{aspectRatio: '21/10'}}>
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: imagePosition || 'center' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-8 xl:px-16">
          <div className="flex flex-wrap items-stretch justify-center gap-6 xl:gap-10 max-w-6xl w-full">
            <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-8 shadow-lg min-w-0 flex-1" style={{minWidth: '340px', maxWidth: '560px'}}>
              <h1 className="text-2xl xl:text-4xl font-bold text-foreground mb-2">{title}</h1>
              {description && <p className="text-sm xl:text-base text-muted-foreground mb-3">{description}</p>}
              {children}
              {buttonText && buttonHref && (
                <div className="mt-4">
                  <a
                    href={buttonHref}
                    className="inline-flex items-center justify-center rounded-lg bg-[#6b7f3e] text-white px-8 py-3 text-sm font-semibold hover:opacity-90 transition-opacity no-underline shadow-sm"
                  >
                    {buttonText} →
                  </a>
                </div>
              )}
            </div>
            {formId && (
              <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-6 shadow-lg flex flex-col justify-center min-w-0 flex-1" style={{minWidth: '320px', maxWidth: '420px', scrollMarginTop: '100px'}} id={formId}>
                {formVariant === 'geschaeftsadresse' ? <GeschaeftsadresseHeroForm /> : <HeroForm />}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── i18n strings for inner hero forms ──────────────────────────────

const HERO_STRINGS = {
  de: {
    // HeroForm (generic quote form)
    heroTitle: 'Angebot in 2 Minuten erstellen',
    phFirstName: 'Vorname',
    phLastName: 'Nachname',
    phEmail: 'E-Mail-Adresse',
    phCompany: 'Firmenname (optional)',
    phCompanyRequired: 'Firmenname',
    phPhone: 'Telefon',
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
    heroCreating: 'Wird erstellt...',
    heroCreate: 'Angebot erstellen →',
    heroFootnote: 'Kostenlos & unverbindlich · Keine Kreditkarte nötig',

    // Tarif labels (used in HeroForm badge)
    tarifLabels: {
      tagespass: 'Tagespass — EUR 25,- zzgl. MwSt.',
      zehnerkarte: '10er-Karte — EUR 209,- zzgl. MwSt.',
      monatspass: 'Monatspass — EUR 219,- zzgl. MwSt.',
      monatsabo: 'Monatsabo — EUR 199,- zzgl. MwSt.',
    } as Record<string, string>,

    // GeschaeftsadresseHeroForm
    gaHeroTitle: 'Geschäftsadresse anfragen',
    pvWithout: 'Ohne Postversand',
    pvWith: 'Mit Postversand',
    gaSending: 'Wird gesendet...',
    gaSubmit: 'Unverbindlich anfragen →',
    gaFootnote: 'Keine Zahlungsdaten nötig · Angebot innerhalb 24h',
    gaSuccessTitle: 'Anfrage erhalten!',
    gaSuccessBody: 'Wir melden uns innerhalb von 24h.',
  },
  en: {
    heroTitle: 'Create a quote in 2 minutes',
    phFirstName: 'First name',
    phLastName: 'Last name',
    phEmail: 'Email address',
    phCompany: 'Company name (optional)',
    phCompanyRequired: 'Company name',
    phPhone: 'Phone',
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
    heroCreating: 'Creating...',
    heroCreate: 'Create quote →',
    heroFootnote: 'Free & no obligation · No credit card required',

    tarifLabels: {
      tagespass: 'Day pass — EUR 25,- excl. VAT',
      zehnerkarte: '10-day pass — EUR 209,- excl. VAT',
      monatspass: 'Monthly pass — EUR 219,- excl. VAT',
      monatsabo: 'Monthly subscription — EUR 199,- excl. VAT',
    } as Record<string, string>,

    gaHeroTitle: 'Request a business address',
    pvWithout: 'Without mail forwarding',
    pvWith: 'With mail forwarding',
    gaSending: 'Sending...',
    gaSubmit: 'Request without obligation →',
    gaFootnote: 'No payment details needed · Offer within 24h',
    gaSuccessTitle: 'Request received!',
    gaSuccessBody: 'We will get back to you within 24h.',
  },
  fr: {
    heroTitle: 'Obtenir une offre en 2 minutes',
    phFirstName: 'Prénom',
    phLastName: 'Nom',
    phEmail: 'Adresse e-mail',
    phCompany: 'Nom de l\'entreprise (facultatif)',
    phCompanyRequired: 'Nom de l\'entreprise',
    phPhone: 'Téléphone',
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
    heroCreating: 'Création en cours...',
    heroCreate: 'Créer l\'offre →',
    heroFootnote: 'Gratuit et sans engagement · Aucune carte bancaire requise',

    tarifLabels: {
      tagespass: 'Pass journalier — EUR 25,- HT',
      zehnerkarte: 'Carte 10 jours — EUR 209,- HT',
      monatspass: 'Pass mensuel — EUR 219,- HT',
      monatsabo: 'Abonnement mensuel — EUR 199,- HT',
    } as Record<string, string>,

    gaHeroTitle: 'Demander une adresse commerciale',
    pvWithout: 'Sans réexpédition du courrier',
    pvWith: 'Avec réexpédition du courrier',
    gaSending: 'Envoi en cours...',
    gaSubmit: 'Demander sans engagement →',
    gaFootnote: 'Aucune donnée de paiement requise · Offre sous 24h',
    gaSuccessTitle: 'Demande reçue !',
    gaSuccessBody: 'Nous vous répondrons sous 24h.',
  },
};

function useLocale(): 'de' | 'en' | 'fr' {
  const pathname = usePathname();
  if (pathname?.startsWith('/fr')) return 'fr';
  if (pathname?.startsWith('/en')) return 'en';
  return 'de';
}

function HeroForm() {
  const locale = useLocale();
  const t = HERO_STRINGS[locale];

  const [status, setStatus] = React.useState<'idle' | 'sending'>('idle');
  const [selectedTarif, setSelectedTarif] = React.useState<string | null>(null);

  React.useEffect(() => {
    function onTarifSelected(e: Event) {
      const detail = (e as CustomEvent).detail;
      setSelectedTarif(detail);
    }
    window.addEventListener('tarif-selected', onTarifSelected);
    return () => window.removeEventListener('tarif-selected', onTarifSelected);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((v, k) => { data[k] = v.toString(); });

    // Lead erfassen (fire-and-forget)
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, quelle: 'hero-formular', bemerkungen: `Sprache: ${locale}`, timestamp: new Date().toISOString() }),
    }).catch(() => {});

    // GCLID mitführen
    const urlGclid = new URLSearchParams(window.location.search).get('gclid') || document.cookie.match(/gclid=([^;]+)/)?.[1] || '';

    // Weiterleitung zum Angebot mit Segmentierung
    const params = new URLSearchParams({
      ...(data.vorname && { vorname: data.vorname }),
      ...(data.nachname && { nachname: data.nachname }),
      ...(data.email && { email: data.email }),
      ...(data.firma && { firma: data.firma }),
      ...(data.rechtsform && { rechtsform: data.rechtsform }),
      ...(urlGclid && { gclid: urlGclid }),
      ...(selectedTarif && { tarif: selectedTarif }),
    });
    window.location.href = `/angebot/kunde-xyz?${params.toString()}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{t.heroTitle}</p>
      {selectedTarif && (
        <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-sm text-primary font-semibold text-center">
          {t.tarifLabels[selectedTarif] || selectedTarif}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input name="vorname" type="text" placeholder={t.phFirstName} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
        <input name="nachname" type="text" placeholder={t.phLastName} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
      </div>
      <input name="email" type="email" placeholder={t.phEmail} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
      <div className="grid grid-cols-2 gap-2">
        <input name="firma" type="text" placeholder={t.phCompany} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
        <select name="rechtsform" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
          <option value="">{t.legalFormPlaceholder}</option>
          {t.legalForms.map(lf => (
            <option key={lf.value} value={lf.value}>{lf.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={status === 'sending'} className="w-full rounded-lg bg-[#6b7f3e] text-white px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
        {status === 'sending' ? t.heroCreating : t.heroCreate}
      </button>
      <p className="text-[10px] text-muted-foreground text-center">{t.heroFootnote}</p>
    </form>
  );
}

function GeschaeftsadresseHeroForm() {
  const locale = useLocale();
  const t = HERO_STRINGS[locale];

  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent'>('idle');
  const [postversand, setPostversand] = React.useState<'ohne' | 'mit'>('ohne');

  // Silent auto-save refs
  const autoSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHash = React.useRef<string>('');
  const formRef = React.useRef<HTMLFormElement>(null);

  // Debounced auto-save on any input change
  const triggerAutoSave = React.useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const vorname = (fd.get('vorname') as string || '').trim();
    const email = (fd.get('email') as string || '').trim();
    const firma = (fd.get('firma') as string || '').trim();
    const telefon = (fd.get('telefon') as string || '').trim();

    // Need at least (name + email) or firma
    const hasMin = (vorname.length >= 2 && email.includes('@')) || firma.length >= 2;
    if (!hasMin) return;

    const hash = JSON.stringify({ vorname, nachname: fd.get('nachname'), email, telefon, firma, rechtsform: fd.get('rechtsform'), postversand });
    if (hash === lastSavedHash.current) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname,
          nachname: (fd.get('nachname') as string || '').trim(),
          firma,
          email,
          telefon,
          nachricht: [
            '--- Geschäftsadresse (Hero-Formular, Auto-Save) ---',
            `Sprache: ${locale}`,
            `Postversand: ${postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand'}`,
            fd.get('rechtsform') ? `Rechtsform: ${fd.get('rechtsform')}` : '',
          ].filter(Boolean).join('\n'),
          quelle: 'geschaeftsadresse-partial',
          product: 'geschaeftsadresse',
          timestamp: new Date().toISOString(),
        }),
      }).then(() => { lastSavedHash.current = hash; }).catch(() => {});
    }, 5000);
  }, [postversand, locale]);

  // Also trigger on postversand change
  React.useEffect(() => { triggerAutoSave(); }, [postversand, triggerAutoSave]);

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
        firma: data.firma || '',
        email: data.email || '',
        telefon: data.telefon || '',
        nachricht: [
          '--- Geschäftsadresse Anfrage (Hero-Formular) ---',
          `Sprache: ${locale}`,
          `Postversand: ${postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand'}`,
          data.rechtsform ? `Rechtsform: ${data.rechtsform}` : '',
        ].filter(Boolean).join('\n'),
        quelle: 'geschaeftsadresse-anfrage',
        product: 'geschaeftsadresse',
        timestamp: new Date().toISOString(),
      }),
    }).then(() => setStatus('sent')).catch(() => setStatus('sent'));
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-bold text-foreground">{t.gaSuccessTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">{t.gaSuccessBody}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onChange={() => triggerAutoSave()} className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{t.gaHeroTitle}</p>

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
        <input name="firma" type="text" placeholder={t.phCompanyRequired} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
        <select name="rechtsform" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
          <option value="">{t.legalFormPlaceholder}</option>
          {t.legalForms.map(lf => (
            <option key={lf.value} value={lf.value}>{lf.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={status === 'sending'} className="w-full rounded-lg bg-[#6b7f3e] text-white px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
        {status === 'sending' ? t.gaSending : t.gaSubmit}
      </button>
      <p className="text-[10px] text-muted-foreground text-center">{t.gaFootnote}</p>
    </form>
  );
}
