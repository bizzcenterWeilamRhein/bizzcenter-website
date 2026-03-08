'use client';

import React, { useState, useMemo } from 'react';

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
  service: 'geschaeftsadresse' | 'servicebuero' | 'coworking';
  standort: string;
  adresse: string;
  datum: string;
  gueltigBis: string;
  /** Custom intro text */
  intro?: string;
}

interface Tarif {
  id: string;
  label: string;
  kuendigung: string;
  priceNetto: number;
  priceBrutto: number;
  popular?: boolean;
}

interface Addon {
  id: string;
  label: string;
  priceNetto: number;
  priceBrutto: number;
  unit: string;
  note?: string;
  einmalig?: boolean;
}

/* ───────────────────────── DEFAULT DATA ─────────────────────────── */

const defaultTarife: Record<string, Tarif[]> = {
  geschaeftsadresse: [
    { id: '6mon', label: '6 Monate', kuendigung: '6 Monate zum Quartalsende', priceNetto: 139, priceBrutto: 165.41, popular: false },
    { id: '12mon', label: '12 Monate', kuendigung: '12 Monate zum Quartalsende', priceNetto: 109, priceBrutto: 129.71, popular: true },
    { id: '24mon', label: '24 Monate', kuendigung: '24 Monate zum Quartalsende', priceNetto: 89, priceBrutto: 105.91, popular: false },
  ],
  servicebuero: [
    { id: '6mon', label: '6 Monate', kuendigung: '6 Monate zum Quartalsende', priceNetto: 499, priceBrutto: 593.81, popular: false },
    { id: '12mon', label: '12 Monate', kuendigung: '12 Monate zum Quartalsende', priceNetto: 449, priceBrutto: 534.31, popular: true },
    { id: '24mon', label: '24 Monate', kuendigung: '24 Monate zum Quartalsende', priceNetto: 399, priceBrutto: 474.81, popular: false },
  ],
};

const defaultAddons: Addon[] = [
  { id: 'scanpaket', label: 'Scanpaket', priceNetto: 49, priceBrutto: 58.31, unit: '/Monat', note: 'Wöchentlicher Scan Ihrer Eingangspost' },
  { id: 'coworking-tag', label: 'Coworking Tagespass', priceNetto: 29, priceBrutto: 34.51, unit: '/Tag' },
  { id: 'coworking-flat', label: 'Coworking Flatrate 24/7', priceNetto: 249, priceBrutto: 296.31, unit: '/Monat' },
  { id: 'spind', label: 'Abschließbarer Spind', priceNetto: 19, priceBrutto: 22.61, unit: '/Monat' },
  { id: 'aktenschrank-m', label: 'Aktenschrank (mittel)', priceNetto: 39, priceBrutto: 46.41, unit: '/Monat' },
  { id: 'aktenschrank-g', label: 'Aktenschrank (groß)', priceNetto: 59, priceBrutto: 70.21, unit: '/Monat' },
  { id: 'parkplatz-karte', label: 'Parkkarte Areal', priceNetto: 49, priceBrutto: 58.31, unit: '/Monat' },
  { id: 'parkplatz-fest', label: 'Fester Parkplatz', priceNetto: 79, priceBrutto: 94.01, unit: '/Monat' },
  { id: 'firmenschild', label: 'Firmenschild am Eingang', priceNetto: 179, priceBrutto: 213.01, unit: 'einmalig', einmalig: true },
];

/* ───────────────────────── STEP BADGE ──────────────────────────── */

