'use client';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { usePathname } from 'next/navigation';

const STRINGS: Record<string, { title: string; subtitle: string; short: string; shortDesc: string; long: string; longDesc: string; close: string }> = {
  de: {
    title: 'Bitte wähle die Mietdauer aus.',
    subtitle: '',
    short: 'Kurzfristig',
    shortDesc: 'bis 3 Monate — Tagesbüro',
    long: 'Langfristig',
    longDesc: '3 Monate und länger — Büro mieten',
    close: 'Schließen',
  },
  en: {
    title: 'Please choose the rental duration.',
    subtitle: '',
    short: 'Short-term',
    shortDesc: 'up to 3 months — day office',
    long: 'Long-term',
    longDesc: '3 months and longer — rent office',
    close: 'Close',
  },
  fr: {
    title: 'Veuillez choisir la durée de location.',
    subtitle: '',
    short: 'Court terme',
    shortDesc: "jusqu'à 3 mois — bureau à la journée",
    long: 'Long terme',
    longDesc: '3 mois et plus — louer un bureau',
    close: 'Fermer',
  },
  it: {
    title: 'Scegliete la durata di affitto.',
    subtitle: '',
    short: 'Breve termine',
    shortDesc: 'fino a 3 mesi — ufficio giornaliero',
    long: 'Lungo termine',
    longDesc: '3 mesi e oltre — affittare ufficio',
    close: 'Chiudi',
  },
};

export function BueroAuswahlModal() {
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' | 'it' =
    pathname?.startsWith('/en') ? 'en' :
    pathname?.startsWith('/fr') ? 'fr' :
    pathname?.startsWith('/it') ? 'it' : 'de';
  const s = STRINGS[locale];

  const [open, setOpen] = useState(false);

  useEffect(() => {
    function checkHash() {
      if (typeof window !== 'undefined' && window.location.hash === '#buero-auswahl') {
        setOpen(true);
      }
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || !href.endsWith('#buero-auswahl')) return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search + '#buero-auswahl');
      } catch {}
    }

    checkHash();
    window.addEventListener('hashchange', checkHash);
    window.addEventListener('popstate', checkHash);
    document.addEventListener('click', handleClick, true);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('popstate', checkHash);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  function handleClose() {
    setOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#buero-auswahl') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function buildHref(target: string) {
    if (locale === 'de') return target;
    return `/${locale}${target}`;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out">
          <Dialog.Title className="text-lg font-bold text-gray-900 mb-5">{s.title}</Dialog.Title>
          {s.subtitle && <Dialog.Description className="text-sm text-gray-500 -mt-3 mb-5">{s.subtitle}</Dialog.Description>}

          <div className="grid gap-3">
            <a
              href={buildHref('/tagesbuero-mieten')}
              className="block rounded-xl border border-gray-200 p-4 text-left hover:border-[#6b7f3e] hover:bg-[#f0f4e8] transition-colors"
              onClick={handleClose}
            >
              <div className="text-base font-semibold text-gray-900">{s.short}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.shortDesc}</div>
            </a>
            <a
              href={buildHref('/buero-mieten')}
              className="block rounded-xl border border-gray-200 p-4 text-left hover:border-[#6b7f3e] hover:bg-[#f0f4e8] transition-colors"
              onClick={handleClose}
            >
              <div className="text-base font-semibold text-gray-900">{s.long}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.longDesc}</div>
            </a>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label={s.close}
              className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
