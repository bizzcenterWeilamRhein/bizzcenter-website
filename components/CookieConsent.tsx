'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'bizzcenter_cookie_consent';
type ConsentChoice = 'granted' | 'denied';

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * Cookie Consent Banner with Google Consent Mode v2.
 *
 * On mount:
 * 1. Reads saved consent from localStorage
 * 2. Pushes consent defaults (denied if no choice, saved state otherwise)
 * 3. Shows banner if no choice was made yet
 *
 * Listens for 'opencookieconsent' event to reopen from footer link.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentChoice | null;

    if (!saved) {
      setVisible(true);
    }

    setInitialized(true);
  }, []);

  // Listen for reopen event from footer link
  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener('opencookieconsent', handler);
    return () => window.removeEventListener('opencookieconsent', handler);
  }, []);

  const handleChoice = useCallback((choice: ConsentChoice) => {
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
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#5a6d34')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#6b7f3e')}
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
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer link to reopen the cookie consent banner.
 * Dispatches a custom event that CookieConsent listens to.
 */
export function CookieSettingsLink() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('opencookieconsent'))}
      style={{
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer',
        padding: 0,
        fontSize: 'inherit',
        textDecoration: 'underline',
        opacity: 0.7,
      }}
    >
      Cookie-Einstellungen
    </button>
  );
}

// TypeScript global augmentation
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
