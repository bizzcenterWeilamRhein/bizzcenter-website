'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ActiveNavHighlight() {
  const pathname = usePathname();

  // Inject responsive header CSS once
  useEffect(() => {
    if (!document.getElementById('nav-responsive-css')) {
      const style = document.createElement('style');
      style.id = 'nav-responsive-css';
      style.textContent = `
        /* Desktop-Nav ab 1280px zeigen statt 768px — darunter Hamburger */
        @media (max-width: 1279px) {
          header [data-slot="navbar-right"] { display: none !important; }
          header .md\\:hidden { display: flex !important; }
        }
        @media (min-width: 1280px) {
          header [data-slot="navbar-right"] { display: flex !important; }
          header .md\\:hidden { display: none !important; }
        }
        /* Kompaktere Nav bei 1280-1400px */
        @media (min-width: 1280px) and (max-width: 1400px) {
          header nav a, header nav button { font-size: 0.85rem !important; padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
          header nav { gap: 0.2rem !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    // Fix logo size to prevent header overflow
    const logoImg = header.querySelector('a[href="/"] img') as HTMLImageElement | null;
    if (logoImg) {
      logoImg.style.maxWidth = '150px';
      logoImg.style.height = 'auto';
    }

    const links = header.querySelectorAll<HTMLAnchorElement>('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '/') {
        link.removeAttribute('data-nav-active');
        return;
      }

      const isActive = pathname === href || pathname.startsWith(href + '/');
      if (isActive) {
        link.setAttribute('data-nav-active', 'true');
        link.style.backgroundColor = '#f0f4e8';
        link.style.borderRadius = '8px';
        link.style.color = '#6b7f3e';
        link.style.fontWeight = '600';
      } else {
        link.removeAttribute('data-nav-active');
        link.style.backgroundColor = '';
        link.style.borderRadius = '';
        link.style.color = '';
        link.style.fontWeight = '';
      }
    });
  }, [pathname]);

  return null;
}

export default ActiveNavHighlight;
