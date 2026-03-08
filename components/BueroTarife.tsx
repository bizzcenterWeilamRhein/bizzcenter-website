'use client';

import React, { useState } from 'react';

const tarife = [
  { id: 'tagesbuero', label: 'Tagesbüro', price: 'EUR 59,-', sub: 'pro Tag', info: 'Einzelbüro für einen Tag — Sofortstart möglich', badge: null },
  { id: 'zehnerkarte', label: '10er-Karte', price: 'EUR 499,-', sub: '', info: '10 Tage Einzelbüro an flexibel wählbaren Tagen', badge: null },
  { id: 'monatsmiete', label: 'Monatsmiete', price: 'ab EUR 499,-', sub: 'pro Monat', info: 'Eigenes Büro, monatlich kündbar', badge: null, popular: true },
  { id: 'langzeitmiete', label: 'Langzeitmiete', price: 'ab EUR 449,-', sub: 'pro Monat', info: 'Ab 6 Monaten Laufzeit — bester Preis', badge: null },
];

export function BueroTarife() {
  const [selected, setSelected] = useState<string | null>(null);

  function handleClick(id: string) {
    setSelected(id);
    window.dispatchEvent(new CustomEvent('buero-tarif-selected', { detail: id }));
    const el = document.getElementById('buero-buchen');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <p className="mb-3 text-base font-bold text-foreground">Sofortstart möglich — wählen Sie Ihren Tarif:</p>
      <div className="grid grid-cols-2 gap-3">
        {tarife.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleClick(t.id)}
              className={`rounded-xl border-2 p-3 text-center transition-all duration-250 ease-in-out relative ${
                isSelected
                  ? 'bg-[#e3e7d4] border-[#6b7f3e] shadow-sm'
                  : t.popular
                  ? 'border-[#6b7f3e] bg-background ring-1 ring-[#6b7f3e]/30 hover:bg-[#f0f4e8] hover:shadow-sm group'
                  : 'border-border bg-background/80 hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm group'
              }`}
            >
              {t.popular && !isSelected && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5 whitespace-nowrap">Beliebt ⭐</div>
              )}
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">{t.label}</span>
              </div>
              <div className="text-lg font-bold text-[#1e293b]">{t.price}</div>
              <div className="text-xs font-medium text-muted-foreground">{t.sub}{t.sub ? ' ' : ''}<span className="underline">zzgl. MwSt.</span></div>
              {t.info && <div className="text-xs font-medium mt-1 text-muted-foreground">{t.info}</div>}
              <div className={`text-xs font-semibold mt-1 transition-opacity duration-200 ${
                isSelected
                  ? 'text-[#6b7f3e] opacity-100'
                  : 'text-[#6b7f3e] opacity-0 group-hover:opacity-100'
              }`}>
                {isSelected ? '✓ Ausgewählt' : 'Auswählen'}
              </div>
            </button>
          );
        })}
      </div>
      <a
        href="#buero-buchen"
        className="mt-3 block w-full rounded-lg bg-[#6b7f3e] text-white text-center py-2.5 text-sm font-medium hover:opacity-90 transition-opacity no-underline"
      >
        Jetzt Büro anfragen
      </a>
    </div>
  );
}
