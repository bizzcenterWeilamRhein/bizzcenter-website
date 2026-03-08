'use client';

import React, { useState } from 'react';

const standorte = [
  { id: 'weil', label: 'Weil am Rhein', sub: 'Dreiländereck Basel' },
  { id: 'konstanz', label: 'Konstanz', sub: 'Bodensee' },
];

const loesungen: Record<string, { id: string; label: string; icon: string; slug: string }[]> = {
  weil: [
    { id: 'geschaeftsadresse', label: 'Geschäftsadresse', icon: '📍', slug: 'geschaeftsadresse' },
    { id: 'coworking', label: 'Coworking', icon: '💻', slug: 'coworking' },
    { id: 'buero', label: 'Büro mieten', icon: '🏢', slug: 'buero' },
    { id: 'konferenz', label: 'Konferenzraum', icon: '🎤', slug: 'konferenzraeume' },
    { id: 'telefon', label: 'Telefonservice', icon: '📞', slug: 'telefonservice' },
    { id: 'lager', label: 'Lagerservice', icon: '📦', slug: 'lagerservice' },
  ],
  konstanz: [
    { id: 'geschaeftsadresse', label: 'Geschäftsadresse', icon: '📍', slug: 'geschaeftsadresse' },
    { id: 'coworking', label: 'Coworking', icon: '💻', slug: 'coworking' },
    { id: 'buero', label: 'Büro mieten', icon: '🏢', slug: 'buero' },
    { id: 'konferenz', label: 'Konferenzraum', icon: '🎤', slug: 'konferenzraeume' },
    { id: 'telefon', label: 'Telefonservice', icon: '📞', slug: 'telefonservice' },
  ],
};

const tarife: Record<string, { id: string; label: string; price: string; sub: string; popular?: boolean }[]> = {
  geschaeftsadresse: [
    { id: '6mon', label: '6 Monate', price: 'EUR 139,-', sub: 'pro Monat' },
    { id: '12mon', label: '12 Monate', price: 'EUR 109,-', sub: 'pro Monat', popular: true },
    { id: '24mon', label: '24 Monate', price: 'EUR 89,-', sub: 'pro Monat' },
  ],
  coworking: [
    { id: 'tag', label: 'Tagespass', price: 'EUR 29,-', sub: 'pro Tag' },
    { id: '10er', label: '10er-Karte', price: 'EUR 249,-', sub: '' },
    { id: 'monat', label: 'Monatspass', price: 'EUR 259,-', sub: 'pro Monat', popular: true },
    { id: 'abo', label: 'Monatsabo', price: 'EUR 239,-', sub: 'pro Monat' },
  ],
  buero: [
    { id: 'tag', label: 'Tagesbüro', price: 'EUR 59,-', sub: 'pro Tag' },
    { id: 'monat', label: 'Monatlich', price: 'ab EUR 499,-', sub: 'pro Monat', popular: true },
  ],
  konferenz: [
    { id: 'stunde', label: 'Stundenweise', price: 'ab EUR 29,-', sub: 'pro Stunde' },
    { id: 'tag', label: 'Ganztags', price: 'ab EUR 149,-', sub: 'pro Tag', popular: true },
  ],
  telefon: [
    { id: 'basis', label: 'Basis', price: 'EUR 49,-', sub: 'pro Monat' },
    { id: 'premium', label: 'Premium', price: 'EUR 99,-', sub: 'pro Monat', popular: true },
  ],
  lager: [
    { id: 'klein', label: 'Klein', price: 'ab EUR 49,-', sub: 'pro Monat' },
    { id: 'mittel', label: 'Mittel', price: 'ab EUR 99,-', sub: 'pro Monat', popular: true },
  ],
};

