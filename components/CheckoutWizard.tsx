'use client';

import React, { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

type ProductType = 'geschaeftsadresse' | 'coworking' | 'konferenzraum' | 'tagesbuero';

interface CheckoutWizardProps {
  product: ProductType;
  title?: string;
}

// ─── Stripe Price Mapping ────────────────────────────────────────────

const PRICE_MAP: Record<string, string> = {
  // Geschäftsadresse
  'ga_langzeit_ohne': 'price_1T9o4dJHXQhpcKhgA8cu5FcA',
  'ga_langzeit_mit': 'price_1T9o4eJHXQhpcKhgWi9nmIQF',
  'ga_standard_ohne': 'price_1T9o4eJHXQhpcKhgtxHqtpSm',
  'ga_standard_mit': 'price_1T9o4fJHXQhpcKhgVUSTXDQO',
  'ga_flex_ohne': 'price_1T9o4fJHXQhpcKhgOKE5WU5B',
  'ga_flex_mit': 'price_1T9o4fJHXQhpcKhgSXt3fi94',
  // Coworking
  'cw_tagespass': 'price_1T9o4gJHXQhpcKhgEvhhl86t',
  'cw_10er': 'price_1T9o4hJHXQhpcKhgQt7Bk7FH',
  'cw_monatspass': 'price_1T9o4hJHXQhpcKhgnqb5WlC4',
  'cw_monatsabo': 'price_1T9o4iJHXQhpcKhgGxLmtUuF',
  // Konferenzraum
  'konf_2pers_stunde': 'price_1T9o4iJHXQhpcKhg4f9q97J1',
  'konf_2pers_halbtags': 'price_1T9o4jJHXQhpcKhgp5AvD6QK',
  'konf_2pers_ganztags': 'price_1T9o4jJHXQhpcKhgrj6QlJGS',
  'konf_6pers_stunde': 'price_1T9o4kJHXQhpcKhgbS2UfXjY',
  'konf_6pers_halbtags': 'price_1T9o4kJHXQhpcKhgqVSqiMjy',
  'konf_6pers_ganztags': 'price_1T9o4kJHXQhpcKhgOrwa5ho1',
  'konf_15pers_stunde': 'price_1T9o4lJHXQhpcKhg1JDdKkrK',
  'konf_15pers_halbtags': 'price_1T9o4lJHXQhpcKhgjJ4IrXtw',
  'konf_15pers_ganztags': 'price_1T9o4lJHXQhpcKhgC44iUAis',
  'konf_25pers_stunde': 'price_1T9o4mJHXQhpcKhgF1yIo7oX',
  'konf_25pers_halbtags': 'price_1T9o4mJHXQhpcKhggHANaEYb',
  'konf_25pers_ganztags': 'price_1T9o4mJHXQhpcKhgrbx9LCJ8',
  // Tagesbüro
  'tb': 'price_1T9o4nJHXQhpcKhgqrQ95gxs',
  // Add-ons
  'addon_parkplatz': 'price_1T9o4oJHXQhpcKhgbEUDDEwb',
  'addon_kaffee': 'price_1T9o4oJHXQhpcKhgsLkqzfRu',
  'addon_monitor': 'price_1T9o4pJHXQhpcKhgyjto6kpz',
  'addon_schrank': 'price_1T9o4pJHXQhpcKhgFsScY4uu',
  'addon_scan': 'price_1T9o4qJHXQhpcKhgtzdpeiKG',
  'addon_firmenschild': 'price_1T9o4rJHXQhpcKhgKee1emBB',
  // Tagespass Add-ons (Einzelpreise pro Tag)
  'addon_kaffee_tag': 'price_1T9pwHJHXQhpcKhge5UguPpX',
  'addon_parkplatz_tag': 'price_1T9pwMJHXQhpcKhgvhgn43QW',
};

// ─── Product Configs ─────────────────────────────────────────────────

const GA_TARIFE = [
  { id: 'langzeit', label: 'Langzeit', laufzeit: '12 Monate', price: 49, popular: true },
  { id: 'standard', label: 'Standard', laufzeit: '6 Monate', price: 69 },
  { id: 'flex', label: 'Flex', laufzeit: '3 Monate', price: 99 },
];

const CW_TARIFE = [
  { id: 'tagespass', label: 'Tagespass', price: 25, sub: 'pro Tag', badge: '−16%' },
  { id: '10er', label: '10er-Karte', price: 209, sub: 'einmalig', badge: '−16%' },
  { id: 'monatspass', label: 'Monatspass', price: 219, sub: 'pro Monat · flexibel zum Monatsende kündbar', popular: true, badge: '−16%' },
  { id: 'monatsabo', label: 'Monatsabo', price: 199, sub: 'pro Monat · 3 Monate Kündigungsfrist', badge: '−16%' },
];

const KONF_ROOMS = [
  { id: '2pers', label: 'Bis 2 Personen', desc: 'Kleiner Meetingraum' },
  { id: '6pers', label: 'Bis 6 Personen', desc: 'Meetingraum' },
  { id: '15pers', label: 'Bis 15 Personen', desc: 'Konferenzraum' },
  { id: '25pers', label: 'Bis 25 Personen', desc: 'Großer Konferenzraum' },
];

const KONF_DAUER = [
  { id: 'stunde', label: 'Stundenweise' },
  { id: 'halbtags', label: 'Halbtags' },
  { id: 'ganztags', label: 'Ganztags' },
];

const KONF_PREISE: Record<string, Record<string, number>> = {
  '2pers': { stunde: 19, halbtags: 59, ganztags: 89 },
  '6pers': { stunde: 29, halbtags: 89, ganztags: 129 },
  '15pers': { stunde: 39, halbtags: 99, ganztags: 159 },
  '25pers': { stunde: 49, halbtags: 129, ganztags: 199 },
};

const ADDONS_BY_PRODUCT: Record<ProductType, { id: string; label: string; price: string; monthly: boolean }[]> = {
  geschaeftsadresse: [
    { id: 'scan', label: 'Scanpaket', price: 'EUR 49,-/Mon.', monthly: true },
    { id: 'parkplatz', label: 'Parkplatz', price: 'EUR 49,-/Mon.', monthly: true },
    { id: 'firmenschild', label: 'Firmenschild', price: 'EUR 179,- einmalig', monthly: false },
  ],
  coworking: [
    { id: 'parkplatz', label: 'Parkplatz', price: 'EUR 49,-/Mon.', monthly: true },
    { id: 'kaffee', label: 'Kaffee-Flat', price: 'EUR 29,-/Mon.', monthly: true },
    { id: 'monitor', label: '27" Monitor', price: 'EUR 27,-/Mon.', monthly: true },
    { id: 'schrank', label: 'Aktenschrank', price: 'EUR 19,-/Mon.', monthly: true },
  ],
  konferenzraum: [
    { id: 'parkplatz', label: 'Parkplatz', price: 'EUR 49,-/Mon.', monthly: true },
    { id: 'kaffee', label: 'Kaffee-Flat', price: 'EUR 29,-/Mon.', monthly: true },
  ],
  tagesbuero: [
    { id: 'parkplatz', label: 'Parkplatz', price: 'EUR 49,-/Mon.', monthly: true },
    { id: 'kaffee', label: 'Kaffee-Flat', price: 'EUR 29,-/Mon.', monthly: true },
    { id: 'monitor', label: '27" Monitor', price: 'EUR 27,-/Mon.', monthly: true },
  ],
};

// Tagespass-spezifische Add-ons (Einzelpreise pro Tag, nicht monatlich)
const CW_TAGESPASS_ADDONS = [
  { id: 'kaffee_tag', label: 'Kaffee-Flat', price: 'EUR 9,-', monthly: false },
  { id: 'parkplatz_tag', label: 'Parkplatz', price: 'EUR 6,-', monthly: false },
];

// 10er-Karte Add-ons (10x Tagespreis, einmalig)
const CW_10ER_ADDONS = [
  { id: 'kaffee_10er', label: '10x Kaffee-Flat', price: 'EUR 90,-', monthly: false },
  { id: 'parkplatz_10er', label: '10x Parkplatz', price: 'EUR 60,-', monthly: false },
];

// ─── Helper Components ───────────────────────────────────────────────

function StepBadge({ number, done, active }: { number: number; done: boolean; active: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
      done ? 'bg-[#6b7f3e] text-white' : active ? 'bg-[#6b7f3e] text-white' : 'bg-[#e8e3d6] text-[#6b7f3e]'
    }`}>
      {done ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : number}
    </div>
  );
}

function OptionCard({ selected, onClick, children, popular, centered }: { selected: boolean; onClick: () => void; children: React.ReactNode; popular?: boolean; centered?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border-2 p-4 ${centered !== false ? 'text-center' : 'text-left'} transition-all cursor-pointer ${
        selected
          ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm'
          : popular
          ? 'border-[#6b7f3e]/50 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
          : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
      }`}
    >
      {popular && !selected && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">Beliebt</span>
      )}
      {children}
    </button>
  );
}

