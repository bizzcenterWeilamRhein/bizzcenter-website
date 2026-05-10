'use client';

/**
 * Marketing-Attribution-Tracking.
 *
 * Erfasst gclid (Google Click ID) + UTM-Parameter aus der URL und speichert
 * sie im localStorage. Beim Lead-Submit werden die Werte an /api/lead.ts
 * mitgegeben, damit wir später wissen, von wo der Lead kam.
 *
 * Lebensdauer: 90 Tage. Erste Erfassung gewinnt (existing wird nicht
 * überschrieben), damit der ursprüngliche Touchpoint erhalten bleibt.
 *
 * Verwendung:
 *   - In jedem Lead-Form: `useEffect(() => { captureMarketingAttribution(); }, [])`
 *   - Vor dem Submit:    `const attr = getMarketingAttribution();`
 *                         `body: JSON.stringify({ ...formData, ...attr })`
 */

const STORAGE_KEY = 'bizzcenter_attribution';
const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

const URL_PARAM_KEYS = [
  'gclid', 'gbraid', 'wbraid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
] as const;

const RESULT_KEYS = [
  'gclid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'referrer', 'landing_page',
] as const;

export type MarketingAttribution = Partial<Record<typeof RESULT_KEYS[number], string>>;

/**
 * Liest URL-Parameter und speichert sie in localStorage. Idempotent.
 * Bei vorhandenen Werten: ersten Touchpoint bewahren, nur leere Felder ergänzen.
 */
export function captureMarketingAttribution(): void {
  if (typeof window === 'undefined') return;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  // Was steht in der URL?
  const fromUrl: Record<string, string> = {};
  for (const k of URL_PARAM_KEYS) {
    const v = params.get(k);
    if (v) fromUrl[k] = v;
  }

  // Wenn die URL nichts hat UND localStorage schon was enthält: nichts zu tun.
  let existing: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch {
    existing = {};
  }

  // Expired? → neu starten
  const capturedAt = typeof existing.captured_at === 'string' ? existing.captured_at : '';
  if (capturedAt) {
    const age = Date.now() - new Date(capturedAt).getTime();
    if (Number.isFinite(age) && age > TTL_MS) existing = {};
  }

  // Nichts Neues + nichts zu speichern → return
  if (Object.keys(fromUrl).length === 0 && Object.keys(existing).length === 0) return;

  // Merge: existing gewinnt (first-touch), nur fehlende Felder werden ergänzt.
  const merged: Record<string, string> = {};
  for (const k of URL_PARAM_KEYS) {
    const ev = typeof existing[k] === 'string' ? (existing[k] as string) : '';
    if (ev) merged[k] = ev;
    else if (fromUrl[k]) merged[k] = fromUrl[k];
  }

  // Referrer + Landing-Page nur beim ersten Mal setzen
  const referrer = typeof existing.referrer === 'string' && existing.referrer
    ? existing.referrer
    : (typeof document !== 'undefined' ? document.referrer || '' : '');
  if (referrer) merged.referrer = referrer;

  const landing = typeof existing.landing_page === 'string' && existing.landing_page
    ? existing.landing_page
    : window.location.href;
  if (landing) merged.landing_page = landing;

  merged.captured_at = capturedAt || new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage geblockt (Private Browsing etc.) — silent fail
  }
}

/**
 * Holt die gespeicherte Attribution für POST /api/lead.
 * Liefert ein Objekt mit den Marketing-Feldern (alle optional).
 */
export function getMarketingAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') return {};

  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {};
  }
  if (!raw) return {};

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }

  const result: MarketingAttribution = {};
  for (const k of RESULT_KEYS) {
    const v = data[k];
    if (typeof v === 'string' && v) result[k] = v;
  }
  return result;
}
