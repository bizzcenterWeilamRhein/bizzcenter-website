'use client';

import React, { useState, useMemo } from 'react';

interface TarifItem {
  id: string;
  label: string;
  price: number;
  display: string;
  sub: string;
  unit: 'tag' | 'monat';
  popular?: boolean;
}

interface AddonItem {
  id: string;
  label: string;
  priceTag?: number;
  priceMonat?: number;
  displayPrice: string;
  note?: string;
  selectable: boolean;
  requiresTarif?: string[];
}

const tarife: TarifItem[] = [
  { id: 'tagesbuero', label: 'Tagesbüro', price: 59, display: 'EUR 59,-', sub: 'pro Tag', unit: 'tag' },
  { id: 'zehnerkarte', label: '10er-Karte', price: 499, display: 'EUR 499,-', sub: '', unit: 'tag' },
  { id: 'monatsmiete', label: 'Monatsmiete', price: 499, display: 'ab EUR 499,-', sub: 'pro Monat', unit: 'monat', popular: true },
  { id: 'langzeitmiete', label: 'Langzeitmiete', price: 449, display: 'ab EUR 449,-', sub: 'pro Monat', unit: 'monat' },
];

const addons: AddonItem[] = [
  { id: 'geschaeftsadresse', label: 'Geschäftsadresse', priceMonat: 39, displayPrice: '+ EUR 39,- /Monat', selectable: true, requiresTarif: ['monatsmiete', 'langzeitmiete'], note: 'Impressumsfähige Adresse' },
  { id: 'monitor', label: '27" Curved Monitor', priceTag: 9, priceMonat: 27, displayPrice: 'ab EUR 9,- /Tag', selectable: true },
  { id: 'aktenschrank', label: 'Abschließbarer Aktenschrank', priceMonat: 19, displayPrice: '+ EUR 19,- /Monat', selectable: true, requiresTarif: ['monatsmiete', 'langzeitmiete'] },
  { id: 'parkplatz', label: 'Parkplatz', priceTag: 6, priceMonat: 49, displayPrice: 'ab EUR 6,- /Tag', selectable: true },
  { id: 'kaffeeflat', label: 'Kaffee-Flatrate', priceTag: 2, priceMonat: 29, displayPrice: 'ab EUR 2,- /Tag', note: 'Bio-Kaffee — so viel Sie möchten', selectable: true },
  { id: 'telefonservice', label: 'Telefonservice', priceMonat: 49, displayPrice: '+ EUR 49,- /Monat', selectable: true, requiresTarif: ['monatsmiete', 'langzeitmiete'], note: 'Anrufe in Ihrem Firmennamen' },
  { id: 'meetingraum', label: 'Meeting- & Konferenzräume', displayPrice: 'Auf Tagesbasis buchbar', selectable: false },
  { id: 'firmenschild', label: 'Firmenschild am Eingang', displayPrice: 'EUR 179,- einmalig', selectable: true, requiresTarif: ['monatsmiete', 'langzeitmiete'] },
];

