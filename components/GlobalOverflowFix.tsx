'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Global client-side initializations:
 * 1. Prevents horizontal scroll (overflow-x: hidden)
 * 2. Injects Google Consent Mode v2 defaults before GTM fires
 * 3. Renders Cookie Consent Banner
 *
 * This component is included on every page via MDX, so it serves
 * as the global initialization point for client-side scripts.
 */

// Consent Mode inline script — reads localStorage and sets defaults
const CONSENT_SCRIPT = `
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

export function GlobalOverflowFix() {
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';

    // Intercept #cookie-settings clicks to open cookie banner
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.getAttribute('href') === '#cookie-settings') {
        e.preventDefault();
        window.dispatchEvent(new Event('opencookieconsent'));
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <Script
        id="consent-mode-defaults"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: CONSENT_SCRIPT }}
      />
      <style>{`
        header [data-slot="navigation-menu-content"] ul {
          grid-template-columns: 1fr !important;
          width: auto !important;
          min-width: 260px;
          max-width: 340px;
        }
        header [data-slot="navigation-menu-list"] > [data-slot="navigation-menu-item"] > a[data-slot="navigation-menu-link"] {
          color: var(--foreground) !important;
        }
      `}</style>
      <CookieBanner />
    </>
  );
}

// ─── Cookie Banner (inline) ─────────────────────────────────────────

import { useState, useCallback } from 'react';

const CONSENT_KEY = 'bizzcenter_cookie_consent';

function gtag(...args: unknown[]) {
  (window as WindowWithDataLayer).dataLayer = (window as WindowWithDataLayer).dataLayer || [];
  (window as WindowWithDataLayer).dataLayer!.push(args);
}

interface WindowWithDataLayer extends Window {
  dataLayer?: unknown[];
}

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      setVisible(true);
    }
    setInitialized(true);

    const handler = () => setVisible(true);
    window.addEventListener('opencookieconsent', handler);
    return () => window.removeEventListener('opencookieconsent', handler);
  }, []);

  const handleChoice = useCallback((choice: 'granted' | 'denied') => {
    const granted = choice === 'granted';
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
    });
    localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  }, []);

  if (!initialized || !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
        padding: '20px 24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
          Wir verwenden Cookies und vergleichbare Technologien, um unsere Website zu verbessern
          und dir relevante Inhalte anzuzeigen. Weitere Informationen findest du in unserer{' '}
          <a href="/datenschutz" style={{ color: '#6b7f3e', textDecoration: 'underline' }}>
            Datenschutzerklärung
          </a>.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleChoice('granted')}
            style={{
              padding: '10px 24px',
              background: '#6b7f3e',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Alle akzeptieren
          </button>
          <button
            onClick={() => handleChoice('denied')}
            style={{
              padding: '10px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
