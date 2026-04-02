'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AngebotPrintView } from './AngebotPrintView';

/* ───────────────────────────── TYPES ───────────────────────────── */

interface AngebotData {
  slug: string;
  firma: string;
  anrede: string;
  name: string;
  ansprechpartner: string;
  ansprechpartnerTitel: string;
  ansprechpartnerTel: string;
  ansprechpartnerEmail: string;
  ansprechpartnerBild?: string;
  service: 'geschaeftsadresse' | 'servicebuero' | 'coworking';
  standort: string;
  adresse: string;
  datum: string;
  gueltigBis: string;
  heroImage?: string;
  intro?: string;
}

interface Tarif {
  id: string;
  name: string;
  label: string;
  kuendigung: string;
  priceNetto: number;
  priceBrutto: number;
  popular?: boolean;
}

interface Addon {
  id: string;
  label: string;
  description?: string;
  priceNetto: number;
  priceBrutto: number;
  unit: string;
  note?: string;
  einmalig?: boolean;
  category?: string;
}

interface Review {
  author: string;
  text: string;
  rating: number;
}

/* ───────────────────────── DEFAULT DATA ─────────────────────────── */

const defaultTarife: Record<string, Tarif[]> = {
  geschaeftsadresse: [
    { id: 'langzeit', name: 'Langzeit', label: '24 Monate', kuendigung: '24 Monate zum Quartalsende', priceNetto: 89, priceBrutto: 105.91 },
    { id: 'standard', name: 'Standard', label: '12 Monate', kuendigung: '12 Monate zum Quartalsende', priceNetto: 109, priceBrutto: 129.71, popular: true },
    { id: 'flex', name: 'Flex', label: '6 Monate', kuendigung: '6 Monate zum Quartalsende', priceNetto: 139, priceBrutto: 165.41 },
  ],
  servicebuero: [
    { id: 'flex', name: 'Flex', label: '6 Monate', kuendigung: '6 Monate zum Quartalsende', priceNetto: 499, priceBrutto: 593.81 },
    { id: 'standard', name: 'Standard', label: '12 Monate', kuendigung: '12 Monate zum Quartalsende', priceNetto: 449, priceBrutto: 534.31, popular: true },
    { id: 'langzeit', name: 'Langzeit', label: '24 Monate', kuendigung: '24 Monate zum Quartalsende', priceNetto: 399, priceBrutto: 474.81 },
  ],
};

const addonCategories = [
  { id: 'post', label: 'Post & Digitalisierung' },
  { id: 'coworking', label: 'Coworking & Arbeitsplatz' },
  { id: 'aufbewahrung', label: 'Aufbewahrung' },
  { id: 'parkplatz', label: 'Parken' },
  { id: 'service', label: 'Services & Extras' },
];

const defaultAddons: Addon[] = [
  // Post & Digitalisierung
  { id: 'scanpaket', label: 'Scanpaket', description: 'Ihre Eingangspost wird gescannt und digital per E-Mail zugestellt.', priceNetto: 49, priceBrutto: 58.31, unit: '/Monat', category: 'post' },

  // Coworking & Arbeitsplatz
  { id: 'coworking-flat', label: 'Coworking Flatrate 24/7', description: 'Unbegrenzter Zugang zum Coworking Space, rund um die Uhr.', priceNetto: 219, priceBrutto: 260.61, unit: '/Monat', category: 'coworking' },
  { id: 'coworking-rand', label: 'Coworking Randzeiten', description: 'Zugang außerhalb der Kernzeiten (abends & Wochenende).', priceNetto: 139, priceBrutto: 165.41, unit: '/Monat', category: 'coworking' },

  // Aufbewahrung
  { id: 'spind', label: 'Abschließbarer Spind', description: 'Eigener Spind für Laptop, Unterlagen und persönliche Dinge.', priceNetto: 19, priceBrutto: 22.61, unit: '/Monat', category: 'aufbewahrung' },
  { id: 'aktenschrank-m', label: 'Aktenschrank (mittel)', description: 'Abschließbarer Schrank für Aktenordner und Dokumente.', priceNetto: 27, priceBrutto: 32.13, unit: '/Monat', category: 'aufbewahrung' },
  { id: 'aktenschrank-g', label: 'Aktenschrank (groß)', description: 'Großer abschließbarer Aktenschrank für umfangreiche Ablage.', priceNetto: 47, priceBrutto: 55.93, unit: '/Monat', category: 'aufbewahrung' },

  // Parken
  { id: 'parkplatz-karte', label: 'Parkkarte Areal', description: 'Flexible Parkmöglichkeit auf dem Kesselhaus-Gelände.', priceNetto: 49, priceBrutto: 58.31, unit: '/Monat', category: 'parkplatz' },
  { id: 'parkplatz-fest', label: 'Fester Parkplatz', description: 'Ihr eigener, reservierter Stellplatz direkt am Eingang.', priceNetto: 79, priceBrutto: 94.01, unit: '/Monat', category: 'parkplatz' },

  // Services & Extras
  { id: 'bueroservice', label: 'Büroservice', description: 'Professionelle Unterstützung für Ihre administrativen Aufgaben.', priceNetto: 69, priceBrutto: 82.11, unit: '/Stunde', category: 'service' },
  { id: 'firmenschild', label: 'Firmenschild am Eingang', description: 'Ihr Firmenname am Gebäudeeingang — professioneller erster Eindruck.', priceNetto: 179, priceBrutto: 213.01, unit: 'einmalig', einmalig: true, category: 'service' },
];

