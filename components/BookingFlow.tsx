'use client';

import React, { useState, useMemo } from 'react';

interface TarifItem {
  id: string;
  label: string;
  price: number;
  display: string;
  sub: string;
  unit: 'tag' | 'monat';
}

interface AddonItem {
  id: string;
  label: string;
  priceTag?: number;
  priceMonat?: number;
  pricePer?: Record<string, number>;
  displayPrice: string;
  displayPricePer?: Record<string, string>;
  note?: string;
  selectable: boolean;
  requiresTarif?: string[];
}

const tarife: TarifItem[] = [
  { id: 'tagespass', label: 'Tagespass', price: 29, display: 'EUR 29,-', sub: 'pro Tag zzgl. MwSt.', unit: 'tag' },
  { id: 'zehnerkarte', label: '10er-Karte', price: 249, display: 'EUR 249,-', sub: '10 Tage zzgl. MwSt.', unit: 'tag' },
  { id: 'monatspass', label: 'Monatspass', price: 259, display: 'EUR 259,-', sub: 'pro Monat zzgl. MwSt.', unit: 'monat' },
  { id: 'monatsabo', label: 'Monatsabo', price: 239, display: 'EUR 239,-', sub: 'pro Monat zzgl. MwSt.', unit: 'monat' },
];

const addons: AddonItem[] = [
  { id: 'fixdesk', label: 'Fix Desk', priceMonat: 79, displayPrice: '+ EUR 79,- /Monat', note: 'Nur bei Monatspass & Monatsabo', selectable: true, requiresTarif: ['monatspass', 'monatsabo'] },
  { id: 'aktenschrank', label: 'Abschließbarer Aktenschrank', priceMonat: 19, displayPrice: '+ EUR 19,- /Monat', note: 'Nicht beim Tagespass', selectable: true, requiresTarif: ['zehnerkarte', 'monatspass', 'monatsabo'] },
  { id: 'monitor', label: '27" Curved Monitor', priceTag: 9, priceMonat: 27, displayPrice: 'EUR 9,- /Tag · EUR 27,- /Monat', selectable: true },
  { id: 'geschaeftsadresse', label: 'Geschäftsadresse', priceMonat: 39, displayPrice: '+ EUR 39,- /Monat', note: 'Nur bei Monatsabo', selectable: true, requiresTarif: ['monatsabo'] },
  { id: 'meetingraum', label: 'Meeting- & Konferenzräume', displayPrice: 'Auf Tagesbasis buchbar', selectable: false },
  { id: 'parkplatz', label: 'Parkplatz', priceTag: 6, displayPrice: '+ EUR 6,- /Tag', selectable: true },
  { id: 'kaffeeflat', label: 'Kaffee-Flatrate', priceTag: 2, priceMonat: 29, pricePer: { tagespass: 2, zehnerkarte: 27, monatspass: 29, monatsabo: 29 }, displayPrice: 'ab EUR 2,- /Tag', note: 'Bio-Kaffee — so viel Sie möchten', selectable: true, displayPricePer: { tagespass: '+ EUR 2,- /Tag', zehnerkarte: '+ EUR 27,- (EUR 2,70 /Tag)', monatspass: '+ EUR 29,- /Monat', monatsabo: '+ EUR 29,- /Monat' } },
  { id: 'teeflat', label: 'Tee-Flatrate', priceTag: 2, priceMonat: 24, pricePer: { tagespass: 2, zehnerkarte: 19, monatspass: 24, monatsabo: 24 }, displayPrice: 'ab EUR 2,- /Tag', note: 'Premium-Tees in großer Auswahl', selectable: true, displayPricePer: { tagespass: 'EUR 2,- /Tag', zehnerkarte: '+ EUR 19,- (EUR 1,90 /Tag)', monatspass: '+ EUR 24,- /Monat', monatsabo: '+ EUR 24,- /Monat' } },
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

export function BookingFlow({ title = 'In 4 Schritten zum Coworking-Platz' }: { title?: string }) {
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
      // Use tarif-specific price if available
      if (addon.pricePer && selectedTarifObj.id in addon.pricePer) {
        sum += addon.pricePer[selectedTarifObj.id];
      } else if (selectedTarifObj.unit === 'monat' && addon.priceMonat) {
        sum += addon.priceMonat;
      } else if (selectedTarifObj.unit === 'tag' && addon.priceTag) {
        sum += addon.priceTag;
      } else if (addon.priceMonat) {
        sum += addon.priceMonat;
      } else if (addon.priceTag) {
        sum += addon.priceTag;
      }
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tarif-selected', { detail: newTarif ? { tarif: newTarif } : null }));
    }
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

  // Get tomorrow as min date
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
              <h3 className="text-lg md:text-xl font-bold text-foreground">Tarif wählen</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tarife.map((t) => {
                const isSelected = selectedTarif === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={(e) => { e.preventDefault(); handleTarifClick(t.id); }}
                    className={`rounded-xl border p-4 text-center transition-all duration-250 cursor-pointer ${
                      isSelected
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm'
                    }`}
                  >
                    <div className="text-sm font-semibold text-foreground">{t.label}</div>
                    <div className="text-lg font-bold text-[#1e293b] mt-1">{t.display}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.sub}</div>
                    {isSelected && (
                      <div className="text-xs font-medium mt-2 text-[#6b7f3e]">✓ Ausgewählt</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Optionales hinzuwählen */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {addons.map((addon) => {
                const available = isAddonAvailable(addon);
                const isSelected = selectedAddons.has(addon.id);
                const disabled = addon.requiresTarif && !available;

                return (
                  <button
                    type="button"
                    key={addon.id}
                    onClick={(e) => { e.preventDefault(); handleAddonClick(addon); }}
                    disabled={!addon.selectable || !!disabled}
                    className={`rounded-xl border p-4 text-left transition-all duration-250 ${
                      !addon.selectable
                        ? 'border-border bg-background/50 cursor-default'
                        : disabled
                        ? 'border-border bg-background/50 cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm cursor-pointer'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <div className="text-sm font-semibold text-foreground">{addon.label}</div>
                    <div className="text-sm font-bold text-[#1e293b] mt-1">
                      {(selectedTarif && addon.displayPricePer?.[selectedTarif]) || addon.displayPrice}
                    </div>
                    {addon.note && (
                      <div className="text-xs text-muted-foreground mt-1 italic">{addon.note}</div>
                    )}
                    {addon.selectable && !disabled && (
                      <div className={`text-xs font-medium mt-2 ${
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

          {/* Step 3: Starttermin auswählen */}
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

          {/* Step 4: Jetzt bezahlen */}
          <div className={`rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8 transition-opacity duration-300 ${
            !selectedTarif ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center gap-4 mb-5">
              <StepBadge number={4} active={!!selectedTarif && !!startDate} />
              <h3 className="text-lg md:text-xl font-bold text-foreground">Jetzt bezahlen</h3>
            </div>
            <div className="text-center">
              <a
                href="#formular"
                className="inline-block rounded-lg bg-[#a8a29e] text-white text-center py-3.5 px-12 text-base font-semibold hover:bg-[#8a8380] transition-colors no-underline shadow-sm"
              >
                {total != null ? (
                  <>Jetzt buchen — {`EUR ${total},-`} {unitLabel} zzgl. MwSt.</>
                ) : (
                  <>Jetzt buchen und bezahlen</>
                )}
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                Zugangscode wird Ihnen sofort an Ihre E-Mail-Adresse geschickt.<br />
                Per sofort 24/7 Zugang möglich.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
