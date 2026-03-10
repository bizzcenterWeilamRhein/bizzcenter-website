'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ActiveNavHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

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
