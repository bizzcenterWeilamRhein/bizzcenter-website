'use client';

import React, { useState } from 'react';

const tarife = [
  { id: 'tagespass', label: 'Tagespass', price: '29,- €', sub: 'pro Tag zzgl. MwSt.' },
  { id: 'zehnerkarte', label: '10er-Karte', price: '249,- €', sub: '10 Tage zzgl. MwSt.' },
  { id: 'monatspass', label: 'Monatspass', price: '259,- €', sub: 'pro Monat zzgl. MwSt.' },
  { id: 'monatsabo', label: 'Monatsabo', price: '239,- €', sub: 'pro Monat zzgl. MwSt.' },
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
    <div className="mt-4">
      <p className="mb-2 text-sm font-semibold text-foreground">Sofortstart möglich — wählen Sie Ihren Tarif:</p>
      <div className="grid grid-cols-2 gap-3">
        {tarife.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleClick(t.id)}
              className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                isSelected
                  ? 'bg-[#002a9e] border-[#002a9e] text-white'
                  : 'border-border bg-background/80 hover:bg-[#002a9e] hover:border-[#002a9e] group'
              }`}
            >
              <div className={`text-xs mb-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground group-hover:text-white/80'}`}>{t.label}</div>
              <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-primary group-hover:text-white'}`}>{t.price}</div>
              <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground group-hover:text-white/80'}`}>{t.sub}</div>
              <div className={`text-xs font-semibold mt-1 ${
                isSelected
                  ? 'text-white opacity-100'
                  : 'text-primary group-hover:text-white opacity-0 group-hover:opacity-100'
              } transition-opacity`}>
                {isSelected ? '✓ Ausgewählt' : 'Jetzt buchen'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
