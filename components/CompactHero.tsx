'use client';

import React from 'react';

interface CompactHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  children?: React.ReactNode;
}

export function CompactHero({ title, description, image, imageAlt, children }: CompactHeroProps) {
  return (
    <>
      {/* Mobile: Bild mit Text-Overlay */}
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
        {children}
      </section>

      {/* Desktop: Bild links, Text rechts */}
      <section className="hidden md:block px-4 py-8 md:py-12">
        <div className="container-main">
          <div className="grid grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
              <img
                src={image}
                alt={imageAlt || title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h1>
              {description && <p className="text-lg text-muted-foreground">{description}</p>}
              {children}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
