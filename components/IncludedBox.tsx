'use client';

import React from 'react';

interface TarifItem {
  label: string;
  price: string;
  sub: string;
}

interface IncludedBoxProps {
  title?: string;
  optionalTitle?: string;
  bookingTitle?: string;
  tarife?: TarifItem[];
  children: React.ReactNode;
}

const defaultTarife: TarifItem[] = [
  { label: 'Tagespass', price: 'EUR 29,-', sub: 'pro Tag zzgl. MwSt.' },
  { label: '10er-Karte', price: 'EUR 249,-', sub: '10 Tage zzgl. MwSt.' },
  { label: 'Monatspass', price: 'EUR 259,-', sub: 'pro Monat zzgl. MwSt.' },
  { label: 'Monatsabo', price: 'EUR 239,-', sub: 'pro Monat zzgl. MwSt.' },
];

export function IncludedBox({
  title = 'Was im Coworking-Preis enthalten ist',
  optionalTitle = 'Optional hinzubuchbar',
  bookingTitle = 'Jetzt buchen',
  tarife = defaultTarife,
  children,
}: IncludedBoxProps) {
  const childArray = React.Children.toArray(children);
  const includedItems = childArray.slice(0, 6);
  const optionalItems = childArray.slice(6);

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
              {tarife.map((t) => (
                <a
                  key={t.label}
                  href="#formular"
                  className="rounded-xl border border-border bg-background p-4 text-center transition-all duration-250 hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm block no-underline"
                >
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-xl font-bold text-[#1e293b] mt-1">{t.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.sub}</div>
                </a>
              ))}
            </div>
          </div>

          {optionalItems.length > 0 && (
            <>
              {/* Divider */}
              <div className="border-t border-border mx-8 md:mx-10" />
              {/* Optional */}
              <div className="p-8 md:p-10">
                <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">{optionalTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {optionalItems}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
