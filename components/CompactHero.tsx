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
    <section className="px-4 py-6 sm:py-8 md:py-12">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div className="relative aspect-[4/3] md:aspect-[3/2] rounded-2xl overflow-hidden">
            <img
              src={image}
              alt={imageAlt || title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h1>
            {description && <p className="text-base sm:text-lg text-muted-foreground">{description}</p>}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
