'use client';

import React, { useState } from 'react';

const tarife = [
  { id: 'tagespass', label: 'Tagespass', price: 'EUR 29,-', sub: 'pro Tag', info: 'Starttermin frei wählbar — Sofortstart möglich', badge: '−16%' },
  { id: 'zehnerkarte', label: '10er-Karte', price: 'EUR 249,-', sub: '', info: '10 Tage Coworking an flexibel wählbaren Tagen', badge: '−16%' },
  { id: 'monatspass', label: 'Monatspass', price: 'EUR 259,-', sub: 'pro Monat', info: 'Ein Monat ohne Kündigungsfrist', badge: '−16%' },
  { id: 'monatsabo', label: 'Monatsabo', price: 'EUR 239,-', sub: 'pro Monat', info: 'Monatspass mit 3 Monaten Kündigungsfrist', badge: '−16%' },
];

export function CoworkingTarife() {
  const [selected, setSelected] = useState<string | null>(null);

  function handleClick(id: string) {
    setSelected(id);
    // Dispatch custom event so HeroForm can pick up the selection
    window.dispatchEvent(new CustomEvent('tarif-selected', { detail: id }));
    // Scroll to form
    const form = document.getElementById('formular');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="mt-6">
      <div className="mb-3 rounded-lg bg-[#6b7f3e] text-white text-center py-2 px-3">
        <p className="text-sm font-bold">🌿 Green Office Eröffnungsangebot — 16% Rabatt bis 30.09.2026</p>
      </div>
      <p className="mb-3 text-base font-bold text-foreground">Sofortstart möglich — wähle jetzt deinen Tarif:</p>
      <div className="grid grid-cols-2 gap-3">
        {tarife.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleClick(t.id)}
              className={`rounded-xl border-2 p-3 text-center transition-all duration-250 ease-in-out ${
                isSelected
                  ? 'bg-[#e3e7fd] border-primary shadow-md'
                  : 'border-border bg-background/80 hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm group'
              }`}
            >
              <div className="text-center">
                <span className={`text-xs font-medium text-muted-foreground`}>{t.label}</span>
                {t.badge && <span className="text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5 ml-1">−16%</span>}
              </div>
              <div className={`text-lg font-bold text-[#1e293b]`}>{t.price}</div>
              <div className={`text-xs font-medium text-muted-foreground`}>{t.sub}{t.sub ? ' ' : ''}<span className="underline">inkl. MwSt.</span></div>
              {t.info && <div className={`text-xs font-medium mt-1 text-muted-foreground`}>{t.info}</div>}
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
      <a
        href="#formular"
        className="mt-3 block w-full rounded-lg bg-[#a8a29e] text-white text-center py-2.5 text-sm font-medium hover:bg-[#8a8380] transition-colors"
      >
        Jetzt buchen und bezahlen
      </a>
    </div>
  );
}
