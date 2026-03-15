'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { submitLead } from './submitLead';

/* ── Hero Galerie ── */
function HeroGallery({ images, title, subtitle, preisLabel }: {
  images: string[]; title: string; subtitle: string; preisLabel: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setCurrent(i => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <div style={{ position: 'relative', width: '100%', height: 420, background: '#eee' }}>
        <img
          src={images[current]}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      {/* Gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)', pointerEvents: 'none' }} />
      {/* Pfeile */}
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ‹
          </button>
          <button onClick={() => setCurrent(i => (i + 1) % images.length)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ›
          </button>
        </>
      )}
      {/* Text */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>ab</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>{preisLabel}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>halber Tag, zzgl. MwSt.</p>
        </div>
      </div>
      {/* Dots */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Typen ── */
interface RaumConfig {
  id: string;
  label: string;
  subtitle: string;
  image: string;
  gallery?: string[];
  kapazitaet: number;
  preise: {
    stunde: number;
    halberTag: number;
    tag: number;
    stunde10er: number;
    halberTag10er: number;
    tag10er: number;
  };
}

interface Addon {
  id: string;
  label: string;
  beschreibung: string;
  preis: string;
  preisWert: number;
  einheit: 'pauschal' | 'pro-person' | 'pro-tag' | 'pro-person-tag' | 'pro-stueck-tag';
  icon: string;
  mitMenge?: boolean;
  mengeLabel?: string;
  nurRaeume?: string[];
  gruppe?: string;
}

interface KonferenzBuchungProps {
  raumId?: string;
}


/* PHYSISCHE RAUM-VERKNÜPFUNG:
 * L und XL sind derselbe physische Raum.
 * Wenn L gebucht ist, ist XL nicht verfügbar (und umgekehrt).
 */
const SHARED_ROOMS: Record<string, string[]> = {
  'L': ['L', 'XL'],
  'XL': ['L', 'XL'],
};

/* VERFÜGBARKEITSPRÜFUNG (PLATZHALTER)
 * TODO: API-Call an CRM /api/buchung/verfuegbarkeit
 * Gibt pro Raum-ID ein Array von gebuchten Datums-Strings zurück.
 * Bei SHARED_ROOMS müssen alle verknüpften Räume abgefragt werden.
 * 1. useEffect beim Laden: fetch verfuegbarkeit API
 * 2. Gebuchte Tage im Kalender ausgrauen (disabled + visueller Hinweis)
 * 3. Bei Raumwechsel: Verfügbarkeit der SHARED_ROOMS berücksichtigen
 * 4. Tooltip: Dieser Raum ist an diesem Tag bereits belegt
 */
const _bookedDates: Record<string, string[]> = {}; // Platzhalter


/* ── Konfiguration ── */
const RAEUME: RaumConfig[] = [
  {
    id: 'S', label: 'Meetingraum bis 2 Personen', subtitle: '', kapazitaet: 2,
    image: '/images/standorte/weil-am-rhein/green-office-buero-2-personen.jpg',
    gallery: [
      '/images/standorte/weil-am-rhein/green-office-buero-2-personen.jpg',
      '/images/standorte/weil-am-rhein/meetingraum-weil.jpg',
      '/images/standorte/weil-am-rhein/green-office.jpg',
      '/images/standorte/weil-am-rhein/green-office-flurbereich.jpg',
    ],
    preise: { stunde: 19, halberTag: 59, tag: 89, stunde10er: 16, halberTag10er: 49, tag10er: 76 },
  },
  {
    id: 'M', label: 'Meetingraum bis 6 Personen', subtitle: '', kapazitaet: 6,
    image: '/images/standorte/weil-am-rhein/meetingraum-6-personen.jpg',
    gallery: [
      '/images/standorte/weil-am-rhein/meetingraum-6-personen.jpg',
      '/images/standorte/weil-am-rhein/meetingraum-green-office-4-6-personen.jpg',
      '/images/standorte/weil-am-rhein/green-office.jpg',
    ],
    preise: { stunde: 29, halberTag: 89, tag: 129, stunde10er: 25, halberTag10er: 76, tag10er: 109 },
  },
  {
    id: 'L', label: 'Meetingraum bis 15 Personen', subtitle: '', kapazitaet: 15,
    image: '/images/standorte/weil-am-rhein/konferenzraum-gross.jpg',
    preise: { stunde: 39, halberTag: 99, tag: 159, stunde10er: 33, halberTag10er: 85, tag10er: 135 },
  },
  {
    id: 'XL', label: 'Konferenzraum bis 25 Personen', subtitle: '', kapazitaet: 25,
    image: '/images/standorte/weil-am-rhein/konferenzraum-gross.jpg',
    preise: { stunde: 49, halberTag: 129, tag: 199, stunde10er: 42, halberTag10er: 109, tag10er: 169 },
  },
];

/* SVG Icons für Add-ons (Heroicons outline, strokeWidth 1.5) */
const AddonIcons: Record<string, React.ReactNode> = {
  kaffeeflat: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 9h12a3 3 0 013 3v1a3 3 0 01-3 3H4V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 11h1.5a2.5 2.5 0 010 5H16" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 20h8" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 5v2m2-3v3m2-2v2" /></svg>,
  extrastunde: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  getraenkeflat: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 3v3.5L7 21h10l-2.5-14.5V3m-5 0h5M8.5 14h7" /></svg>,
  'catering-snack': <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12" /></svg>,
  'catering-lunch': <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  beamer: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg>,
  moderationskoffer: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  monitor: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>,
  umbaupauschale: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a2.121 2.121 0 113-3l5.1 5.1m0 0L18 9.6m-6.58 5.57L18 21.75m-6.58-6.58L5.25 21.75m13.5-13.5L21 6l-2.25-2.25L16.5 6l2.25 2.25z" /></svg>,
  'extrastunde-10er': <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'parkplatz-10er': <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  parkplatz: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.375m-7.5-8.25h3.75a1.125 1.125 0 011.079.82l.464 1.854a1.125 1.125 0 001.08.82h.39a1.125 1.125 0 011.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H2.25A1.125 1.125 0 011.125 12V9.75c0-.621.504-1.125 1.125-1.125h.39a1.125 1.125 0 001.08-.82l.464-1.854A1.125 1.125 0 015.25 5.25h3.75" /></svg>,
};

const ADDONS: Addon[] = [
  // --- Getränke ---
  { id: 'kaffeeflat', label: 'Kaffee- & Tee-Flat', beschreibung: 'Kaffee und Tee — unbegrenzt', preis: 'EUR 8,- / Person', preisWert: 8, einheit: 'pro-stueck-tag', icon: '', mitMenge: true, mengeLabel: 'Personen', gruppe: 'Getränke' },
  { id: 'getraenkeflat', label: 'Komplett-Flat', beschreibung: 'Kaffee, Tee, Mineralwasser und Säfte — unbegrenzt', preis: 'EUR 14,- / Person', preisWert: 14, einheit: 'pro-stueck-tag', icon: '', mitMenge: true, mengeLabel: 'Personen', gruppe: 'Getränke' },
  // --- Technik ---
  { id: 'beamer', label: 'Beamer / Präsentationstechnik', beschreibung: 'Full-HD Beamer mit Anschlusskabel', preis: '', preisWert: 0, einheit: 'pauschal', icon: '', gruppe: 'Technik' },
  { id: 'monitor', label: '27" Curved Monitor', beschreibung: 'Externer Bildschirm für Präsentationen oder Arbeitsplatz', preis: 'EUR 9,- / Tag', preisWert: 9, einheit: 'pro-stueck-tag', icon: '', mitMenge: true, mengeLabel: 'Monitore', gruppe: 'Technik' },
  { id: 'moderationskoffer', label: 'Moderationskoffer', beschreibung: 'Stifte, Karten, Pins, Flipchart-Papier', preis: 'EUR 29,- pauschal', preisWert: 29, einheit: 'pauschal', icon: '', gruppe: 'Technik' },
  { id: 'umbaupauschale', label: 'Umbaupauschale', beschreibung: 'Abweichend von Grundbestuhlung (Blockbestuhlung, 20 Plätze)', preis: 'EUR 59,- pauschal', preisWert: 59, einheit: 'pauschal', icon: '', nurRaeume: ['L', 'XL'], gruppe: 'Technik' },
  // --- Zeit & Flexibilität ---
  { id: 'extrastunde', label: 'Extrastunde', beschreibung: 'Sie brauchen doch etwas mehr Zeit? Buchen Sie sich bequem eine Stunde hinzu.', preis: 'EUR 14,- / Stunde', preisWert: 14, einheit: 'pro-stueck-tag', icon: '', mitMenge: true, mengeLabel: 'Stunden', gruppe: 'Zeit & Flexibilität' },
  { id: 'extrastunde-10er', label: '10er-Karte Extrastunden', beschreibung: '10 Extrastunden zum Vorteilspreis — 15% günstiger.', preis: 'EUR 119,- (10 Stunden)', preisWert: 119, einheit: 'pauschal', icon: '', gruppe: 'Zeit & Flexibilität' },
  // --- Parkplatz & Lager ---
  { id: 'parkplatz', label: 'Parkplatz reserviert', beschreibung: 'Reservierter Stellplatz direkt am Gebäude', preis: 'EUR 6,- / Tag', preisWert: 6, einheit: 'pro-stueck-tag', icon: '', mitMenge: true, mengeLabel: 'Parkplätze', gruppe: 'Parkplatz & Lager' },
  { id: 'parkplatz-10er', label: '10er-Karte Parkplatz', beschreibung: '10 Tages-Parkplätze zum Vorteilspreis — 15% günstiger.', preis: 'EUR 51,- (10 Tage)', preisWert: 51, einheit: 'pauschal', icon: '', gruppe: 'Parkplatz & Lager' },

];

/* ── Kalender-Helfer ── */
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
  return days;
}

function dateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDE(ds: string) {
  const d = new Date(ds + 'T00:00:00');
  const wday = d.toLocaleDateString('de-DE', { weekday: 'short' }).padEnd(3, ' ');
  const day = d.getDate();
  const month = d.toLocaleDateString('de-DE', { month: 'long' });
  return `${wday} ${String(day).padStart(2, '\u2007')}. ${month}`;
}

function isWeekend(_ds: string) {
  return false; // Alle Tage buchbar — auch Sa/So
}

/* ── Komponente ── */
export function KonferenzBuchung({ raumId = 'S' }: KonferenzBuchungProps) {
  const [activeRaumId, setActiveRaumId] = useState(raumId);
  const selectedRaum = RAEUME.find(r => r.id === activeRaumId) || RAEUME[0];

  // State
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [dauer, setDauer] = useState<'halberTag' | 'tag'>('tag');
  const [use10er, setUse10er] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [teilnehmer, setTeilnehmer] = useState(2);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [addonMengen, setAddonMengen] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    firma: '', anrede: '', name: '', strasse: '', hausnummer: '', plz: '', ort: '',
    email: '', telefon: '', bemerkungen: '', agb: false, privatmiete: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return dateStr(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return dateStr(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  /* Alle Werktage zwischen zwei Daten */
  const getWeekdaysInRange = useCallback((start: string, end: string) => {
    const days: string[] = [];
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const from = s <= e ? s : e;
    const to = s <= e ? e : s;
    const cur = new Date(from);
    while (cur <= to) {
      const ds = dateStr(cur.getFullYear(), cur.getMonth(), cur.getDate());
      if (!isWeekend(ds) && ds >= todayStr && ds <= maxDateStr) {
        days.push(ds);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [todayStr, maxDateStr]);

  const lastClickedRef = React.useRef<string | null>(null);

  const handleDateClick = useCallback((ds: string) => {
    if (ds < todayStr || ds > maxDateStr) return;

    if (selectedDates.includes(ds)) {
      // Klick auf bereits gewählten Tag: entfernen
      setSelectedDates(prev => prev.filter(d => d !== ds));
      lastClickedRef.current = null;
    } else if (lastClickedRef.current && lastClickedRef.current !== ds) {
      // Zweiter Klick auf neuen Tag: Bereich dazwischen füllen
      const range = getWeekdaysInRange(lastClickedRef.current, ds);
      setSelectedDates(prev => {
        const set = new Set(prev);
        range.forEach(d => set.add(d));
        return [...set].sort();
      });
      lastClickedRef.current = ds;
    } else {
      // Einzelner Tag: auswählen
      setSelectedDates(prev => [...prev, ds].sort());
      lastClickedRef.current = ds;
    }
    setRangeStart(null);
  }, [todayStr, maxDateStr, selectedDates, getWeekdaysInRange]);

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddons(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* Dynamische Addon-Preise (dauerabhängig) */
  const ADDON_PRICES: Record<string, { halberTag: number; tag: number }> = {

    beamer: { halberTag: 39, tag: 59 },
  };

  const getAddonPreis = useCallback((addonId: string, addon: Addon) => {
    const dynamic = ADDON_PRICES[addonId];
    if (dynamic) return dauer === 'tag' ? dynamic.tag : dynamic.halberTag;
    return addon.preisWert;
  }, [dauer]);

  const getAddonPreisLabel = useCallback((addonId: string, addon: Addon) => {
    const dynamic = ADDON_PRICES[addonId];
    if (dynamic) {
      return dauer === 'tag'
        ? `EUR ${dynamic.tag},- / Tag`
        : `EUR ${dynamic.halberTag},- / halber Tag`;
    }
    return addon.preis;
  }, [dauer]);

  /* Preisberechnung */
  const preis = useMemo(() => {
    const tage = selectedDates.length;
    const raumPreis = use10er
      ? (dauer === 'tag' ? selectedRaum.preise.tag10er : selectedRaum.preise.halberTag10er)
      : (dauer === 'tag' ? selectedRaum.preise.tag : selectedRaum.preise.halberTag);
    const raumGesamt = raumPreis * tage;

    let addonGesamt = 0;
    ADDONS.forEach(a => {
      if (!selectedAddons[a.id]) return;
      const p = getAddonPreis(a.id, a);
      if (p === 0) return; // Preis auf Anfrage
      const menge = addonMengen[a.id] || 1;
      switch (a.einheit) {
        case 'pauschal': addonGesamt += p * tage; break;
        case 'pro-person': addonGesamt += p * teilnehmer * tage; break;
        case 'pro-tag': addonGesamt += p * tage; break;
        case 'pro-person-tag': addonGesamt += p * teilnehmer * tage; break;
        case 'pro-stueck-tag': addonGesamt += p * menge * tage; break;
      }
    });

    return { raum: raumGesamt, addons: addonGesamt, gesamt: raumGesamt + addonGesamt, tage };
  }, [selectedDates, dauer, use10er, selectedRaum, selectedAddons, teilnehmer, addonMengen, getAddonPreis]);

  /* Submit */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const activeAddons = ADDONS.filter(a => selectedAddons[a.id]).map(a => {
        const menge = addonMengen[a.id] || 1;
        return a.mitMenge ? `${a.label} (${menge}×)` : a.label;
      });

      const result = await submitLead({
        firma: form.firma,
        anrede: form.anrede,
        name: form.name,
        email: form.email,
        telefon: form.telefon || undefined,
        strasse: form.strasse,
        plz: form.plz,
        ort: form.ort,
        quelle: 'konferenzraum-buchung',
        bemerkungen: form.bemerkungen || undefined,
        raum: selectedRaum.label,
        dauer: dauer === 'tag' ? 'Ganzer Tag' : 'Halber Tag',
        termine: selectedDates,
        addons: activeAddons.length > 0 ? activeAddons : undefined,
        gesamtpreis: preis.gesamt,
      });

      if (!result.success) {
        alert(result.error || 'Fehler beim Senden. Bitte versuchen Sie es erneut.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      alert('Netzwerkfehler — bitte versuchen Sie es erneut.');
    }
    setSubmitting(false);
  };

  const canSubmit = selectedDates.length > 0 && (form.privatmiete || form.firma) && form.anrede && form.name && form.strasse && form.plz && form.ort && form.email && form.agb;

  if (submitted) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Buchung bestätigt!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Vielen Dank für Ihre Buchung! Sie erhalten eine Bestätigung per E-Mail.
        </p>
        <div className="bg-white rounded-2xl p-5 max-w-sm mx-auto text-sm text-gray-600 space-y-1 shadow-sm border">
          <p><strong>Standort:</strong> bizzcenter Weil am Rhein</p>
          <p><strong>Adresse:</strong> Am Kesselhaus 3, 79576 Weil am Rhein</p>
          <p><strong>Parken:</strong> 90 Min. kostenfrei, danach EUR 6,- Tagestarif</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">

      {/* ══════ RAUM-HEADER MIT GALERIE ══════ */}
      <HeroGallery
        images={selectedRaum.gallery || [selectedRaum.image]}
        title={`${selectedRaum.label} buchen`}
        subtitle={`${selectedRaum.subtitle} · bizzcenter Weil am Rhein`}
        preisLabel={`EUR ${selectedRaum.preise.halberTag},-`}
      />

      {/* ══════ HAUPTBEREICH ══════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── LINKE SPALTE ── */}
        <div className="space-y-8">

          {/* ── 1. Dauer & Teilnehmer ── */}
          <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">1. Dauer & Teilnehmer</h3>

            {/* Dauer — 4 Kästchen in einer Reihe: Halber Tag | 10er Halber Tag | Ganzer Tag | 10er Ganzer Tag */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              {[
                { d: 'halberTag' as const, ten: false, label: 'Halber Tag', sub: '4 Stunden', preis: selectedRaum.preise.halberTag },
                { d: 'halberTag' as const, ten: true, label: '10er-Karte', sub: 'Halber Tag', preis: selectedRaum.preise.halberTag10er, badge: true },
                { d: 'tag' as const, ten: false, label: 'Ganzer Tag', sub: '', preis: selectedRaum.preise.tag },
                { d: 'tag' as const, ten: true, label: '10er-Karte', sub: 'Ganzer Tag', preis: selectedRaum.preise.tag10er, badge: true },
              ].map((opt, i) => {
                const active = dauer === opt.d && use10er === opt.ten;
                return (
                  <button
                    key={i}
                    onClick={() => { setDauer(opt.d); setUse10er(opt.ten); }}
                    style={{
                      padding: '12px 8px', textAlign: 'center', cursor: 'pointer',
                      border: active ? '2px solid #6b7f3e' : '2px solid #e5e7eb',
                      borderRadius: '12px', backgroundColor: active ? '#f0f4e8' : '#fff',
                      transition: 'all 0.2s', position: 'relative',
                    }}
                  >
                    {opt.badge && (
                      <span style={{ position: 'absolute', top: '-8px', right: '-4px', fontSize: '9px', fontWeight: 700, backgroundColor: '#6b7f3e', color: '#fff', borderRadius: '9999px', padding: '2px 6px' }}>−15%</span>
                    )}
                    <p style={{ fontWeight: 600, color: '#111', margin: 0, fontSize: '13px' }}>{opt.label}</p>
                    {opt.sub && <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>{opt.sub}</p>}
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#6b7f3e', margin: '6px 0 0' }}>
                      EUR {opt.preis},-
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Teilnehmer */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Teilnehmeranzahl</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setTeilnehmer(Math.max(1, teilnehmer - 1))} className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg hover:bg-gray-50">−</button>
                <span className="text-lg font-bold w-8 text-center">{teilnehmer}</span>
                <button
                  onClick={() => {
                    const next = teilnehmer + 1;
                    if (next > selectedRaum.kapazitaet) {
                      const bigger = RAEUME.find(r => r.kapazitaet >= next && RAEUME.indexOf(r) > RAEUME.indexOf(selectedRaum));
                      if (bigger) { setActiveRaumId(bigger.id); setTeilnehmer(next); }
                    } else {
                      setTeilnehmer(next);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg hover:bg-gray-50"
                >+</button>
                <span className="text-sm text-gray-400">max. {selectedRaum.kapazitaet} Personen</span>
              </div>
              {teilnehmer >= selectedRaum.kapazitaet && (() => {
                const bigger = RAEUME.find(r => r.kapazitaet > selectedRaum.kapazitaet);
                return bigger ? (
                  <button
                    onClick={() => { setActiveRaumId(bigger.id); setTeilnehmer(selectedRaum.kapazitaet + 1); }}
                    className="mt-3 w-full p-3 rounded-xl border-2 border-dashed border-[#6b7f3e]/40 bg-[#f0f4e8]/50 text-left hover:border-[#6b7f3e] hover:bg-[#f0f4e8] transition-all"
                  >
                    <p className="text-sm font-semibold text-[#6b7f3e]">Mehr Platz nötig?</p>
                    <p className="text-xs text-gray-600">Wechseln zum <strong>{bigger.label}</strong> — ab EUR {bigger.preise.halberTag},- zzgl. MwSt.</p>
                  </button>
                ) : null;
              })()}
            </div>
          </section>

          {/* ── 2. Datum wählen ── */}
          <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                2. Datum wählen
                {selectedDates.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#6b7f3e]">
                    ({selectedDates.length} {selectedDates.length === 1 ? 'Tag' : 'Tage'})
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                {'Wählen Sie Ihre gewünschten Tage'}
              </p>
            </div>

            {/* Kalender Nav */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1);
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm font-semibold min-w-[140px] text-center">
                {new Date(calYear, calMonth).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1);
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Kalender Grid */}
            <div style={{ maxWidth: '380px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 500, color: '#9ca3af', padding: '2px 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                {getMonthDays(calYear, calMonth).map((day, i) => {
                  if (!day) return <div key={i} />;
                  const ds = dateStr(calYear, calMonth, day);
                  const isPast = ds < todayStr;
                  const isTooFar = ds > maxDateStr;
                  const weekend = isWeekend(ds);
                  const selected = selectedDates.includes(ds);
                  const disabled = isPast || isTooFar || weekend;

                  return (
                    <button
                      key={i}
                      onClick={() => !disabled && handleDateClick(ds)}
                      disabled={disabled}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: selected || ds === todayStr ? 700 : 500,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: selected ? '#6b7f3e' : ds === rangeStart ? '#6b7f3e' : ds === todayStr ? '#f0f4e8' : 'transparent',
                        color: selected || ds === rangeStart ? '#fff' : disabled ? '#d1d5db' : ds === todayStr ? '#6b7f3e' : '#374151',
                        border: ds === todayStr && !selected ? '1px solid rgba(107,127,62,0.3)' : '1px solid transparent',
                        boxShadow: selected ? '0 1px 3px rgba(107,127,62,0.3)' : 'none',
                      }}
                      onMouseEnter={e => { if (!disabled && !selected) (e.target as HTMLElement).style.backgroundColor = '#f0f4e8'; }}
                      onMouseLeave={e => { if (!disabled && !selected) (e.target as HTMLElement).style.backgroundColor = ds === todayStr ? '#f0f4e8' : 'transparent'; }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gewählte Tage */}
            {selectedDates.length > 0 && (
              <div className="bg-[#f5f0eb] rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map(ds => (
                    <span key={ds} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-[#6b7f3e] rounded-full text-sm font-medium shadow-sm border border-[#6b7f3e]/20">
                      {formatDE(ds)}
                      <button onClick={() => setSelectedDates(prev => prev.filter(d => d !== ds))} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {preis.tage} × {dauer === 'tag' ? 'Ganzer Tag' : 'Halber Tag'} — {selectedRaum.label}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#6b7f3e]">EUR {preis.raum},-</span>
                    <span className="text-xs text-gray-400 ml-1">zzgl. MwSt.</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── 3. Extras / Add-ons ── */}
          <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">3. Extras hinzubuchen <span className="text-sm font-normal text-gray-400">(optional)</span></h3>

            {(() => {
              const filtered = ADDONS.filter(a => !a.nurRaeume || a.nurRaeume.includes(selectedRaum.id));
              const gruppen = [...new Set(filtered.map(a => a.gruppe || 'Sonstiges'))];
              return gruppen.map(gruppe => (
                <div key={gruppe} className="space-y-2">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{gruppe}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.filter(a => (a.gruppe || 'Sonstiges') === gruppe).map(addon => {
                      const active = selectedAddons[addon.id];
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            active ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-[#6b7f3e] shrink-0 mt-0.5">{AddonIcons[addon.id]}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-900 text-sm">{addon.label}</p>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs shrink-0 ${
                                  active ? 'bg-[#6b7f3e] border-[#6b7f3e] text-white' : 'border-gray-300'
                                }`}>{active && '✓'}</div>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{addon.beschreibung}</p>
                              <p className="text-xs font-semibold text-[#6b7f3e] mt-1">
                                {addon.id === 'catering-lunch' ? (
                                  <span className="text-gray-500 font-normal italic">Preis auf Anfrage</span>
                                ) : (
                                  <>{getAddonPreisLabel(addon.id, addon)} <span className="font-normal text-gray-400">zzgl. MwSt.</span></>
                                )}
                              </p>
                              {addon.mitMenge && active && (
                                <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                  <span className="text-xs text-gray-500">{addon.mengeLabel}:</span>
                                  <button
                                    onClick={() => setAddonMengen(m => ({ ...m, [addon.id]: Math.max(1, (m[addon.id] || 1) - 1) }))}
                                    className="w-7 h-7 rounded border flex items-center justify-center text-sm hover:bg-gray-50"
                                  >−</button>
                                  <span className="text-sm font-bold w-6 text-center">{addonMengen[addon.id] || 1}</span>
                                  <button
                                    onClick={() => setAddonMengen(m => ({ ...m, [addon.id]: Math.min(25, (m[addon.id] || 1) + 1) }))}
                                    className="w-7 h-7 rounded border flex items-center justify-center text-sm hover:bg-gray-50"
                                  >+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </section>

          {/* ── 4. Kontaktdaten ── */}
          <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">4. Ihre Buchungsdaten</h3>

            {/* Zeile 1: Firma + Privat-Checkbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Firma / Unternehmen {!form.privatmiete && '*'}
              </label>
              <input value={form.firma} onChange={e => setForm(f => ({ ...f, firma: e.target.value }))}
                disabled={form.privatmiete}
                className={`w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none ${form.privatmiete ? 'bg-gray-50 text-gray-400' : ''}`} />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.privatmiete} onChange={e => setForm(f => ({ ...f, privatmiete: e.target.checked, firma: e.target.checked ? '' : f.firma }))} className="accent-[#6b7f3e] w-4 h-4" />
                <span className="text-xs text-gray-500">Ich miete privat (ohne Firma)</span>
              </label>
            </div>

            {/* Zeile 2: Anrede + Vorname + Nachname */}
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_1fr] gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anrede *</label>
                <select value={form.anrede} onChange={e => setForm(f => ({ ...f, anrede: e.target.value }))}
                  className="w-full h-[42px] border rounded-xl px-3 text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none bg-white appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                  <option value="">—</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                <input value={form.name.split(' ')[0] || ''} onChange={e => { const last = form.name.split(' ').slice(1).join(' '); setForm(f => ({ ...f, name: e.target.value + (last ? ' ' + last : '') })); }}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                <input value={form.name.split(' ').slice(1).join(' ') || ''} onChange={e => { const first = form.name.split(' ')[0] || ''; setForm(f => ({ ...f, name: first + ' ' + e.target.value })); }}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
            </div>

            {/* Zeile 3: Straße + Hausnummer */}
            <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_120px] gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Straße *</label>
                <input value={form.strasse} onChange={e => setForm(f => ({ ...f, strasse: e.target.value }))}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nr. *</label>
                <input value={form.hausnummer || ''} onChange={e => setForm(f => ({ ...f, hausnummer: e.target.value }))}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
            </div>

            {/* Zeile 4: PLZ + Ort */}
            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PLZ *</label>
                <input value={form.plz} onChange={e => setForm(f => ({ ...f, plz: e.target.value }))}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ort *</label>
                <input value={form.ort} onChange={e => setForm(f => ({ ...f, ort: e.target.value }))}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
            </div>

            {/* Zeile 5: E-Mail + Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))}
                  className="w-full border rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" />
              </div>
            </div>

            {/* Bemerkungen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bemerkungen / Sonderwünsche</label>
              <textarea value={form.bemerkungen} onChange={e => setForm(f => ({ ...f, bemerkungen: e.target.value }))}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] outline-none" rows={3} />
            </div>

            {/* Stornierungsbedingungen */}
            <div className="bg-[#f0f4e8] rounded-xl p-4 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700">Stornierungsbedingungen:</p>
              <p>Bis 7 Tage vor Termin: kostenfreie Stornierung</p>
              <p>3–6 Tage vor Termin: 50 % des Buchungsbetrags</p>
              <p>Weniger als 3 Tage / Nichterscheinen: 100 % des Buchungsbetrags</p>
              <p className="mt-1 text-gray-400">Umbuchungen auf einen anderen Termin sind bis 3 Tage vorher kostenfrei möglich.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agb} onChange={e => setForm(f => ({ ...f, agb: e.target.checked }))} className="mt-1 accent-[#6b7f3e] w-4 h-4" />
              <span className="text-xs text-gray-600 leading-relaxed">
                Ich akzeptiere die <a href="/agb" className="text-[#6b7f3e] underline">AGB</a>, <a href="/datenschutz" className="text-[#6b7f3e] underline">Datenschutzerklärung</a> und die oben genannten Stornierungsbedingungen des bizzcenter.
              </span>
            </label>
          </section>

          {/* ══════ ZUSAMMENFASSUNG UNTEN (nur Mobile) ══════ */}
          <div className="lg:hidden bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-gray-900">Ihre Buchung</h4>

            <div className="flex items-center gap-3">
              <img src={selectedRaum.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-semibold">{selectedRaum.label}</p>
                <p className="text-xs text-gray-500">{selectedRaum.subtitle}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>{dauer === 'tag' ? 'Ganzer Tag' : 'Halber Tag'} · {teilnehmer} {teilnehmer === 1 ? 'Person' : 'Personen'}</p>
            </div>

            {selectedDates.length > 0 ? (
              <>
                <div className="space-y-1 font-mono text-sm">
                  {selectedDates.map(ds => (
                    <div key={ds} className="flex justify-between">
                      <span className="text-gray-600 tabular-nums">{formatDE(ds)}</span>
                      <span className="text-gray-500 tabular-nums text-right min-w-[80px]">EUR {dauer === 'tag' ? selectedRaum.preise.tag : selectedRaum.preise.halberTag},-</span>
                    </div>
                  ))}
                </div>

                {preis.addons > 0 && (
                  <div className="space-y-1">
                    {ADDONS.filter(a => selectedAddons[a.id]).map(a => (
                      <div key={a.id} className="flex justify-between text-sm text-gray-600">
                        <span>{a.label}{a.mitMenge ? ` (${addonMengen[a.id] || 1}×)` : ''}</span>
                        <span>EUR {getAddonPreis(a.id, a) * (a.mitMenge ? (addonMengen[a.id] || 1) : 1) * selectedDates.length},-</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Netto</span>
                    <span>EUR {preis.gesamt},-</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>MwSt. (19%)</span>
                    <span>EUR {(preis.gesamt * 0.19).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#6b7f3e] text-lg pt-1">
                    <span>Gesamt (brutto)</span>
                    <span>EUR {(preis.gesamt * 1.19).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 italic">Wählen Sie ein Datum im Kalender.</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              title={!canSubmit ? 'Bitte füllen Sie Ihre Buchungsdaten aus und akzeptieren Sie die AGB.' : ''}
              className="w-full bg-[#6b7f3e] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#5a6b35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Weiter zur Zahlung...' : 'Jetzt buchen'}
            </button>
          </div>
        </div>

        {/* ── BUCHUNGSÜBERSICHT: Bild links, Warenkorb rechts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Raumbild links */}
          <div>
            <img
              src={selectedRaum.image}
              alt={selectedRaum.label}
              style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', aspectRatio: '4/3' }}
            />
            <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>{selectedRaum.label}</p>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>{selectedRaum.subtitle}</p>
          </div>

          {/* Warenkorb rechts */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-gray-900">Ihre Buchung</h4>

            {/* Dauer, Teilnehmer & Basispreis */}
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>{dauer === 'tag' ? 'Ganzer Tag' : 'Halber Tag'} · {teilnehmer} {teilnehmer === 1 ? 'Person' : 'Personen'}</span>
                <span className="font-semibold text-[#6b7f3e]">EUR {use10er ? (dauer === 'tag' ? selectedRaum.preise.tag10er : selectedRaum.preise.halberTag10er) : (dauer === 'tag' ? selectedRaum.preise.tag : selectedRaum.preise.halberTag)},- <span className="text-xs font-normal text-gray-400">/ Tag</span></span>
              </div>
              {use10er && <p className="text-xs text-[#6b7f3e]">10er-Karte · −15%</p>}
            </div>

            {selectedDates.length > 0 ? (
              <>
                {/* Termine */}
                <div className="space-y-1 font-mono text-sm">
                  {selectedDates.map(ds => (
                    <div key={ds} className="flex justify-between">
                      <span className="text-gray-600 tabular-nums">{formatDE(ds)}</span>
                      <span className="text-gray-500 tabular-nums text-right min-w-[80px]">EUR {dauer === 'tag' ? selectedRaum.preise.tag : selectedRaum.preise.halberTag},-</span>
                    </div>
                  ))}
                </div>

                {/* Add-ons */}
                {preis.addons > 0 && (
                  <div className="space-y-1">
                    {ADDONS.filter(a => selectedAddons[a.id]).map(a => (
                      <div key={a.id} className="flex justify-between text-sm text-gray-600">
                        <span>{a.label}{a.mitMenge ? ` (${addonMengen[a.id] || 1}×)` : ''}</span>
                        <span>EUR {getAddonPreis(a.id, a) * (a.mitMenge ? (addonMengen[a.id] || 1) : 1) * selectedDates.length},-</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gesamt */}
                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Netto</span>
                    <span>EUR {preis.gesamt},-</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>MwSt. (19%)</span>
                    <span>EUR {(preis.gesamt * 0.19).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#6b7f3e] text-lg pt-1">
                    <span>Gesamt (brutto)</span>
                    <span>EUR {(preis.gesamt * 1.19).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 italic">Wählen Sie ein Datum im Kalender.</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              title={!canSubmit ? 'Bitte füllen Sie Ihre Buchungsdaten aus und akzeptieren Sie die AGB.' : ''}
              className="w-full bg-[#6b7f3e] text-white py-3 rounded-xl font-semibold hover:bg-[#5a6b35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Weiter zur Zahlung...' : 'Jetzt buchen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
