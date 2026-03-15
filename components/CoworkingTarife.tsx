'use client';

import React, { useState } from 'react';

const tarife = [
  { id: 'tagespass', label: 'Tagespass', price: 'EUR 25,-', sub: 'pro Tag · zzgl. MwSt.', badge: '−16%' },
  { id: 'zehnerkarte', label: '10er-Karte', price: 'EUR 209,-', sub: 'einmalig · zzgl. MwSt.', badge: '−16%' },
  { id: 'monatspass', label: 'Monatspass', price: 'EUR 219,-', sub: 'pro Monat · flexibel kündbar · zzgl. MwSt.', badge: '−16%' },
  { id: 'monatsabo', label: 'Monatsabo', price: 'EUR 199,-', sub: 'pro Monat · 3 Mon. Kündigungsfrist · zzgl. MwSt.', badge: '−16%' },
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

      {/* Mobile: stacked list — Desktop: 2x2 grid */}
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3">
        {tarife.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleClick(t.id)}
              className={`rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                isSelected
                  ? 'bg-[#e3e7fd] border-primary shadow-md'
                  : 'border-border bg-background/80 hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm group'
              }`}
            >
              {/* Mobile: horizontal row — Desktop: stacked center */}
              <div className="flex items-center justify-between sm:flex-col sm:text-center sm:gap-1">
                <div className="text-left sm:text-center">
                  <div className="flex items-center gap-1.5 sm:justify-center">
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                    {t.badge && (
                      <span className="text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5 leading-none">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{t.sub}</div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:gap-0">
                  <span className="text-lg font-bold text-[#1e293b] whitespace-nowrap">{t.price}</span>
                  <span className={`text-xs font-semibold transition-opacity duration-200 ${
                    isSelected
                      ? 'text-[#1e293b] opacity-100'
                      : 'text-[#6b7f3e] opacity-0 group-hover:opacity-100 sm:opacity-0'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </div>
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