const defaultReviews: Review[] = [
  { author: 'veprosa', rating: 5, text: 'Tolles, helles Büro in attraktiver Lage – besser geht es nicht. Wir können das bizzcenter nur wärmstens empfehlen!' },
  { author: 'Katja Falkenburger', rating: 5, text: 'Komfortable Räumlichkeiten und Flexibilität verknüpft mit einer attraktiven, grenznahen Lage zur Schweiz und nach Frankreich.' },
  { author: 'Francesco Petrini', rating: 5, text: 'Very well organized space. Good WiFi network and easy parking. Perfect solution to work in Germany close to Switzerland.' },
];

const inklusivLeistungen = [
  { label: 'Impressumsfähige Adresse', desc: 'Vollumfängliche, ladungsfähige Geschäftsadresse — keine c/o-Adresse. Ihr Firmenname steht allein auf dem Briefkasten.' },
  { label: 'Postannahme', desc: 'Wir nehmen Ihre Geschäftspost zuverlässig in Ihrem Firmennamen entgegen.' },
  { label: 'Paketannahme', desc: 'Pakete werden angenommen und sicher verwahrt — Abholung 24/7 mit eigenem Türcode.' },
  { label: 'Küche & Bio-Kaffee', desc: 'Bei Besuchen vor Ort: Küche, Kaffee und Aufenthaltsraum inklusive.' },
  { label: 'Green Office', desc: 'Moderner, begrünter Arbeitsbereich im historischen Kesselhaus.' },
  { label: 'Business Community', desc: 'Zugang zum bizzcenter-Netzwerk mit regelmäßigen Events.' },
];

/* ───────────────────── RECHTSFORMEN ────────────────────────── */

const rechtsformen = [
  { id: 'gmbh', label: 'GmbH', vertreter: 'Geschäftsführer/in' },
  { id: 'ug', label: 'UG (haftungsbeschränkt)', vertreter: 'Geschäftsführer/in' },
  { id: 'gmbh-co-kg', label: 'GmbH & Co. KG', vertreter: 'Geschäftsführer/in' },
  { id: 'ag', label: 'AG', vertreter: 'Vorstand' },
  { id: 'ek', label: 'e.K.', vertreter: 'Inhaber/in' },
  { id: 'einzelunternehmen', label: 'Einzelunternehmen', vertreter: 'Inhaber/in' },
  { id: 'freiberufler', label: 'Freiberufler/in', vertreter: 'Inhaber/in' },
  { id: 'gbr', label: 'GbR', vertreter: 'Gesellschafter/in' },
  { id: 'ohg', label: 'OHG', vertreter: 'Gesellschafter/in' },
  { id: 'kg', label: 'KG', vertreter: 'Komplementär/in' },
  { id: 'ev', label: 'e.V.', vertreter: 'Vorstand' },
  { id: 'sonstige', label: 'Sonstige', vertreter: 'Vertretungsberechtigte/r' },
];

/* ───────────────────────── HELPER ──────────────────────────── */

function formatCurrency(n: number) {
  // Ganzzahl → EUR 109,- / Dezimal → EUR 109,50
  if (n % 1 === 0) return `EUR ${n.toFixed(0)},-`;
  return `EUR ${n.toFixed(2).replace('.', ',')}`;
}