function AddonToggle({ addon, selected, onToggle }: { addon: { id: string; label: string; price: string }; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
        selected ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
      }`}
    >
      <div className="text-sm font-semibold text-gray-900">{addon.label}</div>
      <div className="text-xs font-bold text-gray-700 mt-0.5">+ {addon.price}</div>
      <div className={`text-xs font-medium mt-1 ${selected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e]/50'}`}>
        {selected ? '✓ Gewählt' : '+ Hinzufügen'}
      </div>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs text-gray-500 hover:text-gray-900 mb-3 flex items-center gap-1">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Zurück
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function CheckoutWizard({ product, title }: CheckoutWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Geschäftsadresse state
  const [postversand, setPostversand] = useState<'ohne' | 'mit' | null>(null);
  const [gaTarif, setGaTarif] = useState<string | null>(null);

  // Coworking state
  const [cwTarif, setCwTarif] = useState<string | null>(null);

  // Konferenzraum state
  const [konfRoom, setKonfRoom] = useState<string | null>(null);
  const [konfDauer, setKonfDauer] = useState<string | null>(null);

  // Shared state
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Build Stripe Price ID ──────────────────────────────────────

  function getMainPriceKey(): string | null {
    switch (product) {
      case 'geschaeftsadresse':
        if (!gaTarif || !postversand) return null;
        return `ga_${gaTarif}_${postversand}`;
      case 'coworking':
        if (!cwTarif) return null;
        return `cw_${cwTarif}`;
      case 'konferenzraum':
        if (!konfRoom || !konfDauer) return null;
        return `konf_${konfRoom}_${konfDauer}`;
      case 'tagesbuero':
        return 'tb';
      default:
        return null;
    }
  }

  // ─── Checkout ───────────────────────────────────────────────────

  async function handleCheckout() {
    const priceKey = getMainPriceKey();
    if (!priceKey || !PRICE_MAP[priceKey]) {
      setError('Bitte wählen Sie alle Optionen aus.');
      return;
    }
    if (!name || !email || !firma) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const addonKeys = Array.from(selectedAddons).map(id => `addon_${id}`);
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceKey,
          addons: addonKeys,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          firma,
          successUrl: `${window.location.origin}/buchung-bestaetigt`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step Definitions per Product ───────────────────────────────

  function getStepLabels(): string[] {
    switch (product) {
      case 'geschaeftsadresse': return ['Postversand', 'Tarif', 'Add-ons', 'Ihre Daten'];
      case 'coworking': return ['Tarif', 'Add-ons', 'Ihre Daten'];
      case 'konferenzraum': return ['Raumgröße', 'Dauer', 'Add-ons', 'Ihre Daten'];
      case 'tagesbuero': return ['Add-ons', 'Ihre Daten'];
      default: return [];
    }
  }

  function getMaxSteps(): number {
    return getStepLabels().length;
  }

  // ─── Summary ────────────────────────────────────────────────────

  function getSummary(): { label: string; value: string }[] {
    const items: { label: string; value: string }[] = [];
    switch (product) {
      case 'geschaeftsadresse': {
        const t = GA_TARIFE.find(t => t.id === gaTarif);
        items.push({ label: 'Tarif', value: `${t?.label} (${t?.laufzeit}) — EUR ${t?.price},-/Mon.` });
        items.push({ label: 'Postversand', value: postversand === 'mit' ? 'Mit Postversand' : 'Ohne Postversand' });
        break;
      }
      case 'coworking': {
        const t = CW_TARIFE.find(t => t.id === cwTarif);
        items.push({ label: 'Tarif', value: `${t?.label} — EUR ${t?.price},-` });
        break;
      }
      case 'konferenzraum': {
        const room = KONF_ROOMS.find(r => r.id === konfRoom);
        const dauer = KONF_DAUER.find(d => d.id === konfDauer);
        const preis = konfRoom && konfDauer ? KONF_PREISE[konfRoom]?.[konfDauer] : 0;
        items.push({ label: 'Raum', value: room?.label || '' });
        items.push({ label: 'Dauer', value: `${dauer?.label} — EUR ${preis},-` });
        break;
      }
      case 'tagesbuero':
        items.push({ label: 'Produkt', value: 'Tagesbüro — EUR 59,-' });
        break;
    }
    if (selectedAddons.size > 0) {
      // Bei Coworking Tagespass/10er die passenden Add-ons verwenden
      const addonSource = product === 'coworking' && cwTarif === '10er'
        ? CW_10ER_ADDONS
        : product === 'coworking' && cwTarif === 'tagespass'
        ? CW_TAGESPASS_ADDONS
        : ADDONS_BY_PRODUCT[product];
      addonSource
        .filter(a => selectedAddons.has(a.id))
        .forEach(a => {
          items.push({ label: a.label, value: a.price + ' zzgl. MwSt.' });
        });
    }
    return items;
  }

  // ─── Render Steps ───────────────────────────────────────────────

  const stepLabels = getStepLabels();
  const maxSteps = getMaxSteps();
  const addonsStep = product === 'tagesbuero' ? 0 : product === 'coworking' ? 1 : product === 'geschaeftsadresse' ? 2 : 2;
  const dataStep = addonsStep + 1;

  function renderCurrentStep() {
    // ── GESCHÄFTSADRESSE ──
    if (product === 'geschaeftsadresse') {
      if (step === 0) {
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Wie soll Ihre Post bearbeitet werden?</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['ohne', 'mit'] as const).map(pv => (
                <OptionCard key={pv} selected={postversand === pv} onClick={() => { setPostversand(pv); setStep(1); }}>
                  <p className="font-semibold text-sm">{pv === 'ohne' ? 'Ohne Postversand' : 'Mit Postversand'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pv === 'ohne' ? 'Post wird vor Ort gesammelt, 24/7 abholbar' : 'Wöchentliche Weiterleitung an eine Adresse im DACH-Raum'}
                  </p>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div>
            <BackButton onClick={() => setStep(0)} />
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tarif wählen</h3>
            <p className="text-xs text-gray-500 mb-3">{postversand === 'mit' ? 'Inkl. Postversand' : 'Ohne Postversand'} · Alle Preise zzgl. MwSt.</p>
            <div className="grid grid-cols-3 gap-3">
              {GA_TARIFE.map(t => (
                <OptionCard key={t.id} selected={gaTarif === t.id} popular={t.popular} centered={false} onClick={() => { setGaTarif(t.id); setStep(2); }}>
                  <div className="w-full">
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.laufzeit}</p>
                  </div>
                  <div className="w-full mt-2">
                    <p className="text-base font-bold">EUR {t.price},-</p>
                    <p className="text-[10px] text-gray-400">/Mon. zzgl. MwSt.</p>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
    }

    // ── COWORKING ──
    if (product === 'coworking') {
      if (step === 0) {
        return (
          <div>
            <div className="mb-4 rounded-lg bg-[#6b7f3e] text-white text-center py-2 px-3">
              <p className="text-sm font-bold">Einführungsaktion Green Office — 16% Rabatt bis 30.09.2026</p>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tarif wählen</h3>
            <div className="grid grid-cols-2 gap-3">
              {CW_TARIFE.map(t => (
                <OptionCard key={t.id} selected={cwTarif === t.id} popular={t.popular} centered={false} onClick={() => { setCwTarif(t.id); setStep(1); }}>
                  <div className="w-full text-center">
                    <div className="text-xs sm:text-sm font-semibold">{t.label}</div>
                    <div className="text-base sm:text-lg font-bold text-[#1e293b] my-0.5 whitespace-nowrap">EUR {t.price},-</div>
                    <p className="text-[10px] sm:text-xs text-gray-500">{t.sub}</p>
                    {t.badge && <span className="inline-block mt-1 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5">{t.badge}</span>}
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
    }

    // ── KONFERENZRAUM ──
    if (product === 'konferenzraum') {
      if (step === 0) {
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Raumgröße wählen</h3>
            <div className="grid grid-cols-2 gap-3">
              {KONF_ROOMS.map(r => (
                <OptionCard key={r.id} selected={konfRoom === r.id} onClick={() => { setKonfRoom(r.id); setStep(1); }}>
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                  <p className="text-xs font-bold text-gray-700 mt-1">ab EUR {KONF_PREISE[r.id].stunde},-/Std.</p>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div>
            <BackButton onClick={() => setStep(0)} />
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dauer wählen</h3>
            <p className="text-xs text-gray-500 mb-3">
              {KONF_ROOMS.find(r => r.id === konfRoom)?.label} · Alle Preise zzgl. MwSt.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {KONF_DAUER.map(d => {
                const preis = konfRoom ? KONF_PREISE[konfRoom][d.id] : 0;
                return (
                  <OptionCard key={d.id} selected={konfDauer === d.id} centered={false} onClick={() => { setKonfDauer(d.id); setStep(2); }}>
                    <div className="w-full">
                      <p className="text-sm font-semibold">{d.label}</p>
                    </div>
                    <div className="w-full mt-2">
                      <p className="text-base font-bold">EUR {preis},-</p>
                      <p className="text-[10px] text-gray-400">zzgl. MwSt.</p>
                    </div>
                  </OptionCard>
                );
              })}
            </div>
          </div>
        );
      }
    }

    // ── ADD-ONS (shared) ──
    if (step === addonsStep) {
      // Coworking: 10er → 10x Add-ons, Tagespass → Tages-Add-ons, Monatspass/Abo → monatliche Add-ons
      const productAddons = product === 'coworking' && cwTarif === '10er'
        ? CW_10ER_ADDONS
        : product === 'coworking' && cwTarif === 'tagespass'
        ? CW_TAGESPASS_ADDONS
        : ADDONS_BY_PRODUCT[product];
      return (
        <div>
          {step > 0 && <BackButton onClick={() => setStep(step - 1)} />}
          <h3 className="text-lg font-bold text-gray-900 mb-1">Optionale Add-ons</h3>
          <p className="text-xs text-gray-500 mb-4">Nicht verpflichtend — einfach überspringen.</p>
          {productAddons.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {productAddons.map(addon => (
                <AddonToggle
                  key={addon.id}
                  addon={addon}
                  selected={selectedAddons.has(addon.id)}
                  onToggle={() => toggleAddon(addon.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Für dieses Produkt sind keine Add-ons verfügbar.</p>
          )}
          <button
            onClick={() => setStep(dataStep)}
            className="mt-4 w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Weiter
          </button>
        </div>
      );
    }

    // ── KUNDENDATEN + ZUSAMMENFASSUNG ──
    if (step === dataStep) {
      const summary = getSummary();
      return (
        <div>
          <BackButton onClick={() => setStep(step - 1)} />
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ihre Daten</h3>

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-5">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Zusammenfassung</p>
            {summary.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-900 text-right">{item.value}</span>
              </div>
            ))}
            <p className="text-[10px] text-gray-400 mt-2 text-right">Alle Preise zzgl. MwSt. · MwSt. wird im Checkout berechnet</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Max Mustermann"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Firmenname *</label>
              <input
                type="text"
                value={firma}
                onChange={e => setFirma(e.target.value)}
                placeholder="Musterfirma GmbH"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">E-Mail *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mail@beispiel.de"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Telefon / Handy</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+49 123 456 789"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3.5 text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Wird geladen...' : 'Jetzt buchen und bezahlen'}
          </button>

          <div className="flex items-center justify-center gap-2 mt-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-xs text-gray-400">Sichere Zahlung via Stripe · SSL-verschlüsselt</p>
          </div>
        </div>
      );
    }

    return null;
  }

  // ─── Step Progress Bar ──────────────────────────────────────────

  const isLastStep = step === maxSteps - 1;

  // Last step ("Ihre Daten"): fullscreen overlay on mobile
  if (isLastStep) {
    return (
      <>
        {/* Mobile: fullscreen overlay */}
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto sm:hidden">
          <div className="px-4 py-6 pb-20">
            {/* Back button */}
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm text-gray-500 mb-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Zurück
            </button>

            {/* Progress */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  <StepBadge number={i + 1} done={step > i} active={step === i} />
                  {i < stepLabels.length - 1 && (
                    <div className={`w-6 h-0.5 ${step > i ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {renderCurrentStep()}
          </div>
        </div>

        {/* Desktop: normal inline */}
        <div className="mx-auto max-w-2xl pt-16 hidden sm:block" id="buchen">
          {title && <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{title}</h2>}
          <div className="flex items-center justify-center gap-1 mb-6">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1">
                  <StepBadge number={i + 1} done={step > i} active={step === i} />
                  <span className="text-[11px] font-medium text-gray-700">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-10 h-0.5 ${step > i ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-8">
            {renderCurrentStep()}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-16" id="buchen">
      {title && <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{title}</h2>}

      {/* Progress */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {stepLabels.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1">
              <StepBadge number={i + 1} done={step > i} active={step === i} />
              <span className="text-[11px] font-medium text-gray-700 hidden sm:inline">{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${step > i ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
}
