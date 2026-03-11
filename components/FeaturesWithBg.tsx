'use client';

import React from 'react';

interface FeaturesWithBgProps {
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  backgroundImage: string;
  children: React.ReactNode;
}

export function FeaturesWithBg({ title, description, columns = 3, backgroundImage, children }: FeaturesWithBgProps) {
  const gridCols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Kein Overlay — Bild in vollen Farben */}
      <div className="relative z-10 container-main">
        {(title || description) && (
          <div className="text-center mb-12 flex justify-center">
            <div className="inline-block rounded-2xl bg-background/90 backdrop-blur-sm px-8 py-4 shadow-md border border-border">
              {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>}
              {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">{description}</p>}
            </div>
          </div>
        )}
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>{children}</div>
      </div>
    </section>
  );
}
