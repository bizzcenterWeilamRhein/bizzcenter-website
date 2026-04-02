'use client';

import Script from 'next/script';

/**
 * Injects Consent Mode v2 defaults as inline <script> into the page head.
 * Uses next/script with beforeInteractive to ensure it runs BEFORE GTM.
 *
 * Reads saved consent from localStorage:
 * - If 'granted' → sets all consent to granted
 * - Otherwise → sets all consent to denied with wait_for_update
 *
 * NOTE: This component must be placed in a layout file for
 * beforeInteractive to work. If used in MDX pages, falls back to
 * afterInteractive which still works because of wait_for_update.
 */
export function ConsentModeInit() {
  // The script reads localStorage at runtime
  const script = `
(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  var saved = null;
  try { saved = localStorage.getItem('bizzcenter_cookie_consent'); } catch(e) {}
  if (saved === 'granted') {
    gtag('consent', 'default', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
  } else {
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'wait_for_update': 500
    });
  }
})();
  `.trim();

  return (
    <Script
      id="consent-mode-defaults"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
