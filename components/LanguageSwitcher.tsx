'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const FLAGS: Record<string, { code: string; label: string }> = {
  de: { code: 'de', label: 'Deutsch' },
  en: { code: 'gb', label: 'English' },
  fr: { code: 'fr', label: 'Français' },
  it: { code: 'it', label: 'Italiano' },
};

const LOCALES = ['de', 'en', 'fr', 'it'];
const DEFAULT_LOCALE = 'de';

export function LanguageSwitcher() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const currentLocale = LOCALES.includes(segments[0]) ? segments[0] : DEFAULT_LOCALE;
    const pathWithoutLocale = currentLocale === DEFAULT_LOCALE
      ? pathname
      : '/' + segments.slice(1).join('/') || '/';

    // Remove any existing switchers
    document.querySelectorAll('.lang-switcher-container').forEach(el => el.remove());

    const headerNav = document.querySelector('header nav') || document.querySelector('header');
    if (!headerNav) return;

    const closeHandlers: Array<() => void> = [];

    function buildSwitcher() {
      const container = document.createElement('div');
      container.className = 'lang-switcher-container';
      container.style.cssText = 'position:relative;display:inline-flex;align-items:center;';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;border:none;background:none;padding:4px 6px;border-radius:6px;transition:background 0.2s;';
      btn.onmouseenter = () => { btn.style.background = '#f0f0f0'; };
      btn.onmouseleave = () => { btn.style.background = 'none'; };

      const flagImg = document.createElement('img');
      flagImg.src = `https://flagcdn.com/w40/${FLAGS[currentLocale].code}.png`;
      flagImg.alt = FLAGS[currentLocale].label;
      flagImg.style.cssText = 'width:22px;height:15px;object-fit:cover;border-radius:3px;display:block;';
      btn.appendChild(flagImg);

      const arrow = document.createElement('span');
      arrow.textContent = '▾';
      arrow.style.cssText = 'font-size:10px;color:#6b7280;line-height:1;';
      btn.appendChild(arrow);

      const menu = document.createElement('div');
      menu.style.cssText = 'display:none;position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;z-index:9999;min-width:140px;';

      LOCALES.forEach(locale => {
        const link = document.createElement('a');
        const localePath = locale === DEFAULT_LOCALE
          ? pathWithoutLocale
          : `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
        link.href = localePath;
        link.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 12px;text-decoration:none;color:#374151;font-size:13px;transition:background 0.15s;${locale === currentLocale ? 'background:#f0f4e8;font-weight:600;' : ''}`;
        link.onmouseenter = () => { link.style.background = locale === currentLocale ? '#f0f4e8' : '#f9fafb'; };
        link.onmouseleave = () => { link.style.background = locale === currentLocale ? '#f0f4e8' : 'transparent'; };
        link.onclick = (e) => {
          e.preventDefault();
          document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
          window.location.href = localePath;
        };

        const img = document.createElement('img');
        img.src = `https://flagcdn.com/w40/${FLAGS[locale].code}.png`;
        img.alt = FLAGS[locale].label;
        img.style.cssText = 'width:20px;height:14px;object-fit:cover;border-radius:3px;';
        link.appendChild(img);

        const text = document.createElement('span');
        text.textContent = FLAGS[locale].label;
        link.appendChild(text);

        menu.appendChild(link);
      });

      container.appendChild(btn);
      container.appendChild(menu);

      btn.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      };

      const closeHandler = () => { menu.style.display = 'none'; };
      document.addEventListener('click', closeHandler);
      closeHandlers.push(closeHandler);

      return container;
    }

    // Desktop: append into NavbarRight (visible only >= md)
    const desktopWrapper = headerNav.querySelector('[class*="hidden"][class*="md:flex"]')
      || headerNav.querySelector('[class*="NavbarRight"]');
    if (desktopWrapper) {
      const c = buildSwitcher();
      (c as HTMLElement).style.marginLeft = '8px';
      desktopWrapper.appendChild(c);
    }

    // Mobile: insert before burger inside the md:hidden wrapper (visible only < md)
    const mobileWrapper = headerNav.querySelector('[class*="md:hidden"]');
    if (mobileWrapper) {
      const c = buildSwitcher();
      (c as HTMLElement).style.marginRight = '4px';
      mobileWrapper.insertBefore(c, mobileWrapper.firstChild);
    }

    return () => {
      closeHandlers.forEach(h => document.removeEventListener('click', h));
      document.querySelectorAll('.lang-switcher-container').forEach(el => el.remove());
    };
  }, [pathname]);

  return null;
}
