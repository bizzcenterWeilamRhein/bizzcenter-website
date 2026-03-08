'use client';

import React, { useState } from 'react';

interface StepsInteractiveProps {
  standort: string;
}

export function StepsInteractive({ standort }: StepsInteractiveProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [firma, setFirma] = useState('');

  const steps = [
    {
      number: 1,
      title: 'Anfrage starten',
      subtitle: 'In 30 Sekunden — kostenlos und unverbindlich',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Geben Sie Ihre E-Mail und Firma ein — wir erstellen Ihnen sofort ein persönliches Angebot.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={firma}
              onChange={e => setFirma(e.target.value)}
              placeholder="Ihre Firma"
              className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Ihre E-Mail"
              className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]"
            />
          </div>
          <button
            onClick={() => {
              if (email || firma) setActiveStep(1);
              else {
                const el = document.getElementById('formular');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full rounded-lg bg-[#6b7f3e] text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {email || firma ? 'Weiter — Paket wählen' : 'Jetzt Angebot anfordern'}
          </button>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Paket wählen',
      subtitle: 'Transparent kalkuliert — keine versteckten Kosten',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Flex', laufzeit: '6 Monate', preis: '139' },
              { name: 'Standard', laufzeit: '12 Monate', preis: '109', popular: true },
              { name: 'Langzeit', laufzeit: '24 Monate', preis: '89' },
            ].map(t => (
              <button
                key={t.name}
                onClick={() => {
                  const params = new URLSearchParams({
                    ...(firma && { firma }),
                    ...(email && { email }),
                  });
                  window.location.href = `/angebot/kunde-xyz?${params.toString()}`;
                }}
                className={`rounded-lg border-2 p-3 text-center transition-all cursor-pointer hover:border-[#6b7f3e] hover:bg-[#f0f4e8] ${
                  t.popular ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-border'
                }`}
              >
                {t.popular && (
                  <span className="text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">Beliebt</span>
                )}
                <p className="font-bold text-foreground mt-1">EUR {t.preis},-</p>
                <p className="text-[10px] text-muted-foreground">{t.name} · {t.laufzeit}</p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">Alle Preise zzgl. MwSt. · Inkl. Post- & Paketannahme, eigenem Briefkasten</p>
        </div>
      ),
    },
    {
      number: 3,
      title: 'Sofort loslegen',
      subtitle: 'Firmenname am Briefkasten — Sie arbeiten von überall',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white border border-border p-3">
              <p className="font-semibold text-foreground">Vertrag digital unterschreiben</p>
              <p className="text-muted-foreground mt-0.5">Direkt online — kein Papier nötig</p>
            </div>
            <div className="rounded-lg bg-white border border-border p-3">
              <p className="font-semibold text-foreground">Ausweis hochladen</p>
              <p className="text-muted-foreground mt-0.5">Per Foto oder Upload — dauert 1 Minute</p>
            </div>
          </div>
          <a
            href="#formular"
            className="block w-full rounded-lg bg-[#6b7f3e] text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity text-center no-underline"
          >
            Jetzt starten
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-lg font-bold text-foreground text-center mb-6">
        In 3 Schritten zu Ihrer Geschäftsadresse
      </h2>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const isActive = activeStep === i;
          const isDone = activeStep > i;

          return (
            <div
              key={i}
              className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm'
                  : isDone
                  ? 'border-[#6b7f3e]/30 bg-white'
                  : 'border-border bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveStep(i)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-[#6b7f3e] text-white'
                    : isActive
                    ? 'bg-[#6b7f3e] text-white'
                    : 'bg-[#e8e3d6] text-[#6b7f3e]'
                }`}>
                  {isDone ? '✓' : step.number}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                </div>
                <span className={`text-[#6b7f3e] transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {isActive && (
                <div className="px-5 pb-5 pt-0">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
