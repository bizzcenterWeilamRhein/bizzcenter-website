'use client';

import React, { useState } from 'react';

interface StepsInteractiveProps {
  standort: string;
}

export function StepsInteractive({ standort }: StepsInteractiveProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [postversand, setPostversand] = useState<'ohne' | 'mit'>('ohne');
  const [email, setEmail] = useState('');
  const [firma, setFirma] = useState('');

  const postversandOptionen = [
    { id: 'ohne' as const, label: 'Ohne Postversand', beschreibung: 'Post wird vor Ort gesammelt, 24/7 abholbar', aufpreis: 0 },
    { id: 'mit' as const, label: 'Mit Postversand', beschreibung: 'Wöchentliche Weiterleitung an eine Adresse im DACH-Raum', aufpreis: 0 },
  ];

  const aufpreis = postversandOptionen.find(p => p.id === postversand)?.aufpreis || 0;

  const steps = [
    {
      number: 1,
      title: 'Postversand',
      subtitle: 'Wie soll Ihre Post bearbeitet werden?',
      content: (
        <div className="space-y-2">
          {postversandOptionen.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setPostversand(opt.id); setActiveStep(1); }}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                postversand === opt.id ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-border hover:border-gray-300'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.beschreibung}</p>
              </div>
              <svg className={`w-5 h-5 flex-shrink-0 ${postversand === opt.id ? 'text-[#6b7f3e]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                {postversand === opt.id ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> : <circle cx="12" cy="12" r="9" />}
              </svg>
            </button>
          ))}
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
              { name: 'Langzeit', laufzeit: '12 Monate', kuendigung: 'zum Quartalsende', basis: 49, popular: true },
              { name: 'Standard', laufzeit: '6 Monate', kuendigung: 'zum Quartalsende', basis: 69 },
              { name: 'Flex', laufzeit: '3 Monate', kuendigung: 'zum Quartalsende', basis: 99 },
            ].map(t => {
              const gesamt = t.basis + aufpreis;
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    const el = document.getElementById('formular');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`rounded-lg border-2 p-3 text-center transition-all cursor-pointer hover:border-[#6b7f3e] hover:bg-[#f0f4e8] ${
                    t.popular ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-border'
                  }`}
                >
                  {t.popular && (
                    <span className="text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">Beliebt</span>
                  )}
                  <p className="font-bold text-foreground mt-1">EUR {gesamt},-</p>
                  <p className="text-[10px] text-muted-foreground">{t.name} · {t.laufzeit}</p>
                  <p className="text-[9px] text-muted-foreground">Kündigung {t.kuendigung}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Alle Preise zzgl. MwSt. · {postversand === 'ohne' ? 'Ohne Postversand' : 'Inkl. Postversand'} · Inkl. Post- & Paketannahme, eigenem Briefkasten
          </p>
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