const addons = [
  { id: 'scan', label: 'Scanpaket', price: '+ EUR 49,-/Mon.' },
  { id: 'parkplatz', label: 'Parkplatz', price: '+ EUR 49,-/Mon.' },
  { id: 'kaffee', label: 'Kaffee-Flat', price: '+ EUR 29,-/Mon.' },
  { id: 'schrank', label: 'Aktenschrank', price: '+ EUR 19,-/Mon.' },
  { id: 'monitor', label: '27" Monitor', price: '+ EUR 27,-/Mon.' },
  { id: 'firmenschild', label: 'Firmenschild', price: 'EUR 179,- einmalig' },
];

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
              {i < step ? '✓' : i + 1}
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
  const [standort, setStandort] = useState<string | null>(null);
  const [loesung, setLoesung] = useState<string | null>(null);
  const [tarif, setTarif] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const stepLabels = ['Standort', 'Lösung', 'Tarif', 'Add-ons', 'Buchen'];

  const handleStandort = (id: string) => {
    setStandort(id);
    setLoesung(null);
    setTarif(null);
    setSelectedAddons(new Set());
    setStep(1);
  };

  const handleLoesung = (id: string) => {
    setLoesung(id);
    setTarif(null);
    setSelectedAddons(new Set());
    setStep(2);
  };

  const handleTarif = (id: string) => {
    setTarif(id);
    setStep(3);
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

  const standortSlug = standort === 'weil' ? 'weil-am-rhein' : 'konstanz';
  const loesungObj = standort ? loesungen[standort]?.find(l => l.id === loesung) : null;
  const buchungsUrl = loesungObj ? `/${standortSlug}/${loesungObj.slug}` : '#';

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6">{title}</h2>
        
        <StepIndicator step={step} total={5} labels={stepLabels} />

        <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-8">
          
          {/* Step 0: Standort */}
          {step === 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Wo möchten Sie arbeiten?</h3>
              <div className="grid grid-cols-2 gap-3">
                {standorte.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleStandort(s.id)}
                    className={`rounded-xl border-2 p-4 text-center transition-all cursor-pointer ${
                      standort === s.id
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                    }`}
                  >
                    <div className="text-2xl mb-1">📍</div>
                    <div className="text-sm font-bold text-foreground">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Lösung */}
          {step === 1 && standort && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                ← Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-4">Was brauchen Sie?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loesungen[standort].map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleLoesung(l.id)}
                    className={`rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                      loesung === l.id
                        ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm'
                        : 'border-border bg-background hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                    }`}
                  >
                    <div className="text-xl mb-1">{l.icon}</div>
                    <div className="text-xs font-bold text-foreground">{l.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Tarif */}
          {step === 2 && loesung && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                ← Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-4">Tarif wählen</h3>
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
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5 whitespace-nowrap">Beliebt ⭐</div>
                    )}
                    <div className="text-xs font-semibold text-foreground">{t.label}</div>
                    <div className="text-base font-bold text-[#1e293b] mt-1">{t.price}</div>
                    {t.sub && <div className="text-[10px] text-muted-foreground">{t.sub}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Add-ons */}
          {step === 3 && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                ← Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-1">Optionale Add-ons</h3>
              <p className="text-xs text-muted-foreground mb-4">Nicht verpflichtend — einfach überspringen.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {addons.map(a => {
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
                        {isSelected ? '✓ Gewählt' : '+ Hinzufügen'}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(4)}
                className="mt-4 w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Weiter zum Buchen →
              </button>
            </div>
          )}

          {/* Step 4: Zusammenfassung & Buchen */}
          {step === 4 && (
            <div>
              <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
                ← Zurück
              </button>
              <h3 className="text-lg font-bold text-foreground mb-4">Ihre Auswahl</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Standort</span>
                  <span className="font-medium">{standorte.find(s => s.id === standort)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lösung</span>
                  <span className="font-medium">{standort && loesungen[standort]?.find(l => l.id === loesung)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarif</span>
                  <span className="font-medium">{loesung && tarife[loesung]?.find(t => t.id === tarif)?.label} — {loesung && tarife[loesung]?.find(t => t.id === tarif)?.price}</span>
                </div>
                {selectedAddons.size > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Add-ons</span>
                    <span className="font-medium text-right">{addons.filter(a => selectedAddons.has(a.id)).map(a => a.label).join(', ')}</span>
                  </div>
                )}
              </div>
              <a
                href={buchungsUrl}
                className="block w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3.5 text-base font-semibold hover:opacity-90 transition-opacity no-underline shadow-sm"
              >
                Jetzt buchen →
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
