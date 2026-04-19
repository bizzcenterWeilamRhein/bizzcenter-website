'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

interface LeadFormProps {
  standort: string;
  angebotSlug: string;
  title?: string;
  description?: string;
}

const STRINGS = {
  de: {
    chooseDuration: 'Laufzeit wählen',
    cancellation: 'Kündigung',
    perMonth: '/Monat',
    popular: 'Beliebt',
    addMailForwarding: 'Postversand hinzubuchen',
    mailForwardingDesc: 'Wöchentliche Weiterleitung Ihrer Post',
    basePackage: 'Basispaket',
    mailForwarding: 'Postversand',
    totalPerMonth: 'Gesamt / Monat',
    plusVat: 'zzgl. MwSt.',
    nextStep: 'Weiter zu Ihren Daten',
    change: 'Ändern',
    labelSalutation: 'Anrede *',
    salutationPlaceholder: 'Bitte...',
    salutationMr: 'Herr',
    salutationMs: 'Frau',
    salutationMrDr: 'Herr Dr.',
    salutationMsDr: 'Frau Dr.',
    labelFirstName: 'Vorname *',
    labelLastName: 'Nachname *',
    labelCompany: 'Firma *',
    labelEmail: 'E-Mail *',
    emailPlaceholder: 'name@firma.de',
    labelMessage: 'Nachricht',
    messagePlaceholder: 'Ihre Fragen oder Anmerkungen...',
    back: 'Zurück',
    submitting: 'Angebot wird erstellt...',
    submit: 'Angebot erstellen',
    disclaimer: 'Kostenlos und unverbindlich. Wir melden uns umgehend.',
    postversandYes: 'ja',
    postversandNo: 'nein',
    duration12: '12 Monate',
    duration6: '6 Monate',
    duration3: '3 Monate',
    cancellationTerm: 'zum Quartalsende',
  },
  en: {
    chooseDuration: 'Choose duration',
    cancellation: 'Cancellation',
    perMonth: '/month',
    popular: 'Popular',
    addMailForwarding: 'Add mail forwarding',
    mailForwardingDesc: 'Weekly forwarding of your mail',
    basePackage: 'Base package',
    mailForwarding: 'Mail forwarding',
    totalPerMonth: 'Total / month',
    plusVat: 'plus VAT',
    nextStep: 'Continue to your details',
    change: 'Change',
    labelSalutation: 'Salutation *',
    salutationPlaceholder: 'Please...',
    salutationMr: 'Mr',
    salutationMs: 'Ms',
    salutationMrDr: 'Mr Dr',
    salutationMsDr: 'Ms Dr',
    labelFirstName: 'First name *',
    labelLastName: 'Last name *',
    labelCompany: 'Company *',
    labelEmail: 'Email *',
    emailPlaceholder: 'name@company.com',
    labelMessage: 'Message',
    messagePlaceholder: 'Your questions or comments...',
    back: 'Back',
    submitting: 'Creating quote...',
    submit: 'Create quote',
    disclaimer: 'Free and non-binding. We will get back to you shortly.',
    postversandYes: 'yes',
    postversandNo: 'no',
    duration12: '12 months',
    duration6: '6 months',
    duration3: '3 months',
    cancellationTerm: 'at end of quarter',
  },
  fr: {
    chooseDuration: 'Choisir la duree',
    cancellation: 'Resiliation',
    perMonth: '/mois',
    popular: 'Populaire',
    addMailForwarding: 'Ajouter le renvoi de courrier',
    mailForwardingDesc: 'Renvoi hebdomadaire de votre courrier',
    basePackage: 'Forfait de base',
    mailForwarding: 'Renvoi de courrier',
    totalPerMonth: 'Total / mois',
    plusVat: 'TVA en sus',
    nextStep: 'Continuer vers vos coordonnees',
    change: 'Modifier',
    labelSalutation: 'Civilite *',
    salutationPlaceholder: 'Veuillez...',
    salutationMr: 'M.',
    salutationMs: 'Mme',
    salutationMrDr: 'M. Dr',
    salutationMsDr: 'Mme Dr',
    labelFirstName: 'Prenom *',
    labelLastName: 'Nom *',
    labelCompany: 'Entreprise *',
    labelEmail: 'E-mail *',
    emailPlaceholder: 'nom@entreprise.fr',
    labelMessage: 'Message',
    messagePlaceholder: 'Vos questions ou remarques...',
    back: 'Retour',
    submitting: 'Creation du devis...',
    submit: 'Creer un devis',
    disclaimer: 'Gratuit et sans engagement. Nous vous recontactons rapidement.',
    postversandYes: 'oui',
    postversandNo: 'non',
    duration12: '12 mois',
    duration6: '6 mois',
    duration3: '3 mois',
    cancellationTerm: 'en fin de trimestre',
  },
};

