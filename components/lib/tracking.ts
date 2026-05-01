/**
 * Event-basiertes Conversion-Tracking für die bizzcenter-Website.
 *
 * Drei öffentliche Funktionen:
 *   - trackLeadSubmitted(formular, metadata?) — nach erfolgreich abgeschicktem Lead-Formular
 *   - trackTourBooked(metadata?) — nach erfolgreicher Cal.com-Buchung (Cal.com aktuell nicht eingebunden)
 *   - trackPurchaseCompleted(produkt, wert, metadata?) — nach erfolgreichem Stripe-Checkout
 *
 * Jeder Aufruf feuert parallel an zwei Empfänger:
 *   1. Google Tag Manager dataLayer (nur wenn Cookie-Consent granted)
 *   2. bizzcenter-CRM /api/events (immer)
 *
 * Beide Empfänger sind unabhängig fehlertolerant — ein Fehler bricht nie den User-Flow.
 * Kein await, kein return — Aufrufer können sofort weitermachen (Redirect, setState, …).
 */

'use client';

// ─── Config ────────────────────────────────────────────────────────────

/**
 * URL des CRM-Event-Endpoints. In Vercel via NEXT_PUBLIC_CRM_EVENTS_URL setzen,
 * z. B. https://crm.bizzcenter.de/api/events.
 * Wenn leer → CRM-Call wird übersprungen (lokale Entwicklung unproblematisch).
 */
const CRM_EVENTS_URL = process.env.NEXT_PUBLIC_CRM_EVENTS_URL ?? '';

/** localStorage-Key, der vom Cookie-Consent-Banner gesetzt wird. */
const CONSENT_KEY = 'bizzcenter_cookie_consent';

// ─── Types ─────────────────────────────────────────────────────────────

/**
 * EventType-Werte, die der CRM aktuell kennt (aus prisma/schema.prisma).
 * TODO (CRM-Migration): `PURCHASE_COMPLETED` ergänzen — bis dahin senden wir
 * `RAUM_GEBUCHT` für Stripe-Purchases (pragmatisch, semantisch leicht daneben).
 */
type CrmEventType = 'FORM_SUBMITTED' | 'TOUR_BOOKED' | 'RAUM_GEBUCHT';

export interface TrackingMetadata {
  /** Wenn verfügbar, wird der Event mit dem Lead im CRM verknüpft (→ Scoring). */
  leadId?: string;
  /** Beliebige zusätzliche Payload-Felder. */
  [key: string]: unknown;
}

// ─── Helpers ───────────────────────────────────────────────────────────

type WindowWithDataLayer = Window & { dataLayer?: unknown[] };

function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

function isDebug(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('tracking_debug') === '1';
  } catch {
    return false;
  }
}

function debugLog(...args: unknown[]): void {
  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.info('[tracking]', ...args);
  }
}

/** Schreibt auf den GTM-dataLayer — nur wenn Consent Mode granted. */
function pushDataLayer(event: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  if (!hasConsent()) {
    debugLog('dataLayer skipped (no consent):', event);
    return;
  }

  try {
    const w = window as WindowWithDataLayer;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(event);
    debugLog('dataLayer pushed:', event);
  } catch (err) {
    debugLog('dataLayer push failed:', err);
  }
}

/**
 * Sendet Event an CRM. Fire-and-forget, keepalive:true stellt sicher, dass der
 * Request auch beim sofortigen Navigieren (z. B. Stripe-Redirect) durchgeht.
 */
function sendCrmEvent(typ: CrmEventType, metadata: TrackingMetadata): void {
  if (!CRM_EVENTS_URL) {
    debugLog('CRM call skipped (no URL configured):', typ, metadata);
    return;
  }

  const { leadId, ...rest } = metadata;
  const seite = typeof window !== 'undefined' ? window.location.pathname : undefined;

  const body = JSON.stringify({
    typ,
    leadId,
    seite,
    metadaten: rest,
  });

  try {
    fetch(CRM_EVENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
      .then((res) => debugLog('CRM call:', typ, 'status', res.status))
      .catch((err) => debugLog('CRM call failed:', typ, err));
  } catch (err) {
    debugLog('CRM call sync-throw:', err);
  }
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Feuert nach erfolgreich abgeschicktem Lead-Formular.
 *
 * @param formular  Maschinenlesbarer Formular-Name (snake_case), z. B. 'kontakt_allgemein'.
 * @param metadata  Zusätzliche Felder. `leadId` verknüpft den Event mit dem Lead im CRM.
 */
export function trackLeadSubmitted(formular: string, metadata: TrackingMetadata = {}): void {
  pushDataLayer({
    event: 'lead_submitted',
    formular,
    ...metadata,
  });
  sendCrmEvent('FORM_SUBMITTED', { formular, ...metadata });
}

/**
 * Feuert nach erfolgreicher Tour-/Besichtigungs-Buchung (z. B. Cal.com-Webhook
 * oder Success-Callback). Aktuell unbenutzt, da Cal.com nicht eingebunden ist.
 */
export function trackTourBooked(metadata: TrackingMetadata = {}): void {
  pushDataLayer({
    event: 'tour_booked',
    ...metadata,
  });
  sendCrmEvent('TOUR_BOOKED', metadata);
}

/**
 * Feuert nach erfolgreichem Stripe-Checkout (üblicherweise auf der Success-Seite).
 *
 * @param produkt   Produkt-Slug, z. B. 'beamer_epson_eh_tw650'.
 * @param wert      Zahlungsbetrag in EUR (netto).
 * @param metadata  Zusätzliche Felder.
 */
export function trackPurchaseCompleted(
  produkt: string,
  wert: number,
  metadata: TrackingMetadata = {},
): void {
  pushDataLayer({
    event: 'purchase_completed',
    produkt,
    conversion_value: wert,
    currency: 'EUR',
    ...metadata,
  });
  // TODO (CRM-Migration): dedicated PURCHASE_COMPLETED event type ergänzen und
  // dann hier RAUM_GEBUCHT → PURCHASE_COMPLETED ersetzen.
  sendCrmEvent('RAUM_GEBUCHT', { produkt, wert, ...metadata });
}