function daysUntil(dateStr: string): number {
  const [d, m, y] = dateStr.split('.').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function StepBadge({ number, done, active }: { number: number; done: boolean; active: boolean }) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors duration-300 ${
      done ? 'bg-[#6b7f3e] text-white' : active ? 'bg-[#6b7f3e] text-white ring-2 ring-[#6b7f3e]/30' : 'bg-[#e8e3d6] text-[#6b7f3e]'
    }`}>
      {done ? '✓' : number}
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return <span className="text-[#6b7f3e]">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

/* ───────────────────────── MAIN COMPONENT ──────────────────────── */

export function AngebotFlow(props: {
  angebot: AngebotData;
  tarife?: Tarif[];
  addons?: Addon[];
  reviews?: Review[];
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f6] flex items-center justify-center"><p className="text-muted-foreground">Angebot wird geladen...</p></div>}>
      <AngebotFlowInner {...props} />
    </Suspense>
  );
}

function AngebotFlowInner({
  angebot,
  tarife,
  addons,
  reviews,
}: {
  angebot: AngebotData;
  tarife?: Tarif[];
  addons?: Addon[];
  reviews?: Review[];
}) {
  const searchParams = useSearchParams();

  const tarifList = tarife || defaultTarife[angebot.service] || defaultTarife.geschaeftsadresse;
  const addonList = addons || defaultAddons;
  const reviewList = reviews || defaultReviews;

  // URL-Parameter von LeadForm übernehmen
  const paramAnrede = searchParams.get('anrede') || '';
  const paramVorname = searchParams.get('vorname') || '';
  const paramNachname = searchParams.get('nachname') || '';
  const paramFirma = searchParams.get('firma') || '';
  const paramEmail = searchParams.get('email') || '';
  const paramTelefon = searchParams.get('telefon') || '';
  const paramNachricht = searchParams.get('nachricht') || '';
  const paramGclid = searchParams.get('gclid') || '';
  const paramStatus = searchParams.get('status') || ''; // firma | gruendung | freiberufler

  const defaultTarifId = tarifList.find(t => t.popular)?.id || tarifList[0]?.id || null;
  const [step, setStep] = useState(defaultTarifId ? 2 : 0);
  const [selectedTarif, setSelectedTarif] = useState<string | null>(defaultTarifId);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const paramRechtsform = searchParams.get('rechtsform') || '';
  const [firmenname, setFirmenname] = useState(paramFirma || angebot.firma);
  const [rechtsform, setRechtsform] = useState(paramRechtsform);
  const [vertreterAnrede, setVertreterAnrede] = useState(paramAnrede);
  const [vertreterName, setVertreterName] = useState(angebot.name);
  const [kontakt, setKontakt] = useState(paramVorname && paramNachname ? `${paramVorname} ${paramNachname}` : `${angebot.anrede} ${angebot.name}`);
  const [email, setEmail] = useState(paramEmail);
  const [telefon, setTelefon] = useState(paramTelefon);
  const [starttermin, setStarttermin] = useState('');
  const [nachricht, setNachricht] = useState(paramNachricht);
  const [jahresvorauskasse, setJahresvorauskasse] = useState(false);
  const [ansprechpartnerIstZeichnungsberechtigt, setAnsprechpartnerIstZeichnungsberechtigt] = useState(false);
  const [zeichnungsName, setZeichnungsName] = useState('');
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [showVertragsbedingungen, setShowVertragsbedingungen] = useState(false);
  const [openAddonCats, setOpenAddonCats] = useState<Set<string>>(new Set());

  const selectedRechtsform = rechtsformen.find(r => r.id === rechtsform);
  const vertreterLabel = selectedRechtsform?.vertreter || 'Vertretungsberechtigte/r';

  const selectedTarifObj = tarifList.find(t => t.id === selectedTarif);

  // Dynamisches Gültigkeitsdatum: Wenn via HeroForm (URL-Params), immer +30 Tage ab heute
  const isFromHeroForm = !!(paramVorname || paramNachname || paramEmail);
  const effectiveGueltigBis = React.useMemo(() => {
    if (isFromHeroForm) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    return angebot.gueltigBis;
  }, [isFromHeroForm, angebot.gueltigBis]);

  const effectiveDatum = React.useMemo(() => {
    if (isFromHeroForm) {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    return angebot.datum;
  }, [isFromHeroForm, angebot.datum]);

  const remainingDays = daysUntil(effectiveGueltigBis);

  const { monatlich, monatlichNetto, monatlichRabatt, monatlichNettoRabatt, einmalig, kaution, jahresBrutto, jahresNetto } = useMemo(() => {
    if (!selectedTarifObj) return { monatlich: 0, monatlichNetto: 0, monatlichRabatt: 0, monatlichNettoRabatt: 0, einmalig: 0, kaution: 0, jahresBrutto: 0, jahresNetto: 0 };
    let monBrutto = selectedTarifObj.priceBrutto;
    let monNetto = selectedTarifObj.priceNetto;
    let ein = 0;
    selectedAddons.forEach(id => {
      const addon = addonList.find(a => a.id === id);
      if (!addon) return;
      if (addon.einmalig) ein += addon.priceBrutto;
      else { monBrutto += addon.priceBrutto; monNetto += addon.priceNetto; }
    });
    const rabattFaktor = jahresvorauskasse ? 0.9 : 1;
    return {
      monatlich: Math.round(monBrutto * 100) / 100,
      monatlichNetto: Math.round(monNetto * 100) / 100,
      monatlichRabatt: Math.round(monBrutto * rabattFaktor * 100) / 100,
      monatlichNettoRabatt: Math.round(monNetto * rabattFaktor * 100) / 100,
      einmalig: Math.round(ein * 100) / 100,
      kaution: Math.round(monBrutto * rabattFaktor * 3 * 100) / 100,
      jahresBrutto: Math.round(monBrutto * rabattFaktor * 12 * 100) / 100,
      jahresNetto: Math.round(monNetto * rabattFaktor * 12 * 100) / 100,
    };
  }, [selectedTarif, selectedAddons, selectedTarifObj, addonList, jahresvorauskasse]);

  const serviceLabel = 'Geschäftsadresse';

  const handleTarifSelect = (id: string) => {
    setSelectedTarif(id);
    if (step < 2) setStep(2);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAddonCat = (catId: string) => {
    setOpenAddonCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] angebot-print-root">
      {/* ── PRINT VIEW (hidden on screen, shown on print) ── */}
      <AngebotPrintView
        angebot={{ ...angebot, datum: effectiveDatum, gueltigBis: effectiveGueltigBis }}
        selectedTarif={selectedTarifObj || null}
        allTarife={tarifList}
        selectedAddons={selectedAddons}
        addonList={addonList}
        inklusivLeistungen={inklusivLeistungen}
        monatlichNetto={monatlichNetto}
        einmalig={einmalig}
        kaution={kaution}
        jahresvorauskasse={jahresvorauskasse}
        monatlichNettoRabatt={monatlichNettoRabatt}
        firmenname={firmenname}
        rechtsformLabel={selectedRechtsform?.label || ''}
        vertreterName={vertreterName}
        kontakt={kontakt}
        email={email}
      />

      {/* ── SCREEN VIEW ── */}
      <div className="angebot-screen-view">
      {/* ── HERO IMAGE ── */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={angebot.heroImage || '/images/standorte/weil-am-rhein/green-office.jpg'}
          alt={`bizzcenter ${angebot.standort}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <p className="text-white/80 text-sm font-medium">Persönliches Angebot</p>
            <h1 className="text-xl md:text-3xl font-bold text-white mt-1">Ihre neue {serviceLabel}</h1>
            <p className="text-white/90 text-base md:text-xl font-semibold mt-1">{angebot.firma}</p>
            <p className="text-white/70 text-sm mt-0.5">{angebot.adresse.split(', ').map((line, i) => (<span key={i}>{i > 0 && <br />}{line}</span>))}</p>
          </div>
        </div>
      </div>

      {/* ── GÜLTIGKEIT BANNER ── */}
      {remainingDays <= 14 && remainingDays > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4">
          <p className="text-center text-sm font-medium text-amber-800">
            Dieses Angebot ist noch <strong>{remainingDays} {remainingDays === 1 ? 'Tag' : 'Tage'}</strong> gültig — bis {effectiveGueltigBis}
          </p>
        </div>
      )}
      {remainingDays === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 py-4 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-amber-800 mb-3">
              Dieses Angebot ist abgelaufen — Sie können es jederzeit verlängern oder direkt buchen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('refreshed', Date.now().toString());
                  window.location.href = `${window.location.pathname}?${params.toString()}`;
                }}
                className="inline-flex items-center justify-center rounded-lg bg-[#6b7f3e] text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Angebot verlängern
              </button>
              <a
                href={`/${angebot.service === 'geschaeftsadresse' ? 'geschaeftsadresse' : angebot.service}`}
                className="inline-flex items-center justify-center rounded-lg border border-[#6b7f3e] text-[#6b7f3e] bg-white px-5 py-2 text-sm font-semibold hover:bg-[#f0f4e8] transition-colors no-underline"
              >
                Direkt buchen
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-6">

        {/* ── Intro + Ansprechpartner ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {angebot.intro || `${angebot.anrede} ${angebot.name}, vielen Dank für Ihr Interesse am bizzcenter ${angebot.standort}. Wir freuen uns, Ihnen folgendes persönliches Angebot für Ihre ${serviceLabel} zu unterbreiten.`}
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            {angebot.ansprechpartnerBild ? (
              <img src={angebot.ansprechpartnerBild} alt={angebot.ansprechpartner} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#e3e7d4] flex items-center justify-center text-[#6b7f3e] font-bold text-sm">
                {angebot.ansprechpartner.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{angebot.ansprechpartner}</p>
              <p className="text-xs text-muted-foreground">{angebot.ansprechpartnerTitel} · <a href={`tel:${angebot.ansprechpartnerTel}`} className="text-[#6b7f3e]">{angebot.ansprechpartnerTel}</a></p>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
            <span>Angebot vom {effectiveDatum}</span>
            <span>Gültig bis {effectiveGueltigBis}</span>
          </div>
        </div>

        {/* ── SCHRITT 1: Tarif wählen ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={1} done={!!selectedTarif} active={!selectedTarif} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Tarif wählen</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Je länger die Laufzeit, desto günstiger Ihr Monatspreis.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            {tarifList.map(t => {
              const isSelected = selectedTarif === t.id;
              return (
                <button key={t.id} onClick={() => handleTarifSelect(t.id)}
                  className={`rounded-xl border-2 text-center transition-all cursor-pointer relative ${
                    isSelected ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-md scale-[1.02] p-4'
                    : t.popular ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm p-5 ring-2 ring-[#6b7f3e]/30'
                    : 'border-border bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm p-4'
                  }`}
                >
                  {t.popular && !isSelected && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold bg-[#6b7f3e] text-white rounded-full px-3 py-1 whitespace-nowrap shadow-sm">Beliebteste Wahl</div>
                  )}
                  {isSelected && t.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold bg-[#6b7f3e] text-white rounded-full px-3 py-1 whitespace-nowrap shadow-sm">Beliebteste Wahl</div>
                  )}
                  <div className={`font-bold ${t.popular ? 'text-lg text-[#6b7f3e]' : 'text-base text-[#6b7f3e]'}`}>{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.label} Laufzeit</div>
                  <div className={`font-bold text-[#1e293b] mt-3 ${t.popular ? 'text-3xl' : 'text-2xl'}`}>{formatCurrency(t.priceNetto)}</div>
                  <div className="text-[11px] text-muted-foreground">/Monat zzgl. MwSt.</div>
                  {isSelected && <div className="text-xs font-semibold mt-2 text-[#6b7f3e]">✓ Gewählt</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── WAS IST INKLUSIVE ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Das ist in Ihrer {serviceLabel} inklusive</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {inklusivLeistungen.map((l, i) => (
              <div key={i} className="rounded-lg bg-[#f5f5f0] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#6b7f3e] flex items-center justify-center text-white text-xs font-bold shrink-0">✓</div>
                  <div className="text-xs font-semibold text-foreground">{l.label}</div>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{l.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground bg-[#f0f4e8] rounded-lg p-3">
            <strong>Ihre Adresse:</strong> {angebot.firma}, {angebot.adresse}
          </div>
        </div>

        {/* ── SOCIAL PROOF ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Das sagen unsere Kunden</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {reviewList.map((r, i) => (
              <div key={i} className="rounded-lg bg-[#f5f5f0] p-4">
                <Stars count={r.rating} />
                <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">"{r.text}"</p>
                <p className="text-xs font-semibold text-foreground mt-2">— {r.author}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            4,8 ★ Durchschnitt aus über 50 Google-Bewertungen
          </p>
        </div>

        {/* ── SCHRITT 2: Zusatzleistungen ── */}
        <div className={`rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8 transition-opacity duration-300 ${
          !selectedTarif ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={2} done={step >= 2} active={step === 1} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Zusatzleistungen</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Optional — überspringen wenn nicht benötigt.</p>
            </div>
          </div>
          <div className="space-y-2">
            {addonCategories.map(cat => {
              const catAddons = addonList.filter(a => a.category === cat.id);
              if (catAddons.length === 0) return null;
              const isOpen = openAddonCats.has(cat.id);
              const selectedCount = catAddons.filter(a => selectedAddons.has(a.id)).length;
              return (
                <div key={cat.id} className="rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAddonCat(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f0] hover:bg-[#eeeee6] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                      <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                      {selectedCount > 0 && (
                        <span className="text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5">{selectedCount}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{catAddons.length} {catAddons.length === 1 ? 'Option' : 'Optionen'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {catAddons.map(addon => {
                        const isSelected = selectedAddons.has(addon.id);
                        return (
                          <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                              isSelected ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm' : 'border-border bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                            }`}
                          >
                            <div className="text-xs font-semibold text-foreground leading-tight">{addon.label}</div>
                            {addon.description && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{addon.description}</div>
                            )}
                            <div className="text-xs font-bold text-[#1e293b] mt-1.5">{formatCurrency(addon.priceNetto)} {addon.unit}</div>
                            <div className="text-[9px] text-muted-foreground">zzgl. MwSt.</div>
                            <div className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e] opacity-40'}`}>
                              {isSelected ? '✓ Hinzugebucht' : '+ Hinzubuchen'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* ── KOSTENÜBERSICHT (live) ── */}
        {selectedTarif && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-white shadow-sm p-5 md:p-8" id="kosten">
            <h2 className="text-lg font-bold text-foreground mb-4">Ihre Kostenübersicht</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{serviceLabel} — Tarif {selectedTarifObj?.name} ({selectedTarifObj?.label})</span>
                <span className={`font-semibold ${jahresvorauskasse ? 'line-through text-muted-foreground/50' : ''}`}>{formatCurrency(selectedTarifObj?.priceNetto || 0)} /Mon.</span>
              </div>
              {[...selectedAddons].map(id => {
                const addon = addonList.find(a => a.id === id);
                if (!addon) return null;
                return (
                  <div key={id} className="flex justify-between">
                    <span className="text-muted-foreground">{addon.label}</span>
                    <span className={`font-semibold ${jahresvorauskasse && !addon.einmalig ? 'line-through text-muted-foreground/50' : ''}`}>{formatCurrency(addon.priceNetto)} {addon.unit}</span>
                  </div>
                );
              })}

              {/* Jahresvorauskasse Option */}
              <div className="border-t border-border pt-3 mt-3">
                <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 hover:bg-[#f0f4e8] transition-colors">
                  <input type="checkbox" checked={jahresvorauskasse} onChange={e => setJahresvorauskasse(e.target.checked)}
                    className="accent-[#6b7f3e] w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground">Jahresvorauskasse</span>
                    <span className="ml-2 text-xs font-bold text-[#6b7f3e] bg-[#e3e7d4] rounded-full px-2 py-0.5">−10% Rabatt</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Zahlung der monatlichen Kosten für 12 Monate im Voraus.</p>
                  </div>
                </label>
              </div>

              <table className="w-full border-t border-border mt-3 pt-3" style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  {jahresvorauskasse ? (
                    <>
                      <tr>
                        <td className="py-1 text-xs text-muted-foreground">Regulär monatlich</td>
                        <td className="py-1 text-xs text-muted-foreground text-right line-through">{formatCurrency(monatlichNetto)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-sm font-bold text-foreground">Monatlich mit 10% Rabatt</td>
                        <td className="py-1 text-sm font-bold text-[#6b7f3e] text-right">{formatCurrency(monatlichNettoRabatt)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-sm font-semibold text-foreground">Jahresbetrag</td>
                        <td className="py-1 text-sm font-semibold text-[#6b7f3e] text-right">{formatCurrency(jahresNetto)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-xs text-[#6b7f3e] font-medium">Ihre Ersparnis pro Jahr</td>
                        <td className="py-1 text-xs text-[#6b7f3e] font-medium text-right">{formatCurrency(monatlichNetto * 12 - jahresNetto)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="py-1 text-sm font-bold text-foreground">Monatlich</td>
                      <td className="py-1 text-sm font-bold text-[#6b7f3e] text-right">{formatCurrency(monatlichNetto)}</td>
                    </tr>
                  )}
                  {einmalig > 0 && (
                    <tr className="border-t border-dashed border-border">
                      <td className="pt-2 text-sm text-muted-foreground">Einmalige Zusatzkosten</td>
                      <td className="pt-2 text-sm text-right">{formatCurrency(einmalig)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Alle Preise zzgl. 19% MwSt.{jahresvorauskasse ? ' · 10% Rabatt bei Jahresvorauskasse bereits eingerechnet.' : ''}
              {' '}· Einrichtungsgebühr (EUR 199,-) und Kaution (3 Brutto-Monatsmieten) werden nach Vertragsunterzeichnung separat in Rechnung gestellt.
            </p>
          </div>
        )}

        {/* ── VERTRAGSBEDINGUNGEN (aufklappbar) ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <button
            type="button"
            onClick={() => setShowVertragsbedingungen(!showVertragsbedingungen)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7f3e] hover:text-[#5a6b35] transition-colors cursor-pointer"
          >
            <span className={`transition-transform duration-200 text-xs ${showVertragsbedingungen ? 'rotate-90' : ''}`}>▶</span>
            Vertragsbedingungen einsehen
          </button>
          {showVertragsbedingungen && (
            <div className="mt-3 rounded-lg bg-[#f5f5f0] p-5 text-sm text-muted-foreground space-y-4 leading-relaxed max-h-[70vh] overflow-y-auto">
              <h4 className="font-bold text-foreground text-sm">Vertragsbedingungen Geschäftsadresse</h4>
              <div><p className="font-semibold text-foreground">1. Vertragsgegenstand</p><p>Die bizzcenter Weil am Rhein GmbH stellt dem Kunden eine vollumfängliche, impressumsfähige Geschäftsadresse am Standort Am Kesselhaus 3, 79576 Weil am Rhein zur Verfügung. Die Adresse darf für Gewerbeanmeldung, Handelsregister, Impressum und Geschäftsverkehr verwendet werden.</p></div>
              <div><p className="font-semibold text-foreground">2. Leistungsumfang</p><p>Im Basispaket enthalten: Post- und Paketannahme, eigener Briefkasten mit Firmenbeschriftung, Nutzung der Adresse für alle geschäftlichen Zwecke. Zusatzleistungen werden gesondert vereinbart.</p></div>
              <div><p className="font-semibold text-foreground">3. Vertragslaufzeit & Kündigung</p><p>Die Mindestvertragslaufzeit beträgt {selectedTarifObj?.label || 'die gewählte Laufzeit'}. Kündigungsfrist: {selectedTarifObj?.kuendigung || 'gemäß Tarif'}. Automatische Verlängerung bei nicht fristgerechter Kündigung.</p></div>
              <div><p className="font-semibold text-foreground">4. Zahlungsbedingungen</p><p>Monatliche Vorauszahlung zum 1. des Monats. Bei Jahresvorauskasse 10% Rabatt. Alle Preise zzgl. 19% MwSt.</p></div>
              <div><p className="font-semibold text-foreground">5. Kaution</p><p>Drei Brutto-Monatsmieten, unverzinst. Wird nach Vertragsunterzeichnung separat in Rechnung gestellt. Rückerstattung nach Vertragsende und ordnungsgemäßer Abwicklung.</p></div>
              <div><p className="font-semibold text-foreground">6. Einrichtungsgebühr</p><p>Einmalig EUR 199,- zzgl. MwSt. Wird nach Vertragsunterzeichnung separat in Rechnung gestellt.</p></div>
              <div><p className="font-semibold text-foreground">7. Postbearbeitung</p><p>Post und Pakete werden entgegengenommen und sicher verwahrt. Weiterleitung und Scan-Services separat zubuchbar.</p></div>
              <div><p className="font-semibold text-foreground">8. Nutzungsbedingungen</p><p>Ausschließlich legale gewerbliche Nutzung. Fristlose Kündigung bei Missbrauch vorbehalten.</p></div>
              <div><p className="font-semibold text-foreground">9. Haftung</p><p>Haftung für Post/Pakete nur bei grober Fahrlässigkeit oder Vorsatz, max. EUR 500.</p></div>
              <div><p className="font-semibold text-foreground">10. Datenschutz</p><p>Verarbeitung gemäß DSGVO, ausschließlich zur Vertragsabwicklung.</p></div>
              <div><p className="font-semibold text-foreground">11. Schlussbestimmungen</p><p>Es gilt deutsches Recht. Gerichtsstand: Lörrach. Schriftformerfordernis für Änderungen.</p></div>
              <p className="text-[10px] italic mt-2">Stand: März 2026 · bizzcenter Weil am Rhein GmbH, Im Schwarzenbach 4, 79576 Weil am Rhein</p>
            </div>
          )}
        </div>

        {/* ── SCHRITT 3: Kontaktdaten & Abschluss ── */}
        <div className={`rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8 transition-opacity duration-300 ${
          step < 2 ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={3} done={step >= 3} active={step === 2} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Kontaktdaten & Abschluss</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Ihre Firmenangaben für den Vertrag</p>
            </div>
          </div>
          <div className="space-y-3">
            {/* Firmendaten */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Firmenname *</label>
                <input type="text" value={firmenname} onChange={e => setFirmenname(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Rechtsform *</label>
                <select value={rechtsform} onChange={e => setRechtsform(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Bitte wählen...</option>
                  {rechtsformen.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vertretungsberechtigter — nur Name */}
            {rechtsform && (
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{vertreterLabel} (Name) *</label>
                <input type="text" value={vertreterName} onChange={e => setVertreterName(e.target.value)}
                  placeholder={`Name des ${vertreterLabel}s`}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            )}

            {/* Starttermin */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                Gewünschter Starttermin *
                <span className="relative group">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6b7f3e] text-white text-[10px] font-bold cursor-help">i</span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-56 bg-[#1e293b] text-white text-[10px] leading-tight rounded-lg px-3 py-2 shadow-lg z-10">
                    Der Starttermin muss zwingend vor dem Notartermin der Gründung oder Sitzverlegung liegen.
                  </span>
                </span>
              </label>
              <input type="date" value={starttermin} onChange={e => setStarttermin(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>

            {/* Kontaktdaten */}
            <div className="border-t border-border pt-3 mt-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Kontaktdaten</p>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Anrede *</label>
                <select value={vertreterAnrede} onChange={e => setVertreterAnrede(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Bitte...</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Herr Dr.">Herr Dr.</option>
                  <option value="Frau Dr.">Frau Dr.</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Vorname, Name *</label>
                <input type="text" value={kontakt} onChange={e => setKontakt(e.target.value)}
                  placeholder="Name des Geschäftsführers"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">E-Mail *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Telefon</label>
                <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="+49..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            </div>

            {/* Zeichnungsberechtigung */}
            <div className="border-t border-border pt-3 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ansprechpartnerIstZeichnungsberechtigt} onChange={e => setAnsprechpartnerIstZeichnungsberechtigt(e.target.checked)}
                  className="accent-[#6b7f3e]" />
                <span className="text-xs font-medium text-foreground">Ansprechpartner entspricht zeichnungsberechtigter Person</span>
              </label>
              {!ansprechpartnerIstZeichnungsberechtigt && (
                <div className="mt-3 rounded-lg bg-[#f5f5f0] p-3 space-y-2">
                  <p className="text-[10px] text-muted-foreground">Der Vertrag muss von einer zeichnungsberechtigten Person unterzeichnet werden.</p>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Name der zeichnungsberechtigten Person *</label>
                    <input type="text" value={zeichnungsName} onChange={e => setZeichnungsName(e.target.value)}
                      placeholder={rechtsform ? `Name des ${vertreterLabel}s` : 'Vor- und Nachname'}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Nachricht (optional)</label>
              <textarea value={nachricht} onChange={e => setNachricht(e.target.value)} rows={2} placeholder="Fragen oder Anmerkungen..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] resize-none" />
            </div>
            <label className="flex items-start gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={agbAccepted} onChange={e => setAgbAccepted(e.target.checked)}
                className="mt-0.5 accent-[#6b7f3e]" />
              <span className="text-xs text-muted-foreground">
                Ich akzeptiere die <a href="/agb" className="text-[#6b7f3e] underline">AGB</a> und <button type="button" onClick={() => setShowVertragsbedingungen(true)} className="text-[#6b7f3e] underline cursor-pointer">Vertragsbedingungen</button> und stimme der Verarbeitung meiner Daten gemäß <a href="/datenschutz" className="text-[#6b7f3e] underline">Datenschutzerklärung</a> zu. *
              </span>
            </label>
          </div>
          {(() => {
            const allFilled = !!(firmenname && rechtsform && vertreterAnrede && vertreterName && starttermin && kontakt && email && agbAccepted && (ansprechpartnerIstZeichnungsberechtigt || zeichnungsName));
            return (
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    // Lead im Hintergrund speichern (fire-and-forget)
                    fetch('/api/lead', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        firma: firmenname,
                        rechtsform,
                        name: kontakt,
                        email,
                        telefon,
                        tarif: selectedTarifObj?.name,
                        quelle: 'angebot-vertrag',
                        timestamp: new Date().toISOString(),
                      }),
                    }).catch(() => {});
                    const gclidParam = paramGclid ? `?gclid=${paramGclid}` : '';
                    window.location.href = `/vertrag/${angebot.slug}${gclidParam}`;
                  }}
                  disabled={!allFilled}
                  className={`flex-1 rounded-lg py-3.5 text-base font-bold transition-all ${
                    allFilled
                      ? 'bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Vertrag vervollständigen
                </button>
                <button
                  onClick={async () => {
                    const el = document.querySelector('.angebot-print-view') as HTMLElement;
                    if (el) {
                      el.style.display = 'block';
                      const html2pdf = (await import('html2pdf.js')).default;
                      await (html2pdf() as any).set({
                        margin: [15, 20, 22, 20],
                        filename: `Angebot_Geschaeftsadresse_${firmenname || angebot.firma}.pdf`,
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: { scale: 2, useCORS: true, logging: false },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['css', 'legacy'], before: '.page-break' },
                      }).from(el).save();
                      el.style.display = 'none';
                    } else {
                      window.print();
                    }
                  }}
                  className="flex-1 rounded-lg py-3.5 text-base font-bold border border-border bg-white text-foreground hover:bg-[#f5f5f0] transition-all shadow-sm"
                >
                  Angebot als PDF speichern
                </button>
              </div>
            );
          })()}
          {!(firmenname && rechtsform && vertreterAnrede && vertreterName && starttermin && kontakt && email && agbAccepted && (ansprechpartnerIstZeichnungsberechtigt || zeichnungsName)) && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Bitte füllen Sie alle Pflichtfelder aus, um den Vertrag zu erstellen.
            </p>
          )}
        </div>

        {/* ── Bestätigung ── */}
        {step >= 3 && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-[#f0f4e8] shadow-sm p-5 md:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#6b7f3e] flex items-center justify-center text-white text-2xl font-bold mb-3">✓</div>
            <h2 className="text-xl font-bold text-foreground">Fast geschafft, {kontakt}!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Ihr Angebot für die {serviceLabel} bei bizzcenter {angebot.standort} ist erstellt.
              Im nächsten Schritt können Sie den Vertrag direkt online unterschreiben.
            </p>
            <div className="mt-4 p-4 bg-white rounded-lg text-left text-sm max-w-sm mx-auto">
              <p className="font-semibold text-foreground mb-2">So geht’s weiter:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>Vertrag online prüfen und unterschreiben</li>
                <li>Dokumente hochladen (Ausweis, Handelsregister etc.)</li>
                <li>Zahlungsmethode über Stripe hinterlegen</li>
                <li>Ihre Geschäftsadresse wird zum Starttermin aktiviert</li>
              </ol>
            </div>
            <a
              href={`/vertrag/${angebot.slug}${paramGclid ? `?gclid=${paramGclid}` : ''}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6b7f3e] text-white px-8 py-3.5 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm no-underline"
            >
              Jetzt Vertrag unterschreiben
            </a>
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">Fragen? Direkt anrufen:</p>
              <a href={`tel:${angebot.ansprechpartnerTel}`} className="text-[#6b7f3e] font-bold text-lg">{angebot.ansprechpartnerTel}</a>
            </div>
          </div>
        )}

        {/* ── PDF Download + Vertrag Link ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {firmenname && rechtsform && starttermin && kontakt && email ? (
            <a
              href={`/vertrag/${angebot.slug}${paramGclid ? `?gclid=${paramGclid}` : ''}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6b7f3e] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm no-underline"
            >
              Vollständigen Vertrag ansehen
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg bg-gray-200 text-gray-400 px-5 py-2.5 text-sm font-semibold cursor-not-allowed">
              Vollständigen Vertrag ansehen
              <span className="text-[10px] font-normal">(Daten oben ausfüllen)</span>
            </span>
          )}
          <button
            onClick={async () => {
              const el = document.querySelector('.angebot-print-view') as HTMLElement;
              if (!el) return;
              el.style.display = 'block';
              const html2pdf = (await import('html2pdf.js')).default;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await html2pdf().set({
                margin: [15, 20, 22, 20],
                filename: `Angebot_Geschaeftsadresse_${firmenname || angebot.firma}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], before: '.page-break' },
              } as any).from(el).save();
              el.style.display = 'none';
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-[#f5f5f0] transition-colors shadow-sm"
          >
            Angebot als PDF speichern
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>Angebot-ID: {angebot.slug} · Erstellt am {effectiveDatum} · Gültig bis {effectiveGueltigBis}</p>
        </div>
      </div>

      {/* ── STICKY PREISBAR (Mobile) ── */}
      {selectedTarif && step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg z-50 px-4 py-3">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Monatlich gesamt</div>
              <div className="text-lg font-bold text-[#6b7f3e]">{formatCurrency(jahresvorauskasse ? monatlichNettoRabatt : monatlichNetto)}</div>
              <div className="text-[10px] text-muted-foreground">zzgl. MwSt. · Tarif {selectedTarifObj?.name}{jahresvorauskasse ? ' · −10%' : ''}</div>
            </div>
            <a
              href="#kosten"
              className="rounded-lg bg-[#6b7f3e] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
            >
              Details →
            </a>
          </div>
        </div>
      )}
      </div>{/* /angebot-screen-view */}
    </div>
  );
}
