'use client';

import { usePathname } from 'next/navigation';

export type Locale = 'de' | 'en' | 'fr' | 'it';

export function getLocaleFromPath(pathname: string | null): Locale {
  if (pathname?.startsWith('/it')) return 'it';
  if (pathname?.startsWith('/fr')) return 'fr';
  if (pathname?.startsWith('/en')) return 'en';
  return 'de';
}

export function useLocale(): Locale {
  return getLocaleFromPath(usePathname());
}

// Interne absolute Pfade mit der aktuellen Locale prefixen (de = kein Prefix).
// Anker (#), externe Links (http), mailto/tel und bereits lokalisierte Pfade bleiben unangetastet.
export function localizeHref(href: string, locale: Locale): string {
  if (!href) return href;
  if (locale === 'de') return href;
  if (!href.startsWith('/')) return href;
  if (/^\/(de|en|fr|it)(\/|$)/.test(href)) return href;
  return `/${locale}${href}`;
}
