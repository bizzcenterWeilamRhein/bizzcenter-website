'use client';

import React from 'react';

interface CompactHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  buttonText?: string;
  buttonHref?: string;
  children?: React.ReactNode;
}

export function CompactHero({ title, description, image, imageAlt, buttonText, buttonHref, children }: CompactHeroProps) {
  return (
    <>
      {/* Mobile: Bild mit Text-Overlay, Bullets + Button darunter */}
      <section className="md:hidden relative">
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
        </div>
      </section>

      {/* Desktop: Bild volle Breite, Text-Box drüber rechts */}
      <section className="hidden md:block relative">
        <div className="relative aspect-[21/9] overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-8 max-w-3xl shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h1>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