function StepBadge({ number, active }: { number: number; active: boolean }) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors duration-300 ${
      active ? 'bg-[#6b7f3e] text-white' : 'bg-[#e8e3d6] text-[#6b7f3e]'
    }`}>
      {number}
    </div>
  );
}

export function BueroBookingFlow({ title = 'In 4 Schritten zum eigenen Büro' }: { title?: string }) {
  const [selectedTarif, setSelectedTarif] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState('');

  const selectedTarifObj = tarife.find((t) => t.id === selectedTarif);

  const isAddonAvailable = (addon: AddonItem) => {
    if (!addon.selectable) return false;
    if (addon.requiresTarif) {
      return selectedTarif != null && addon.requiresTarif.includes(selectedTarif);
    }
    return true;
  };

  const total = useMemo(() => {
    if (!selectedTarifObj) return null;
    let sum = selectedTarifObj.price;
    selectedAddons.forEach((addonId) => {
      const addon = addons.find((a) => a.id === addonId);
      if (!addon) return;
      if (selectedTarifObj.unit === 'monat' && addon.priceMonat) sum += addon.priceMonat;
      else if (selectedTarifObj.unit === 'tag' && addon.priceTag) sum += addon.priceTag;
      else if (addon.priceMonat) sum += addon.priceMonat;
      else if (addon.priceTag) sum += addon.priceTag;
    });
    return sum;
  }, [selectedTarif, selectedAddons, selectedTarifObj]);

  const handleTarifClick = (id: string) => {
    const newTarif = selectedTarif === id ? null : id;
    setSelectedTarif(newTarif);
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      addons.forEach((a) => {
        if (a.requiresTarif && !a.requiresTarif.includes(newTarif || '')) {
          next.delete(a.id);
        }
      });
      return next;
    });
  };

  const handleAddonClick = (addon: AddonItem) => {
    if (!addon.selectable || !isAddonAvailable(addon)) return;
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(addon.id)) next.delete(addon.id);
      else next.add(addon.id);
      return next;
    });
  };

  const unitLabel = selectedTarifObj?.unit === 'monat' ? '/Monat' : (selectedTarifObj?.id === 'zehnerkarte' ? '' : '/Tag');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">{title}</h2>

        <div className="space-y-8">
          {/* Step 1: Tarif wählen */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-4 mb-5">
              <StepBadge number={1} active={!selectedTarif} />
              <h3 className="text-lg md:text-xl font-bold text-foreground">Büro-Tarif wählen</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tarife.map((t) => {
                const isSelected = selectedTarif === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={(e) => { e.preventDefault(); handleTarifClick(t.id); }}
                    className={`rounded-xl border p-4 text-center transition-all duration-250 cursor-pointer relative ${
                      isSelected
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                        : t.popular
                        ? 'border-[#6b7f3e] bg-background hover:bg-[#f0f4e8] shadow-sm ring-1 ring-[#6b7f3e]/30'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm'
                    }`}
                  >
                    {t.popular && !isSelected && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5 whitespace-nowrap">Beliebt ⭐</div>
                    )}
                    <div className="text-sm font-semibold text-foreground">{t.label}</div>
                    <div className="text-lg font-bold text-[#1e293b] mt-1">{t.display}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.sub}{t.sub ? ' ' : ''}<span className="underline">zzgl. MwSt.</span></div>
                    {isSelected && (
                      <div className="text-xs font-medium mt-2 text-[#6b7f3e]">✓ Ausgewählt</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Add-ons */}
          <div className={`rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8 transition-opacity duration-300 ${
            !selectedTarif ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center gap-4 mb-5">
              <StepBadge number={2} active={!!selectedTarif && selectedAddons.size === 0} />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-foreground">Optionales hinzuwählen</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Nicht verpflichtend — einfach überspringen wenn nicht benötigt.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {addons.map((addon) => {
                const available = isAddonAvailable(addon);
                const isSelected = selectedAddons.has(addon.id);

                if (addon.requiresTarif && selectedTarif && !addon.requiresTarif.includes(selectedTarif)) {
                  return null;
                }

                return (
                  <button
                    type="button"
                    key={addon.id}
                    onClick={(e) => { e.preventDefault(); handleAddonClick(addon); }}
                    disabled={!addon.selectable}
                    className={`rounded-xl border p-3 text-left transition-all duration-250 overflow-hidden ${
                      !addon.selectable
                        ? 'border-border bg-background/50 cursor-default'
                        : isSelected
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm cursor-pointer'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">{addon.label}</span>
                    <div className="text-xs sm:text-sm font-bold text-[#1e293b] mt-1">{addon.displayPrice}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5"><span className="underline">zzgl. MwSt.</span></div>
                    {addon.note && (
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 italic">{addon.note}</div>
                    )}
                    {addon.selectable && (
                      <div className={`text-[10px] sm:text-xs font-medium mt-1.5 ${
                        isSelected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e] opacity-50'
                      }`}>
                        {isSelected ? '✓ Hinzugebucht' : '+ Hinzubuchen'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Starttermin */}
          <div className={`rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8 transition-opacity duration-300 ${
            !selectedTarif ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center gap-4 mb-5">
              <StepBadge number={3} active={!!selectedTarif && !startDate} />
              <h3 className="text-lg md:text-xl font-bold text-foreground">Starttermin auswählen</h3>
            </div>
            <div className="max-w-xs">
              <input
                type="date"
                min={minDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-2">Sofortstart möglich — wählen Sie einfach das nächstmögliche Datum.</p>
            </div>
          </div>

          {/* Step 4: Anfragen */}
          <div className={`rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8 transition-opacity duration-300 ${
            !selectedTarif ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center gap-4 mb-5">
              <StepBadge number={4} active={!!selectedTarif && !!startDate} />
              <h3 className="text-lg md:text-xl font-bold text-foreground">Jetzt anfragen</h3>
            </div>
            <div className="text-center">
              <a
                href={`mailto:weilamrhein@bizzcenter.de?subject=Anfrage Einzelbüro ${selectedTarifObj?.label || ''}&body=Ich interessiere mich für: ${selectedTarifObj?.label || ''}${selectedAddons.size > 0 ? '%0A%0AAdd-ons: ' + addons.filter(a => selectedAddons.has(a.id)).map(a => a.label).join(', ') : ''}${startDate ? '%0A%0AGewünschter Start: ' + startDate : ''}`}
                className="inline-block rounded-lg bg-[#6b7f3e] text-white text-center py-3.5 px-12 text-base font-semibold hover:opacity-90 transition-opacity no-underline shadow-sm"
              >
                {total != null ? (
                  <>Jetzt anfragen — ab EUR {total},- {unitLabel} <span className="underline">zzgl. MwSt.</span></>
                ) : (
                  <>Jetzt Büro anfragen</>
                )}
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                Wir melden uns umgehend mit einem individuellen Angebot.<br />
                Oder rufen Sie direkt an: <a href="tel:+4917153949009" className="text-[#6b7f3e] font-medium">+49 171 539 49 09</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
