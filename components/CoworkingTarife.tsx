'use client';

import React, { useState } from 'react';

const tarife = [
  { id: 'tagespass', label: 'Tagespass', price: 'EUR 29,-', sub: 'pro Tag zzgl. MwSt.', info: '' },
  { id: 'zehnerkarte', label: '10er-Karte', price: 'EUR 249,-', sub: 'zzgl. MwSt.', info: '10 Tage Coworking an flexibel wählbaren Tagen' },
  { id: 'monatspass', label: 'Monatspass', price: 'EUR 259,-', sub: 'pro Monat zzgl. MwSt.', info: 'Ein Monat ohne Kündigungsfrist' },
  { id: 'monatsabo', label: 'Monatsabo', price: 'EUR 239,-', sub: 'pro Monat zzgl. MwSt.', info: 'Monatspass mit 3 Monaten Kündigungsfrist' },
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
      <p className="mb-3 text-base font-bold text-foreground">Sofortstart möglich — wähle jetzt deinen Tarif:</p>
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
              {t.info && <div className={`text-[10px] mt-1 ${isSelected ? 'text-white/70' : 'text-muted-foreground/70 group-hover:text-white/70'}`}>{t.info}</div>}
              <div className={`text-xs font-semibold mt-1 ${
                isSelected
                  ? 'text-white opacity-100'
                  : 'text-primary group-hover:text-white opacity-0 group-hover:opacity-100'
              } transition-opacity`}>
                {isSelected ? '✓ Ausgewählt' : 'Auswählen'}
              </div>
            </button>
          );
        })}
      </div>
      <a
        href="#formular"
        className="mt-4 block w-full rounded-xl bg-[#002a9e] text-white text-center py-3 text-sm font-bold hover:bg-[#001f7a] transition-colors"
      >
        Jetzt buchen und bezahlen
      </a>
    </div>
  );
}
