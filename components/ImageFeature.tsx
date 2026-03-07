'use client';

import React from 'react';

interface ImageFeatureProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  reverse?: boolean;
}

export function ImageFeature({ title, description, image, imageAlt, reverse }: ImageFeatureProps) {
  return (
    <>
      {/* Mobile: Bild mit Text-Overlay */}
      <div className="md:hidden relative">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/90 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      {/* Desktop: Bild + Text nebeneinander */}
      <div className={`hidden md:grid grid-cols-2 gap-10 items-center ${reverse ? '' : ''}`}>
        {reverse ? (
          <>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
              <img src={image} alt={imageAlt || title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </>
        ) : (
          <>
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
              <img src={image} alt={imageAlt || title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

interface ImageFeaturesProps {
  children: React.ReactNode;
}

export function ImageFeatures({ children }: ImageFeaturesProps) {
  return (
    <section className="px-4 py-8 md:py-12">
      <div className="container-main flex flex-col gap-6 md:gap-12">
        {children}
      </div>
    </section>
  );
}
