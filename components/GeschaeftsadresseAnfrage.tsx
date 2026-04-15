'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// ─── Strings (i18n) ─────────────────────────────────────────────────

const STRINGS = {
  de: {
    defaultTitle: 'Geschäftsadresse anfragen',
    subtitle: 'Wählen Sie Ihren Wunschtarif — wir prüfen Ihre Angaben und senden Ihnen ein individuelles Vertragsangebot per E-Mail.',

    // Steps
    step1Title: '1. Postbearbeitung',
    pvWithout: 'Ohne Postversand',
    pvWith: 'Mit Postversand',
    pvWithoutDesc: 'Post wird vor Ort gesammelt, 24/7 abholbar',
    pvWithDesc: 'Wöchentliche Weiterleitung an eine Adresse im DACH-Raum',

    summerPromo: 'Sommeraktion — 35% Nachlass bis 30.09.2026',
    step2Title: '2. Tarif wählen',
    step2SubWith: 'Inkl. wöchentlicher Postweiterleitung',
    step2SubWithout: 'Ohne Postversand',
    step2VatNote: 'Alle Preise zzgl. MwSt.',
    popularBadge: 'Beliebt',
    perMonthVat: '/Mon. zzgl. MwSt.',

    // Tarife (lookup by id)
    tarifLabels: { langzeit: 'Langzeit', standard: 'Standard', flex: 'Flex' } as Record<string, string>,
    months: (n: number) => `${n} Monate`,

    step3Title: '3. Optionale Zusatzleistungen',
    step3Sub: 'Nicht verpflichtend — können auch später hinzugebucht werden.',
    chosen: '✓ Gewählt',
    addCta: '+ Hinzufügen',

    // Add-ons (lookup by id / price key)
    addonLabels: {
      scanpaket: 'Scanpaket',
      parkplatz: 'Parkplatz',
      firmenschild: 'Firmenschild',
      telefon: 'Telefonservice',
      sekretariat: 'Sekretariatsservice',
    } as Record<string, string>,
    addonPrices: {
      monthly49: 'EUR 49,-/Mon.',
      once179: 'EUR 179,- einmalig',
      onRequest: 'auf Anfrage',
    } as Record<string, string>,

    summaryTitle: 'Ihre Auswahl',
    summaryTarif: 'Tarif',
    summaryPv: 'Postversand',
    summaryMonthly: 'Monatlich',
    summaryPvWith: 'Mit Weiterleitung',
    summaryPvWithout: 'Ohne (Abholung vor Ort)',
    summaryVatNote: 'Alle Preise zzgl. MwSt.',

    step4Title: '4. Ihre Angaben',
    step4Sub: 'Wir prüfen Ihre Angaben und senden Ihnen ein verbindliches Angebot inkl. Vertrag per E-Mail zu.',

    labelCompany: 'Firmenname *',
    placeholderCompany: 'Musterfirma GmbH',
    labelLegalForm: 'Rechtsform',
    selectPlaceholder: 'Bitte wählen',
    labelHrNumber: 'Handelsregister-Nummer',
    placeholderHrNumber: 'z.B. HRB 12345 (falls vorhanden)',
    labelGewerbeschein: 'Gewerbeschein / Gewerbeanmeldung vorhanden',
    labelContact: 'Ansprechpartner *',
    placeholderContact: 'Vor- und Nachname',
    labelEmail: 'E-Mail *',
    placeholderEmail: 'ihre@email.de',
    labelPhone: 'Telefon *',
    placeholderPhone: '+49 123 456 789',
    labelStartDate: 'Gewünschter Starttermin',
    labelNotes: 'Anmerkungen / Fragen',
    placeholderNotes: 'z.B. besondere Anforderungen, Fragen zum Service...',

    errorSubmit: 'Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.',
    submitting: 'Wird gesendet...',
    submit: 'Unverbindlich anfragen',
    formFooter: '* Pflichtfelder · Keine Zahlungsdaten erforderlich · Wir melden uns innerhalb von 24h',

    successTitle: 'Anfrage erhalten',
    successBody: 'Vielen Dank für Ihr Interesse! Wir prüfen Ihre Angaben und melden uns innerhalb von 24 Stunden mit einem individuellen Vertragsangebot bei Ihnen.',
    successContact: 'Bei Rückfragen erreichen Sie uns unter',

    // Rechtsformen (legal entity types)
    rechtsformen: [
      'Einzelunternehmen',
      'GbR',
      'GmbH',
      'UG (haftungsbeschränkt)',
      'KG',
      'OHG',
      'AG',
      'Freiberufler',
      'Verein (e.V.)',
      'Zweigniederlassung',
      'Sonstige',
    ],

    // Steps at bottom
    finalStep1Title: 'Anfrage senden',
    finalStep1Desc: 'Wählen Sie Ihren Tarif und füllen Sie das Formular aus.',
    finalStep2Title: 'Wir prüfen & erstellen Ihr Angebot',
    finalStep2Desc: 'Innerhalb von 24h erhalten Sie ein individuelles Vertragsangebot per E-Mail.',
    finalStep3Title: 'Vertrag & Start',
    finalStep3Desc: 'Nach Unterschrift und Kaution ist Ihre Adresse innerhalb von 24h aktiv.',
  },
  en: {
    defaultTitle: 'Request a business address',
    subtitle: 'Choose your preferred plan — we will review your details and send you a custom contract proposal by email.',

    step1Title: '1. Mail handling',
    pvWithout: 'Without mail forwarding',
    pvWith: 'With mail forwarding',
    pvWithoutDesc: 'Mail is collected on site, accessible 24/7',
    pvWithDesc: 'Weekly forwarding to any address in the DACH region',

    summerPromo: 'Summer offer — 35% discount until 30.09.2026',
    step2Title: '2. Choose a plan',
    step2SubWith: 'Incl. weekly mail forwarding',
    step2SubWithout: 'Without mail forwarding',
    step2VatNote: 'All prices excl. VAT.',
    popularBadge: 'Popular',
    perMonthVat: '/month excl. VAT',

    tarifLabels: { langzeit: 'Long-term', standard: 'Standard', flex: 'Flex' } as Record<string, string>,
    months: (n: number) => `${n} months`,

    step3Title: '3. Optional add-ons',
    step3Sub: 'Not required — you can add them later too.',
    chosen: '✓ Selected',
    addCta: '+ Add',

    addonLabels: {
      scanpaket: 'Scan package',
      parkplatz: 'Parking',
      firmenschild: 'Company sign',
      telefon: 'Phone service',
      sekretariat: 'Secretarial service',
    } as Record<string, string>,
    addonPrices: {
      monthly49: 'EUR 49,-/month',
      once179: 'EUR 179,- one-time',
      onRequest: 'on request',
    } as Record<string, string>,

    summaryTitle: 'Your selection',
    summaryTarif: 'Plan',
    summaryPv: 'Mail handling',
    summaryMonthly: 'Monthly',
    summaryPvWith: 'With forwarding',
    summaryPvWithout: 'Without (on-site pickup)',
    summaryVatNote: 'All prices excl. VAT.',

    step4Title: '4. Your details',
    step4Sub: 'We will review your details and send you a binding offer with contract by email.',

    labelCompany: 'Company name *',
    placeholderCompany: 'Example Company Ltd.',
    labelLegalForm: 'Legal form',
    selectPlaceholder: 'Please select',
    labelHrNumber: 'Commercial register number',
    placeholderHrNumber: 'e.g. HRB 12345 (if applicable)',
    labelGewerbeschein: 'Trade registration / business license available',
    labelContact: 'Contact person *',
    placeholderContact: 'First and last name',
    labelEmail: 'Email *',
    placeholderEmail: 'your@email.com',
    labelPhone: 'Phone *',
    placeholderPhone: '+49 123 456 789',
    labelStartDate: 'Desired start date',
    labelNotes: 'Comments / questions',
    placeholderNotes: 'e.g. special requirements, questions about the service...',

    errorSubmit: 'There was a problem sending your request. Please try again.',
    submitting: 'Sending...',
    submit: 'Request without obligation',
    formFooter: '* Required · No payment details needed · We respond within 24h',

    successTitle: 'Request received',
    successBody: 'Thank you for your interest! We will review your details and get back to you within 24 hours with a custom contract proposal.',
    successContact: 'For questions, reach us at',

    rechtsformen: [
      'Sole proprietorship',
      'GbR (civil-law partnership)',
      'GmbH (limited liability)',
      'UG (mini-GmbH)',
      'KG (limited partnership)',
      'OHG (general partnership)',
      'AG (stock corporation)',
      'Freelancer',
      'Association (e.V.)',
      'Branch office',
      'Other',
    ],

    finalStep1Title: 'Send request',
    finalStep1Desc: 'Choose your plan and fill in the form.',
    finalStep2Title: 'We review & create your offer',
    finalStep2Desc: 'Within 24h you will receive a custom contract proposal by email.',
    finalStep3Title: 'Contract & start',
    finalStep3Desc: 'After signature and deposit, your address is active within 24h.',
  },
};

