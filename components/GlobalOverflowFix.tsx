'use client';

import { useEffect } from 'react';

/**
 * Prevents horizontal scroll on all pages.
 * Injected via useEffect so it works even when only included on some pages.
 * Targets html + body to catch overflow from animated marquee elements.
 */
export function GlobalOverflowFix() {
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

  return null;
}
