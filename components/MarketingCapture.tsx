'use client';

import { useEffect } from 'react';
import { captureMarketingAttribution } from './lib/marketing';

/**
 * Unsichtbare Komponente: erfasst beim Mount Marketing-Attribution
 * (gclid, utm_*) aus der URL und speichert sie in localStorage.
 *
 * Eine MDX-Seite kann diese Komponente einbauen, damit auch
 * Landing-Pages, die kein Lead-Formular haben, die Attribution
 * früh genug erfassen — bevor der User zur Kontaktseite weiterklickt
 * (wo gclid dann nicht mehr in der URL steht).
 *
 * Beispiel in MDX:
 *   <MarketingCapture />
 */
export function MarketingCapture(): null {
  useEffect(() => {
    captureMarketingAttribution();
  }, []);
  return null;
}
