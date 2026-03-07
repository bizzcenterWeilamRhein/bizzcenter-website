'use client';

import React from 'react';

interface CompactHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  buttonText?: string;
  buttonHref?: string;
  formId?: string;
  children?: React.ReactNode;
}

export function CompactHero({ title, description, image, imageAlt, buttonText, buttonHref, formId, children }: CompactHeroProps) {
  return (
    <>
      {/* Mobile: Bild mit Text-Overlay, Bullets darunter */}
      <section className="lg:hidden relative">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            {description && <p className="text-sm text-white/90">{description}</p>}
          </div>
        </div>
        <div className="px-4 py-4">
          {children}
          {buttonText && buttonHref && (
            <div className="mt-4">
              <a
                href={buttonHref}
                className="inline-flex items-center justify-center w-full rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {buttonText}
              </a>
            </div>
          )}
          {formId && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5" id={`${formId}-mobile`}>
              <HeroForm />
            </div>
          )}
        </div>
      </section>

      {/* Desktop: Bild volle Breite, Info links + Formular rechts */}
      <section className="hidden lg:block relative">
        <div className="relative overflow-hidden" style={{aspectRatio: '21/8'}}>
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 flex items-end justify-center px-8 xl:px-16 pb-8 gap-10">
          <div className="flex items-stretch gap-10">
            <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-8 shadow-lg shrink-0" style={{minWidth: '520px'}}>
              <h1 className="text-3xl xl:text-4xl font-bold text-foreground mb-2 whitespace-nowrap">{title}</h1>
              {description && <p className="text-base text-muted-foreground mb-3 whitespace-nowrap">{description}</p>}
              {children}
            </div>
            {formId && (
              <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-6 shadow-lg shrink-0 flex flex-col justify-center" style={{width: '420px'}} id={formId}>
                <HeroForm />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function HeroForm() {
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    // Placeholder - wird später durch echtes Backend ersetzt
    setTimeout(() => setStatus('sent'), 1000);
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-semibold text-foreground mb-2">Anfrage gesendet!</p>
        <p className="text-sm text-muted-foreground">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <select name="anrede" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        <option value="">Anrede</option>
        <option>Herr</option>
        <option>Frau</option>
        <option>Herr Dr.</option>
        <option>Frau Dr.</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input name="vorname" type="text" placeholder="Vorname" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input name="nachname" type="text" placeholder="Nachname" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <input name="firma" type="text" placeholder="Firma" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      <input name="strasse" type="text" placeholder="Straße, Hausnummer" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="plz" type="text" placeholder="PLZ" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input name="ort" type="text" placeholder="Ort" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="telefon" type="tel" placeholder="Telefonnummer" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="E-Mail" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <textarea name="nachricht" placeholder="Ihre Nachricht" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" rows={2}></textarea>
      <button type="submit" disabled={status === 'sending'} className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        {status === 'sending' ? 'Wird gesendet...' : 'Kostenloses Angebot anfordern'}
      </button>
    </form>
  );
}
