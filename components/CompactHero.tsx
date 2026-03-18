'use client';

import React from 'react';

interface CompactHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  buttonText?: string;
  buttonHref?: string;
  formId?: string;
  children?: React.ReactNode;
}

export function CompactHero({ title, description, image, imageAlt, imagePosition, buttonText, buttonHref, formId, children }: CompactHeroProps) {
  return (
    <>
      {/* Mobile: Bild mit Text-Overlay, Bullets darunter */}
      <section className="xl:hidden relative">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
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
            <div className="mt-6 rounded-2xl border border-border bg-card p-5" id={`${formId}-mobile`} style={{scrollMarginTop: '100px'}}>
              <HeroForm />
            </div>
          )}
        </div>
      </section>

      {/* Desktop: Bild volle Breite, Info links + Formular rechts */}
      <section className="hidden xl:block relative">
        <div className="relative overflow-hidden" style={{aspectRatio: '21/10'}}>
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: imagePosition || 'center' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-8 xl:px-16">
          <div className="flex flex-wrap items-stretch justify-center gap-6 xl:gap-10 max-w-6xl w-full">
            <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-8 shadow-lg min-w-0 flex-1" style={{minWidth: '340px', maxWidth: '560px'}}>
              <h1 className="text-2xl xl:text-4xl font-bold text-foreground mb-2">{title}</h1>
              {description && <p className="text-sm xl:text-base text-muted-foreground mb-3">{description}</p>}
              {children}
              {buttonText && buttonHref && (
                <div className="mt-4">
                  <a
                    href={buttonHref}
                    className="inline-flex items-center justify-center rounded-lg bg-[#6b7f3e] text-white px-8 py-3 text-sm font-semibold hover:opacity-90 transition-opacity no-underline shadow-sm"
                  >
                    {buttonText} →
                  </a>
                </div>
              )}
            </div>
            {formId && (
              <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-6 shadow-lg flex flex-col justify-center min-w-0 flex-1" style={{minWidth: '320px', maxWidth: '420px', scrollMarginTop: '100px'}} id={formId}>
                <HeroForm />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

const tarifLabels: Record<string, string> = {
  tagespass: 'Tagespass — EUR 25,- zzgl. MwSt.',
  zehnerkarte: '10er-Karte — EUR 209,- zzgl. MwSt.',
  monatspass: 'Monatspass — EUR 219,- zzgl. MwSt.',
  monatsabo: 'Monatsabo — EUR 199,- zzgl. MwSt.',
};

function HeroForm() {
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent'>('idle');
  const [selectedTarif, setSelectedTarif] = React.useState<string | null>(null);

  React.useEffect(() => {
    function onTarifSelected(e: Event) {
      const detail = (e as CustomEvent).detail;
      setSelectedTarif(detail);
    }
    window.addEventListener('tarif-selected', onTarifSelected);
    return () => window.removeEventListener('tarif-selected', onTarifSelected);
  }, []);

  if (status === 'sent') {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-semibold text-foreground mb-2">Anfrage gesendet!</p>
        <p className="text-sm text-muted-foreground">Wir melden uns umgehend bei Ihnen.</p>
      </div>
    );
  }

  function handleSubmitWithRedirect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((v, k) => { data[k] = v.toString(); });

    // Lead erfassen (fire-and-forget)
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, name: `${data.vorname || ''} ${data.nachname || ''}`.trim(), quelle: 'hero-formular', timestamp: new Date().toISOString() }),
    }).catch(() => {});

    // Weiterleitung zum Angebot
    const params = new URLSearchParams({
      ...(data.anrede && { anrede: data.anrede }),
      ...(data.vorname && { vorname: data.vorname }),
      ...(data.nachname && { nachname: data.nachname }),
      ...(data.firma && { firma: data.firma }),
      ...(data.email && { email: data.email }),
      ...(data.telefon && { telefon: data.telefon }),
    });
    window.location.href = `/angebot/kunde-xyz?${params.toString()}`;
  }

  return (
    <form onSubmit={handleSubmitWithRedirect} className="space-y-2">
      {selectedTarif && (
        <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-sm text-primary font-semibold text-center">
          {tarifLabels[selectedTarif] || selectedTarif}
        </div>
      )}
      <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
        <select name="anrede" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          <option value="">Anrede</option>
          <option>Herr</option>
          <option>Frau</option>
          <option>Herr Dr.</option>
          <option>Frau Dr.</option>
        </select>
        <input name="vorname" type="text" placeholder="Vorname" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input name="nachname" type="text" placeholder="Nachname" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <input name="firma" type="text" placeholder="Firma" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="email" type="email" placeholder="E-Mail" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input name="telefon" type="tel" placeholder="Telefon (optional)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <input type="hidden" name="tarif" value={selectedTarif || ''} />
      <button type="submit" disabled={status === 'sending'} className="w-full rounded-lg bg-[#6b7f3e] text-white px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
        {status === 'sending' ? 'Angebot wird erstellt...' : 'Angebot erstellen'}
      </button>
    </form>
  );
}
