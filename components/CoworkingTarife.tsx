'use client';

import React, { useState } from 'react';

const tarife = [
  { id: 'tagespass', label: 'Tagespass', price: 'EUR 25,-', sub: 'pro Tag zzgl. MwSt.', badge: '−16%' },
  { id: 'zehnerkarte', label: '10er-Karte', price: 'EUR 209,-', sub: 'einmalig zzgl. MwSt.', badge: '−16%' },
  { id: 'monatspass', label: 'Monatspass', price: 'EUR 219,-', sub: '/Monat zzgl. MwSt.', badge: '−16%' },
  { id: 'monatsabo', label: 'Monatsabo', price: 'EUR 199,-', sub: '/Monat zzgl. MwSt.', badge: '−16%' },
];

export function CoworkingTarife() {
  const [selected, setSelected] = useState<string | null>(null);

  function handleClick(id: string) {
    setSelected(id);
    window.dispatchEvent(new CustomEvent('tarif-selected', { detail: id }));
    const form = document.getElementById('formular');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <div className="mb-3 rounded-lg bg-[#6b7f3e] text-white text-center py-2 px-3">
        <p className="text-xs sm:text-sm font-bold">Einführungsaktion Green Office — 16% Rabatt bis 30.09.2026</p>
      </div>
      <p className="mb-3 text-sm sm:text-base font-bold text-foreground">Tarif wählen</p>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {tarife.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleClick(t.id)}
              className={`rounded-xl border-2 p-2.5 sm:p-3 text-center transition-all duration-200 ${
                isSelected
                  ? 'bg-[#e3e7fd] border-primary shadow-md'
                  : 'border-border bg-background/80 hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm group'
              }`}
            >
              {/* Row 1: Label */}
              <div className="text-xs sm:text-sm font-semibold text-foreground">{t.label}</div>
              {/* Row 2: Price — own line, full width */}
              <div className="text-base sm:text-lg font-bold text-[#1e293b] my-0.5 whitespace-nowrap">{t.price}</div>
              {/* Row 3: Sub info */}
              <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{t.sub}</div>
              {/* Row 4: Badge */}
              {t.badge && (
                <span className="inline-block mt-1 text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5 leading-none">
                  {t.badge}
                </span>
              )}
              {/* Selected indicator */}
              <div className={`text-xs font-semibold mt-1 transition-opacity duration-200 ${
                isSelected
                  ? 'text-[#1e293b] opacity-100'
                  : 'text-[#6b7f3e] opacity-0 group-hover:opacity-100'
              }`}>
                {isSelected ? '✓ Ausgewählt' : 'Auswählen'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-20 mt-3">
        <a
          href="#formular"
          className="block w-full rounded-lg bg-[#a8a29e] text-white text-center py-2.5 text-sm font-medium hover:bg-[#8a8380] transition-colors shadow-lg"
        >
          Jetzt buchen und bezahlen
        </a>
      </div>
    </div>
  );
}