type Locale = keyof typeof STRINGS;

interface Tarif {
  id: string;
  laufzeitKey: 'duration12' | 'duration6' | 'duration3';
  kuendigungKey: 'cancellationTerm';
  preis: number;
  beliebt?: boolean;
}

const TARIFE: Tarif[] = [
  { id: '12m', laufzeitKey: 'duration12', kuendigungKey: 'cancellationTerm', preis: 49, beliebt: true },
  { id: '6m', laufzeitKey: 'duration6', kuendigungKey: 'cancellationTerm', preis: 69 },
  { id: '3m', laufzeitKey: 'duration3', kuendigungKey: 'cancellationTerm', preis: 99 },
];

const POSTVERSAND_AUFPREIS = 30; // EUR/Monat

export function LeadForm({ standort, angebotSlug, title, description }: LeadFormProps) {
  const pathname = usePathname();
  const locale: Locale = pathname?.startsWith('/fr') ? 'fr' : pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];

  const [step, setStep] = useState(1);
  const [selectedTarif, setSelectedTarif] = useState('12m');
  const [mitPostversand, setMitPostversand] = useState(false);
  // Postversand Aufpreis — einheitlich

  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);

  const tarif = TARIFE.find(tf => tf.id === selectedTarif)!;
  const monatspreis = tarif.preis + (mitPostversand ? POSTVERSAND_AUFPREIS : 0);

  const canSubmit = anrede && vorname && nachname && firma && email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);

    const leadData = {
      anrede, vorname, nachname, firma, email, nachricht, standort,
      tarif: t[tarif.laufzeitKey],
      postversand: mitPostversand,
      monatspreis,
      timestamp: new Date().toISOString(),
      source: 'geschaeftsadresse-formular',
    };

    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
    } catch { /* Lead-Capture fehlgeschlagen — nicht blockieren */ }

    const params = new URLSearchParams({
      anrede, vorname, nachname, firma, email,
      ...(nachricht && { nachricht }),
      tarif: tarif.id,
      postversand: mitPostversand ? t.postversandYes : t.postversandNo,
    });

    window.location.href = `/angebot/${angebotSlug}?${params.toString()}`;
  };

  const inputCls = "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]";
  const labelCls = "text-xs font-medium text-foreground block mb-1";

  return (
    <div id="formular" className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8">
        {title && <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 1 ? 'bg-[#6b7f3e] text-white' : 'bg-[#f0f4e8] text-[#6b7f3e]'}`}>1</div>
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full transition-all ${step >= 2 ? 'bg-[#6b7f3e] w-full' : 'w-0'}`} /></div>
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 2 ? 'bg-[#6b7f3e] text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">{t.chooseDuration}</p>
              <div className="space-y-2">
                {TARIFE.map(tf => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setSelectedTarif(tf.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      selectedTarif === tf.id
                        ? 'border-[#6b7f3e] bg-[#f0f4e8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTarif === tf.id ? 'border-[#6b7f3e]' : 'border-gray-300'
                      }`}>
                        {selectedTarif === tf.id && <div className="w-2.5 h-2.5 rounded-full bg-[#6b7f3e]" />}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{t[tf.laufzeitKey]}</span>
                        <span className="text-xs text-gray-500 ml-2">{t.cancellation} {t[tf.kuendigungKey]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6b7f3e]">EUR {tf.preis},-</span>
                      <span className="text-xs text-gray-400">{t.perMonth}</span>
                      {tf.beliebt && <span className="text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">{t.popular}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Postversand Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setMitPostversand(!mitPostversand)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                  mitPostversand ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                    mitPostversand ? 'bg-[#6b7f3e] border-[#6b7f3e] text-white' : 'border-gray-300'
                  }`}>{mitPostversand && '✓'}</div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{t.addMailForwarding}</span>
                    <p className="text-xs text-gray-500">{t.mailForwardingDesc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#6b7f3e]">+ EUR {POSTVERSAND_AUFPREIS},-</span>
                  <span className="text-xs text-gray-400">{t.perMonth}</span>
                </div>
              </button>
            </div>

            {/* Zusammenfassung */}
            <div className="bg-[#f5f0eb] rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.basePackage} ({t[tarif.laufzeitKey]})</span>
                <span className="font-semibold">EUR {tarif.preis},-</span>
              </div>
              {mitPostversand && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">{t.mailForwarding}</span>
                  <span className="font-semibold">EUR {POSTVERSAND_AUFPREIS},-</span>
                </div>
              )}
              <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">{t.totalPerMonth}</span>
                <span className="font-bold text-[#6b7f3e]">EUR {monatspreis},- <span className="text-xs font-normal text-gray-400">{t.plusVat}</span></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-lg py-3 text-sm font-bold bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm transition-all"
            >
              {t.nextStep}
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Gewählter Tarif */}
            <div className="bg-[#f0f4e8] rounded-lg p-3 flex justify-between items-center mb-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">{t[tarif.laufzeitKey]}</span>
                {mitPostversand && <span className="text-gray-500"> + {t.mailForwarding}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#6b7f3e]">EUR {monatspreis},-{t.perMonth}</span>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#6b7f3e] underline">{t.change}</button>
              </div>
            </div>

            {/* Anrede + Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: '12px' }}>
              <div>
                <label className={labelCls}>{t.labelSalutation}</label>
                <select value={anrede} onChange={e => setAnrede(e.target.value)} className={inputCls}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', appearance: 'none' as const }}>
                  <option value="">{t.salutationPlaceholder}</option>
                  <option value={t.salutationMr}>{t.salutationMr}</option>
                  <option value={t.salutationMs}>{t.salutationMs}</option>
                  <option value={t.salutationMrDr}>{t.salutationMrDr}</option>
                  <option value={t.salutationMsDr}>{t.salutationMsDr}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.labelFirstName}</label>
                <input type="text" value={vorname} onChange={e => setVorname(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.labelLastName}</label>
                <input type="text" value={nachname} onChange={e => setNachname(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Firma */}
            <div>
              <label className={labelCls}>{t.labelCompany}</label>
              <input type="text" value={firma} onChange={e => setFirma(e.target.value)} className={inputCls} />
            </div>

            {/* E-Mail */}
            <div>
              <label className={labelCls}>{t.labelEmail}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className={inputCls} />
            </div>

            {/* Nachricht */}
            <div>
              <label className={labelCls}>{t.labelMessage}</label>
              <textarea value={nachricht} onChange={e => setNachricht(e.target.value)} rows={3}
                placeholder={t.messagePlaceholder} className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="rounded-lg py-3 px-5 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                {t.back}
              </button>
              <button type="submit" disabled={!canSubmit || sending}
                className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                  canSubmit && !sending ? 'bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {sending ? t.submitting : t.submit}
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              {t.disclaimer}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
