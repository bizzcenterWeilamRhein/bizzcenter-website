'use client';

import React, { useState } from 'react';

const ICONS: Record<string, React.ReactNode> = {
  geschaeftsadresse: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
  coworking: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>,
  buero: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  konferenz: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  telefon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
  lager: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
};

const loesungen = [
  { id: 'geschaeftsadresse', label: 'Geschäftsadresse', slug: 'geschaeftsadresse' },
  { id: 'coworking', label: 'Coworking', slug: 'coworking' },
  { id: 'buero', label: 'Büro mieten', slug: 'buero' },
  { id: 'konferenz', label: 'Konferenzraum', slug: 'konferenzraum' },
  { id: 'telefon', label: 'Telefonservice', slug: 'telefonservice' },
  { id: 'lager', label: 'Lagerservice', slug: 'lagerservice' },
];

const postversandOptionen = [
  { id: 'ohne', label: 'Ohne Postversand', beschreibung: 'Post wird vor Ort gesammelt, 24/7 abholbar' },
  { id: 'mit', label: 'Mit Postversand', beschreibung: 'Wöchentliche Weiterleitung an eine Adresse im DACH-Raum' },
];

const tarife: Record<string, { id: string; label: string; price: string; sub: string; popular?: boolean }[]> = {
  geschaeftsadresse: [
    { id: 'langzeit', label: 'Langzeit · 12 Monate', price: 'EUR 49,-', sub: 'pro Monat zzgl. MwSt.', popular: true },
    { id: 'standard', label: 'Standard · 6 Monate', price: 'EUR 69,-', sub: 'pro Monat zzgl. MwSt.' },
    { id: 'flex', label: 'Flex · 3 Monate', price: 'EUR 99,-', sub: 'pro Monat zzgl. MwSt.' },
  ],
  coworking: [
    { id: 'tag', label: 'Tagespass', price: 'EUR 25,-', sub: 'pro Tag zzgl. MwSt.' },
    { id: '10er', label: '10er-Karte', price: 'EUR 209,-', sub: 'zzgl. MwSt.' },
    { id: 'monat', label: 'Monatspass', price: 'EUR 219,-', sub: 'pro Monat zzgl. MwSt.', popular: true },
    { id: 'abo', label: 'Monatsabo', price: 'EUR 199,-', sub: 'pro Monat zzgl. MwSt.' },
  ],
  buero: [
    { id: 'tag', label: 'Tagesbüro', price: 'EUR 59,-', sub: 'pro Tag zzgl. MwSt.' },
    { id: 'monat', label: 'Monatlich', price: 'ab EUR 499,-', sub: 'pro Monat zzgl. MwSt.', popular: true },
  ],
  konferenz: [
    { id: 'stunde', label: 'Stundenweise', price: 'ab EUR 19,-', sub: 'pro Stunde zzgl. MwSt.' },
    { id: 'tag', label: 'Ganztags', price: 'ab EUR 89,-', sub: 'pro Tag zzgl. MwSt.', popular: true },
  ],
  telefon: [
    { id: 'basis', label: 'Basis', price: 'EUR 49,-', sub: 'pro Monat zzgl. MwSt.' },
    { id: 'premium', label: 'Premium', price: 'EUR 99,-', sub: 'pro Monat zzgl. MwSt.', popular: true },
  ],
  lager: [
    { id: 'klein', label: 'Klein', price: 'ab EUR 49,-', sub: 'pro Monat zzgl. MwSt.' },
    { id: 'mittel', label: 'Mittel', price: 'ab EUR 99,-', sub: 'pro Monat zzgl. MwSt.', popular: true },
  ],
};

const allAddons = [
  { id: 'scan', label: 'Scanpaket', price: '+ EUR 49,-/Mon.' },
  { id: 'parkplatz', label: 'Parkplatz', price: '+ EUR 49,-/Mon.' },
  { id: 'kaffee', label: 'Kaffee-Flat', price: '+ EUR 29,-/Mon.' },
  { id: 'schrank', label: 'Aktenschrank', price: '+ EUR 19,-/Mon.' },
  { id: 'monitor', label: '27" Monitor', price: '+ EUR 27,-/Mon.' },
  { id: 'firmenschild', label: 'Firmenschild', price: 'EUR 179,- einmalig' },
];

const addonsByLoesung: Record<string, string[]> = {
  geschaeftsadresse: ['scan', 'parkplatz', 'firmenschild'],
  coworking: ['parkplatz', 'kaffee', 'monitor', 'schrank'],
  buero: ['parkplatz', 'kaffee', 'monitor', 'schrank', 'firmenschild'],
  konferenz: ['parkplatz', 'kaffee'],
  telefon: [],
  lager: [],
};