function StepBadge({ number, done, active }: { number: number; done: boolean; active: boolean }) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors duration-300 ${
      done ? 'bg-[#6b7f3e] text-white' : active ? 'bg-[#6b7f3e] text-white ring-2 ring-[#6b7f3e]/30' : 'bg-[#e8e3d6] text-[#6b7f3e]'
    }`}>
      {done ? '✓' : number}
    </div>
  );
}

/* ───────────────────────── MAIN COMPONENT ──────────────────────── */

export function AngebotFlow({
  angebot,
  tarife,
  addons,
}: {
  angebot: AngebotData;
  tarife?: Tarif[];
  addons?: Addon[];
}) {
  const tarifList = tarife || defaultTarife[angebot.service] || defaultTarife.geschaeftsadresse;
  const addonList = addons || defaultAddons;

  const [step, setStep] = useState(0);
  const [selectedTarif, setSelectedTarif] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  // Form fields
  const [firmenname, setFirmenname] = useState(angebot.firma);
  const [kontakt, setKontakt] = useState(`${angebot.anrede} ${angebot.name}`);
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [agbAccepted, setAgbAccepted] = useState(false);

  const selectedTarifObj = tarifList.find(t => t.id === selectedTarif);

  const { monatlich, einmalig, kaution } = useMemo(() => {
    if (!selectedTarifObj) return { monatlich: 0, einmalig: 0, kaution: 0 };
    let mon = selectedTarifObj.priceBrutto;
    let ein = 0;
    selectedAddons.forEach(id => {
      const addon = addonList.find(a => a.id === id);
      if (!addon) return;
      if (addon.einmalig) ein += addon.priceBrutto;
      else mon += addon.priceBrutto;
    });
    const kaut = Math.round(mon * 3 * 100) / 100;
    return { monatlich: Math.round(mon * 100) / 100, einmalig: Math.round(ein * 100) / 100, kaution: kaut };
  }, [selectedTarif, selectedAddons, selectedTarifObj, addonList]);

  const serviceLabel = angebot.service === 'geschaeftsadresse' ? 'Domiziladresse' : angebot.service === 'servicebuero' ? 'Servicebüro' : 'Coworking';

  const handleTarifSelect = (id: string) => {
    setSelectedTarif(id);
    setStep(1);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatCurrency = (n: number) => `EUR ${n.toFixed(2).replace('.', ',')}`;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* ── Header ── */}
      <div className="bg-[#6b7f3e] text-white py-6 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Persönliches Angebot</p>
              <h1 className="text-xl md:text-2xl font-bold mt-1">{angebot.firma}</h1>
              <p className="text-sm opacity-90 mt-0.5">{serviceLabel} · {angebot.standort}</p>
            </div>
            <div className="text-right text-xs opacity-80">
              <p>Angebot vom {angebot.datum}</p>
              <p>Gültig bis {angebot.gueltigBis}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-6">

        {/* ── Intro ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <p className="text-sm text-muted-foreground">
            {angebot.intro || `${angebot.anrede} ${angebot.name}, vielen Dank für Ihr Interesse am bizzcenter ${angebot.standort}. Wir freuen uns, Ihnen folgendes persönliches Angebot für Ihre ${serviceLabel} zu unterbreiten.`}
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <img src="/images/team/torben-goetz.jpg" alt={angebot.ansprechpartner} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-foreground">{angebot.ansprechpartner}</p>
              <p className="text-xs text-muted-foreground">{angebot.ansprechpartnerTitel} · <a href={`tel:${angebot.ansprechpartnerTel}`} className="text-[#6b7f3e]">{angebot.ansprechpartnerTel}</a></p>
            </div>
          </div>
        </div>

        {/* ── Schritt 1: Paket wählen ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={1} done={!!selectedTarif} active={!selectedTarif} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Laufzeit & Tarif wählen</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Wählen Sie die Kündigungsfrist — je länger, desto günstiger.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tarifList.map(t => {
              const isSelected = selectedTarif === t.id;
              return (
                <button key={t.id} onClick={() => handleTarifSelect(t.id)}
                  className={`rounded-xl border-2 p-4 text-center transition-all cursor-pointer relative ${
                    isSelected ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                    : t.popular ? 'border-[#6b7f3e] bg-white ring-1 ring-[#6b7f3e]/20 hover:bg-[#f0f4e8]'
                    : 'border-border bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                  }`}
                >
                  {t.popular && !isSelected && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5 whitespace-nowrap">Empfohlen ⭐</div>
                  )}
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-2xl font-bold text-[#1e293b] mt-2">{formatCurrency(t.priceNetto)}</div>
                  <div className="text-xs text-muted-foreground">netto /Monat</div>
                  <div className="text-xs text-muted-foreground mt-1">({formatCurrency(t.priceBrutto)} brutto)</div>
                  <div className="text-[10px] text-muted-foreground mt-2">Kündigungsfrist: {t.kuendigung}</div>
                  {isSelected && <div className="text-xs font-medium mt-2 text-[#6b7f3e]">✓ Gewählt</div>}
                </button>
              );
            })}
          </div>
          {selectedTarifObj && (
            <div className="mt-4 text-xs text-muted-foreground bg-[#f5f5f0] rounded-lg p-3">
              <strong>Ihr {serviceLabel}:</strong> {angebot.firma}, {angebot.adresse} · Vollumfängliche Geschäftsadresse (keine c/o-Adresse) · Post-/Paketannahme inklusive
            </div>
          )}
        </div>

        {/* ── Schritt 2: Zusatzleistungen ── */}
        <div className={`rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8 transition-opacity duration-300 ${
          !selectedTarif ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={2} done={step >= 2} active={step === 1} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Zusatzleistungen</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Optional — einfach überspringen wenn nicht benötigt.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {addonList.map(addon => {
              const isSelected = selectedAddons.has(addon.id);
              return (
                <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    isSelected ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm' : 'border-border bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                  }`}
                >
                  <div className="text-xs font-semibold text-foreground">{addon.label}</div>
                  <div className="text-xs font-bold text-[#1e293b] mt-0.5">{formatCurrency(addon.priceNetto)} {addon.unit}</div>
                  <div className="text-[10px] text-muted-foreground">({formatCurrency(addon.priceBrutto)} brutto)</div>
                  {addon.note && <div className="text-[10px] text-muted-foreground mt-1 italic">{addon.note}</div>}
                  <div className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e] opacity-40'}`}>
                    {isSelected ? '✓ Hinzugebucht' : '+ Hinzubuchen'}
                  </div>
                </button>
              );
            })}
          </div>
          {selectedTarif && (
            <button onClick={() => setStep(2)} className="mt-4 w-full rounded-lg bg-[#6b7f3e] text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
              Weiter →
            </button>
          )}
        </div>

        {/* ── Kostenübersicht (live) ── */}
        {selectedTarif && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-white shadow-sm p-5 md:p-8">
            <h2 className="text-lg font-bold text-foreground mb-4">💰 Ihre Kostenübersicht</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{serviceLabel} ({selectedTarifObj?.label})</span>
                <span className="font-semibold">{formatCurrency(selectedTarifObj?.priceBrutto || 0)} /Mon.</span>
              </div>
              {[...selectedAddons].map(id => {
                const addon = addonList.find(a => a.id === id);
                if (!addon) return null;
                return (
                  <div key={id} className="flex justify-between">
                    <span className="text-muted-foreground">{addon.label}</span>
                    <span className="font-semibold">{formatCurrency(addon.priceBrutto)} {addon.unit}</span>
                  </div>
                );
              })}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between font-bold text-base">
                  <span>Monatlich gesamt (brutto)</span>
                  <span className="text-[#6b7f3e]">{formatCurrency(monatlich)}</span>
                </div>
                {einmalig > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Einmalige Kosten</span>
                    <span>{formatCurrency(einmalig)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Kaution (3 Brutto-Monatsmieten)</span>
                  <span>{formatCurrency(kaution)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Einrichtungsgebühr (einmalig)</span>
                  <span>{formatCurrency(236.81)}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Bei Jahresvorauskasse gewähren wir zusätzlich 3% Nachlass.</p>
          </div>
        )}

        {/* ── Schritt 3: Kontaktdaten & Abschluss ── */}
        <div className={`rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8 transition-opacity duration-300 ${
          step < 2 ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={3} done={step >= 3} active={step === 2} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Kontaktdaten & Abschluss</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Firmenangaben für den Vertrag</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Firmenname *</label>
              <input type="text" value={firmenname} onChange={e => setFirmenname(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Ansprechpartner *</label>
                <input type="text" value={kontakt} onChange={e => setKontakt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">E-Mail *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Telefon</label>
              <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="+49..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
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
                Ich akzeptiere die <a href="/agb" className="text-[#6b7f3e] underline">AGB</a> und stimme der Verarbeitung meiner Daten gemäß <a href="/datenschutz" className="text-[#6b7f3e] underline">Datenschutzerklärung</a> zu. *
              </span>
            </label>
          </div>
          <button
            onClick={() => setStep(3)}
            disabled={!firmenname || !kontakt || !email || !agbAccepted}
            className={`mt-5 w-full rounded-lg py-3.5 text-base font-bold transition-all ${
              firmenname && kontakt && email && agbAccepted
                ? 'bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Verbindlich anfragen — {formatCurrency(monatlich)} /Monat
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Sie erhalten eine Bestätigung per E-Mail. Der Vertrag kommt nach Identitätsprüfung und Kautionszahlung zustande.
          </p>
        </div>

        {/* ── Schritt 4: Bestätigung ── */}
        {step >= 3 && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-[#f0f4e8] shadow-sm p-5 md:p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-foreground">Vielen Dank, {kontakt}!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Ihre Anfrage für die {serviceLabel} bei bizzcenter {angebot.standort} ist eingegangen.
              Wir melden uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            <div className="mt-4 p-4 bg-white rounded-lg text-left text-sm max-w-sm mx-auto">
              <p className="font-semibold text-foreground mb-2">Nächste Schritte:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>Bestätigungsmail mit Angebot als PDF</li>
                <li>Identitätsprüfung (Personalausweis)</li>
                <li>Kautionszahlung & Vertragsbeginn</li>
                <li>Willkommenspaket & Zugangsdaten</li>
              </ol>
            </div>
            <div className="mt-5 text-sm">
              <p className="text-muted-foreground">Fragen? Direkt anrufen:</p>
              <a href={`tel:${angebot.ansprechpartnerTel}`} className="text-[#6b7f3e] font-bold text-lg">{angebot.ansprechpartnerTel}</a>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>bizzcenter {angebot.standort} · {angebot.adresse}</p>
          <p className="mt-1">Angebot-ID: {angebot.slug} · Gültig bis {angebot.gueltigBis}</p>
        </div>
      </div>
    </div>
  );
}