// ─── Static data (module level — stable across renders) ────────────

type AddonPriceKey = 'monthly49' | 'once179' | 'onRequest';

const TARIFE_DATA = [
  { id: 'langzeit', laufzeitMonths: 12, priceOhne: 49, priceMit: 79, popular: true },
  { id: 'standard', laufzeitMonths: 6, priceOhne: 69, priceMit: 99, popular: false },
  { id: 'flex', laufzeitMonths: 3, priceOhne: 99, priceMit: 129, popular: false },
];

const ADDONS_DATA: { id: string; priceKey: AddonPriceKey }[] = [
  { id: 'scanpaket', priceKey: 'monthly49' },
  { id: 'parkplatz', priceKey: 'monthly49' },
  { id: 'firmenschild', priceKey: 'once179' },
  { id: 'telefon', priceKey: 'onRequest' },
  { id: 'sekretariat', priceKey: 'onRequest' },
];

// ─── Component ───────────────────────────────────────────────────────

interface GeschaeftsadresseAnfrageProps {
  title?: string;
}

export function GeschaeftsadresseAnfrage({ title }: GeschaeftsadresseAnfrageProps) {
  const pathname = usePathname();
  const locale: 'de' | 'en' = pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];
  const effectiveTitle = title ?? t.defaultTitle;

  // Helpers to get labels from the locale-aware strings table
  const tarifLabel = (id: string) => t.tarifLabels[id] ?? id;
  const addonLabel = (id: string) => t.addonLabels[id] ?? id;
  const addonPrice = (priceKey: AddonPriceKey) => t.addonPrices[priceKey];

  // Selection state
  const [tarif, setTarif] = useState<string | null>(null);
  const [postversand, setPostversand] = useState<'ohne' | 'mit'>('ohne');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  // Form state
  const [firma, setFirma] = useState('');
  const [rechtsform, setRechtsform] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [hrNummer, setHrNummer] = useState('');
  const [gewerbeschein, setGewerbeschein] = useState(false);
  const [startdatum, setStartdatum] = useState('');
  const [nachricht, setNachricht] = useState('');

  // UI state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // ─── Silent Auto-Save (Partial Lead Tracking) ───────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHash = useRef<string>('');
  const partialSent = useRef(false);

  const buildPayload = useCallback(() => {
    const selectedTarifObj = TARIFE_DATA.find(ta => ta.id === tarif);
    const price = selectedTarifObj
      ? postversand === 'mit' ? selectedTarifObj.priceMit : selectedTarifObj.priceOhne
      : null;
    const addonLabelList = ADDONS_DATA
      .filter(a => selectedAddons.has(a.id))
      .map(a => t.addonLabels[a.id] ?? a.id);

    return {
      vorname: name,
      nachname: '',
      firma,
      email,
      telefon,
      nachricht: [
        `--- Geschäftsadresse Anfrage (Partial / Auto-Save) ---`,
        `Sprache: ${locale}`,
        tarif && selectedTarifObj ? `Tarif: ${t.tarifLabels[selectedTarifObj.id]} (${t.months(selectedTarifObj.laufzeitMonths)})` : '',
        `Postversand: ${postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand'}`,
        price ? `Preis: EUR ${price},-/Mon. zzgl. MwSt.` : '',
        rechtsform ? `Rechtsform: ${rechtsform}` : '',
        hrNummer ? `HR-Nummer: ${hrNummer}` : '',
        `Gewerbeschein vorhanden: ${gewerbeschein ? 'Ja' : 'Nein'}`,
        startdatum ? `Gewünschter Start: ${startdatum}` : '',
        addonLabelList.length > 0 ? `Add-ons: ${addonLabelList.join(', ')}` : '',
        nachricht ? `Nachricht: ${nachricht}` : '',
      ].filter(Boolean).join('\n'),
      quelle: 'geschaeftsadresse-partial',
      product: 'geschaeftsadresse',
      timestamp: new Date().toISOString(),
    };
  }, [tarif, postversand, selectedAddons, firma, rechtsform, name, email, telefon, hrNummer, gewerbeschein, startdatum, nachricht, locale, t]);

  // Debounced auto-save: fires 5s after last field change, only if enough data
  useEffect(() => {
    // Don't auto-save after successful submit
    if (sent) return;

    // Need at least (name + email) OR firma to track
    const hasMinData = (name.length >= 2 && email.includes('@')) || firma.length >= 2;
    if (!hasMinData) return;

    // Build a hash of current form state to avoid duplicate saves
    const hash = JSON.stringify({ tarif, postversand, firma, rechtsform, name, email, telefon, hrNummer, gewerbeschein, startdatum, nachricht, addons: [...selectedAddons].sort() });
    if (hash === lastSavedHash.current) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      const payload = buildPayload();
      // Mark as partial so it's distinguishable from real submissions
      if (partialSent.current) {
        payload.quelle = 'geschaeftsadresse-partial-update';
      }

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(() => {
        lastSavedHash.current = hash;
        partialSent.current = true;
      }).catch(() => { /* silent fail */ });
    }, 5000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [tarif, postversand, firma, rechtsform, name, email, telefon, hrNummer, gewerbeschein, startdatum, nachricht, selectedAddons, sent, buildPayload]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTarif = TARIFE_DATA.find(ta => ta.id === tarif);
  const currentPrice = selectedTarif
    ? postversand === 'mit'
      ? selectedTarif.priceMit
      : selectedTarif.priceOhne
    : null;

  const canSubmit = firma.length >= 2 && name.length >= 2 && email.includes('@') && email.includes('.') && telefon.length >= 6 && tarif;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setError('');

    try {
      const addonLabelList = ADDONS_DATA
        .filter(a => selectedAddons.has(a.id))
        .map(a => t.addonLabels[a.id] ?? a.id);

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: name,
          nachname: '',
          firma,
          email,
          telefon,
          nachricht: [
            `--- Geschäftsadresse Anfrage ---`,
            `Sprache: ${locale}`,
            selectedTarif ? `Tarif: ${t.tarifLabels[selectedTarif.id]} (${t.months(selectedTarif.laufzeitMonths)})` : '',
            `Postversand: ${postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand'}`,
            `Preis: EUR ${currentPrice},-/Mon. zzgl. MwSt.`,
            `Rechtsform: ${rechtsform || 'nicht angegeben'}`,
            `HR-Nummer: ${hrNummer || 'nicht angegeben'}`,
            `Gewerbeschein vorhanden: ${gewerbeschein ? 'Ja' : 'Nein'}`,
            `Gewünschter Start: ${startdatum || 'nicht angegeben'}`,
            addonLabelList.length > 0 ? `Add-ons: ${addonLabelList.join(', ')}` : '',
            nachricht ? `\nNachricht: ${nachricht}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
          quelle: 'geschaeftsadresse-anfrage',
          product: 'geschaeftsadresse',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');
      setSent(true);
    } catch {
      setError(t.errorSubmit);
    } finally {
      setSending(false);
    }
  };

  // ─── Success State ──────────────────────────────────────────────

  if (sent) {
    return (
      <section className="py-16 px-4" id="formular">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#f0f4e8] rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.successTitle}</h3>
            <p className="text-gray-600 mb-2">{t.successBody}</p>
            <p className="text-sm text-gray-500">
              {t.successContact}{' '}
              <a href="tel:+4976217960310" className="text-[#6b7f3e] font-medium hover:underline">
                +49 7621 796 0310
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────

  return (
    <section className="py-16 px-4" id="formular">
      <div className="max-w-3xl mx-auto">
        {effectiveTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{effectiveTitle}</h2>
        )}
        <p className="text-gray-500 text-center mb-10 text-sm">{t.subtitle}</p>

        {/* ── STEP 1: Postversand ── */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">{t.step1Title}</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['ohne', 'mit'] as const).map(pv => (
              <button
                key={pv}
                type="button"
                onClick={() => setPostversand(pv)}
                className={`rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                  postversand === pv
                    ? 'border-[#6b7f3e] bg-[#f0f4e8]'
                    : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">
                  {pv === 'ohne' ? t.pvWithout : t.pvWith}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {pv === 'ohne' ? t.pvWithoutDesc : t.pvWithDesc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 2: Tarif ── */}
        <div className="mb-8">
          <div className="mb-4 rounded-lg bg-[#6b7f3e] text-white text-center py-2 px-3">
            <p className="text-sm font-bold">{t.summerPromo}</p>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t.step2Title}</h3>
          <p className="text-xs text-gray-500 mb-3">
            {postversand === 'mit' ? t.step2SubWith : t.step2SubWithout} · {t.step2VatNote}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TARIFE_DATA.map(ta => {
              const price = postversand === 'mit' ? ta.priceMit : ta.priceOhne;
              return (
                <button
                  key={ta.id}
                  type="button"
                  onClick={() => setTarif(ta.id)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                    tarif === ta.id
                      ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm'
                      : ta.popular
                      ? 'border-[#6b7f3e]/50 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                      : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                  }`}
                >
                  {ta.popular && tarif !== ta.id && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">
                      {t.popularBadge}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900">{tarifLabel(ta.id)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.months(ta.laufzeitMonths)}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">EUR {price},-</p>
                  <p className="text-[10px] text-gray-400">{t.perMonthVat}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 3: Add-ons ── */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t.step3Title}</h3>
          <p className="text-xs text-gray-500 mb-3">{t.step3Sub}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ADDONS_DATA.map(addon => (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  selectedAddons.has(addon.id)
                    ? 'border-[#6b7f3e] bg-[#f0f4e8]'
                    : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{addonLabel(addon.id)}</div>
                <div className="text-xs font-bold text-gray-700 mt-0.5">+ {addonPrice(addon.priceKey)}</div>
                <div
                  className={`text-xs font-medium mt-1 ${
                    selectedAddons.has(addon.id) ? 'text-[#6b7f3e]' : 'text-[#6b7f3e]/50'
                  }`}
                >
                  {selectedAddons.has(addon.id) ? t.chosen : t.addCta}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Zusammenfassung ── */}
        {tarif && selectedTarif && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-8">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t.summaryTitle}</p>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">{t.summaryTarif}</span>
              <span className="font-medium text-gray-900">
                {tarifLabel(selectedTarif.id)} ({t.months(selectedTarif.laufzeitMonths)})
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">{t.summaryPv}</span>
              <span className="font-medium text-gray-900">
                {postversand === 'mit' ? t.summaryPvWith : t.summaryPvWithout}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">{t.summaryMonthly}</span>
              <span className="font-bold text-gray-900">EUR {currentPrice},-</span>
            </div>
            {selectedAddons.size > 0 && (
              <div className="border-t border-gray-200 mt-2 pt-2">
                {ADDONS_DATA.filter(a => selectedAddons.has(a.id)).map(a => (
                  <div key={a.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-500">+ {addonLabel(a.id)}</span>
                    <span className="font-medium text-gray-700">{addonPrice(a.priceKey)}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2 text-right">{t.summaryVatNote}</p>
          </div>
        )}

        {/* ── STEP 4: Anfrage-Formular ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t.step4Title}</h3>
          <p className="text-xs text-gray-500 mb-5">{t.step4Sub}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Firma + Rechtsform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelCompany}</label>
                <input
                  type="text"
                  value={firma}
                  onChange={e => setFirma(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder={t.placeholderCompany}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelLegalForm}</label>
                <select
                  value={rechtsform}
                  onChange={e => setRechtsform(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm bg-white"
                >
                  <option value="">{t.selectPlaceholder}</option>
                  {t.rechtsformen.map(rf => (
                    <option key={rf} value={rf}>
                      {rf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* HR-Nummer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelHrNumber}
              </label>
              <input
                type="text"
                value={hrNummer}
                onChange={e => setHrNummer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                placeholder={t.placeholderHrNumber}
              />
            </div>

            {/* Gewerbeschein */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="gewerbeschein"
                checked={gewerbeschein}
                onChange={e => setGewerbeschein(e.target.checked)}
                className="w-4 h-4 text-[#6b7f3e] border-gray-300 rounded focus:ring-[#6b7f3e]"
              />
              <label htmlFor="gewerbeschein" className="text-sm text-gray-700">
                {t.labelGewerbeschein}
              </label>
            </div>

            {/* Name + E-Mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.labelContact}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder={t.placeholderContact}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelEmail}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder={t.placeholderEmail}
                />
              </div>
            </div>

            {/* Telefon + Startdatum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelPhone}</label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={e => setTelefon(e.target.value)}
                  required
                  minLength={6}
                  maxLength={30}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                  placeholder={t.placeholderPhone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.labelStartDate}
                </label>
                <input
                  type="date"
                  value={startdatum}
                  onChange={e => setStartdatum(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none text-sm"
                />
              </div>
            </div>

            {/* Nachricht */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelNotes}
              </label>
              <textarea
                value={nachricht}
                onChange={e => setNachricht(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none resize-none text-sm"
                placeholder={t.placeholderNotes}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || sending}
              className="w-full py-3.5 px-6 bg-[#6b7f3e] text-white font-semibold rounded-lg hover:bg-[#5a6b34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
            >
              {sending ? t.submitting : t.submit}
            </button>

            <p className="text-xs text-gray-400 text-center">{t.formFooter}</p>
          </form>
        </div>

        {/* ── So geht's weiter ── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: t.finalStep1Title, desc: t.finalStep1Desc },
            { step: '2', title: t.finalStep2Title, desc: t.finalStep2Desc },
            { step: '3', title: t.finalStep3Title, desc: t.finalStep3Desc },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {s.step}
              </div>
              <p className="text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