function StepIndicator({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {labels.map((label, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center gap-1.5 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? 'bg-[#6b7f3e] text-white' 
              : i === step ? 'bg-[#6b7f3e] text-white ring-2 ring-[#6b7f3e]/30' 
              : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : i + 1}
            </div>
            <span className="text-xs font-medium text-foreground hidden sm:inline">{label}</span>
          </div>
          {i < labels.length - 1 && (
            <div className={`w-4 sm:w-8 h-0.5 ${i < step ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function StartFlow({ title = 'So starten Sie' }: { title?: string }) {
  const [step, setStep] = useState(0);
  const [loesung, setLoesung] = useState<string | null>(null);
  const [postversand, setPostversand] = useState<string | null>(null);
  const [tarif, setTarif] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const needsPostversand = loesung === 'geschaeftsadresse';
  const stepLabels = needsPostversand ? ['Lösung', 'Postversand', 'Tarif', 'Add-ons', 'Buchen'] : ['Lösung', 'Tarif', 'Add-ons', 'Buchen'];

  const handleLoesung = (id: string) => {
    setLoesung(id);
    setPostversand(null);
    setTarif(null);
    setSelectedAddons(new Set());
    if (id === 'geschaeftsadresse') {
      setStep(1); // → Postversand-Frage
    } else {
      setStep(1); // → direkt Tarif (step 1 ist Tarif für nicht-Geschäftsadresse)
    }
  };

  const handlePostversand = (id: string) => {
    setPostversand(id);
    setStep(2); // → Tarif
  };

  const handleTarif = (id: string) => {
    setTarif(id);
    setStep(needsPostversand ? 3 : 2); // → Add-ons
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const loesungObj = loesungen.find(l => l.id === loesung);
  const buchungsUrl = loesungObj ? `/${loesungObj.slug}` : '#';

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6">{title}</h2>
        
        <StepIndicator step={step} total={4} labels={stepLabels} />

        <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-8">
          
          {/* Step 0: Lösung wählen */}
          {step === 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Was brauchen Sie?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loesungen.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleLoesung(l.id)}
                    className={`rounded-xl border-2 p-4 text-center transition-all cursor-pointer ${
                      loesung === l.id
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                    }`}
                  >
                    <div className="flex justify-center mb-2 text-[#6b7f3e]">{ICONS[l.id]}</div>
                    <div className="text-xs font-bold text-foreground">{l.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 (nur Geschäftsadresse): Postversand */}
          {step === 1 && needsPostversand && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-4">Wie soll Ihre Post bearbeitet werden?</h3>
              <div className="grid grid-cols-2 gap-3">
                {postversandOptionen.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handlePostversand(opt.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      postversand === opt.id ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm' : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                    }`}
                  >
                    <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.beschreibung}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tarif-Step (Step 1 für nicht-GA, Step 2 für GA) */}
          {((step === 1 && !needsPostversand) || (step === 2 && needsPostversand)) && loesung && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-4">Tarif wählen</h3>
              {needsPostversand && postversand && (
                <p className="text-xs text-muted-foreground mb-3">
                  {postversand === 'mit' ? 'Inkl. Postversand' : 'Ohne Postversand'} · Alle Preise zzgl. MwSt.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {(tarife[loesung] || []).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTarif(t.id)}
                    className={`rounded-xl border-2 p-3 text-center transition-all cursor-pointer relative ${
                      tarif === t.id
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                        : t.popular
                        ? 'border-[#6b7f3e] bg-background ring-1 ring-[#6b7f3e]/30'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                    }`}
                  >
                    {t.popular && tarif !== t.id && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5 whitespace-nowrap">Beliebt</div>
                    )}
                    <div className="text-xs font-semibold text-foreground">{t.label}</div>
                    <div className="text-base font-bold text-[#1e293b] mt-1">{t.price}</div>
                    {t.sub && <div className="text-[10px] text-muted-foreground">{t.sub}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Step */}
          {((step === 2 && !needsPostversand) || (step === 3 && needsPostversand)) && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-1">Optionale Add-ons</h3>
              <p className="text-xs text-muted-foreground mb-4">Nicht verpflichtend — einfach überspringen.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allAddons.filter(a => (loesung && addonsByLoesung[loesung] || []).includes(a.id)).map(a => {
                  const isSelected = selectedAddons.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a.id)}
                      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                          : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-foreground">{a.label}</div>
                      <div className="text-[10px] font-bold text-[#1e293b] mt-0.5">{a.price}</div>
                      <div className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e] opacity-50'}`}>
                        {isSelected ? (
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Gewählt
                          </span>
                        ) : '+ Hinzufügen'}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(needsPostversand ? 4 : 3)}
                className="mt-4 w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Weiter zum Buchen
              </button>
            </div>
          )}

          {/* Zusammenfassung & Buchen */}
          {((step === 3 && !needsPostversand) || (step === 4 && needsPostversand)) && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-4">Ihre Auswahl</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Standort</span>
                  <span className="font-medium">Weil am Rhein</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lösung</span>
                  <span className="font-medium">{loesungObj?.label}</span>
                </div>
                {needsPostversand && postversand && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Postversand</span>
                    <span className="font-medium">{postversand === 'mit' ? 'Inkl. Postversand' : 'Ohne Postversand'}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarif</span>
                  <span className="font-medium">{loesung && tarife[loesung]?.find(t => t.id === tarif)?.label} — {loesung && tarife[loesung]?.find(t => t.id === tarif)?.price}</span>
                </div>
                {selectedAddons.size > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Add-ons</span>
                    <span className="font-medium text-right">{allAddons.filter(a => selectedAddons.has(a.id)).map(a => a.label).join(', ')}</span>
                  </div>
                )}
              </div>
              <a
                href={buchungsUrl}
                className="block w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3.5 text-base font-semibold hover:opacity-90 transition-opacity no-underline shadow-sm"
              >
                Jetzt buchen
              </a>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Sie werden zur Detailseite weitergeleitet.
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
