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
  displayPrice: string;
  note?: string;
  selectable: boolean;
  requiresTarif?: string[];
}

interface IncludedBoxProps {
  title?: string;
  optionalTitle?: string;
  bookingTitle?: string;
  children: React.ReactNode;
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
];

export function IncludedBox({
  title = 'Was im Coworking-Preis enthalten ist',
  optionalTitle = 'Optional hinzubuchbar',
  bookingTitle = 'Jetzt buchen',
  children,
}: IncludedBoxProps) {
  const [selectedTarif, setSelectedTarif] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const childArray = React.Children.toArray(children);
  const includedItems = childArray.slice(0, 6);

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
      if (selectedTarifObj.unit === 'monat' && addon.priceMonat) {
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
    // Remove addons that require a tarif that's no longer selected
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      addons.forEach((a) => {
        if (a.requiresTarif && !a.requiresTarif.includes(newTarif || '')) {
          next.delete(a.id);
        }
      });
      return next;
    });
    // Dispatch event for HeroForm
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tarif-selected', { detail: newTarif ? { tarif: newTarif } : null }));
    }
  };

  const handleAddonClick = (addon: AddonItem) => {
    if (!addon.selectable) return;
    if (!isAddonAvailable(addon)) return;
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(addon.id)) {
        next.delete(addon.id);
      } else {
        next.add(addon.id);
      }
      return next;
    });
  };

  const formatTotal = (amount: number) => {
    return `EUR ${amount},-`;
  };

  const unitLabel = selectedTarifObj?.unit === 'monat' ? '/Monat' : (selectedTarifObj?.id === 'zehnerkarte' ? '' : '/Tag');

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Included */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {includedItems}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-8 md:mx-10" />

          {/* Booking / Tarife */}
          <div className="p-8 md:p-10">
            <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">{bookingTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="text-xl font-bold text-[#1e293b] mt-1">{t.display}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.sub}</div>
                    <div className={`text-xs font-medium mt-2 transition-opacity duration-250 ${
                      isSelected ? 'text-[#6b7f3e] opacity-100' : 'text-[#6b7f3e] opacity-0'
                    }`}>
                      {isSelected ? '✓ Ausgewählt' : 'Auswählen'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-8 md:mx-10" />

          {/* Optional Add-ons */}
          <div className="p-8 md:p-10">
            <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">{optionalTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        ? 'border-border bg-background/50 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm cursor-pointer'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <div className="text-sm font-semibold text-foreground">{addon.label}</div>
                    <div className="text-sm font-bold text-[#1e293b] mt-1">{addon.displayPrice}</div>
                    {addon.note && (
                      <div className="text-xs text-muted-foreground mt-1 italic">{addon.note}</div>
                    )}
                    {addon.selectable && !disabled && (
                      <div className={`text-xs font-medium mt-2 ${
                        isSelected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e] opacity-60'
                      }`}>
                        {isSelected ? '✓ Hinzugebucht' : '+ Hinzubuchen'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CTA Button with total */}
            <div className="mt-8 text-center">
              <a
                href="#formular"
                className="inline-block rounded-lg bg-[#a8a29e] text-white text-center py-3 px-10 text-base font-medium hover:bg-[#8a8380] transition-colors no-underline"
              >
                {total != null ? (
                  <>Jetzt buchen — {formatTotal(total)} {unitLabel} zzgl. MwSt.</>
                ) : (
                  <>Jetzt buchen und bezahlen</>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
