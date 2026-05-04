'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const STRINGS = {
  de: {
    asCompany: 'Anfrage als Firma',
    asPrivate: 'Anfrage als Privatperson',
    privateMarker: 'Anfrage als Privatperson',
    companyMarker: 'Anfrage als Firma',
    companyNamePlaceholder: 'Firmenname *',
  },
  en: {
    asCompany: 'Request as company',
    asPrivate: 'Request as private person',
    privateMarker: 'Request as private person',
    companyMarker: 'Request as company',
    companyNamePlaceholder: 'Company name *',
  },
  fr: {
    asCompany: "Demande en tant qu'entreprise",
    asPrivate: 'Demande en tant que particulier',
    privateMarker: 'Demande en tant que particulier',
    companyMarker: "Demande en tant qu'entreprise",
    companyNamePlaceholder: "Nom de l'entreprise *",
  },
  it: {
    asCompany: 'Richiesta come azienda',
    asPrivate: 'Richiesta come privato',
    privateMarker: 'Richiesta come privato',
    companyMarker: 'Richiesta come azienda',
    companyNamePlaceholder: "Nome dell'azienda *",
  },
};

export type AnfrageArt = 'firma' | 'privat';
export type Locale = keyof typeof STRINGS;

export function useAnfrageartLocale(): Locale {
  const pathname = usePathname();
  if (pathname?.startsWith('/it')) return 'it';
  if (pathname?.startsWith('/fr')) return 'fr';
  if (pathname?.startsWith('/en')) return 'en';
  return 'de';
}

export function getAnfrageartStrings(locale: Locale) {
  return STRINGS[locale];
}

interface Props {
  value: AnfrageArt;
  onChange: (next: AnfrageArt) => void;
  className?: string;
}

export function AnfrageartToggle({ value, onChange, className = '' }: Props) {
  const locale = useAnfrageartLocale();
  const t = STRINGS[locale];
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {(['firma', 'privat'] as const).map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onChange(kind)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
            value === kind
              ? 'border-[#6b7f3e] bg-[#f0f4e8] text-[#6b7f3e]'
              : 'border-gray-300 bg-white text-gray-500 hover:border-[#6b7f3e]'
          }`}
        >
          {kind === 'firma' ? t.asCompany : t.asPrivate}
        </button>
      ))}
    </div>
  );
}
