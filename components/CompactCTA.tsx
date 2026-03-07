'use client';

import React from 'react';

interface CompactCTAProps {
  title: string;
  subtext?: string;
  buttonText: string;
  buttonHref?: string;
  children?: React.ReactNode;
}

export function CompactCTA({ title, subtext, buttonText, buttonHref, children }: CompactCTAProps) {
  return (
    <section className="px-4 py-6 sm:py-8">
      <div className="container-main">
        <div className="relative overflow-hidden glass-4 rounded-2xl p-8 md:p-10 text-center">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{title}</h2>
            {subtext && <p className="text-muted-foreground mb-4 max-w-xl mx-auto text-sm">{subtext}</p>}
            {buttonHref && (
              <a
                href={buttonHref}
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {buttonText}
              </a>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CompactCTAFeature({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
      {icon && <span className="text-base md:text-lg">{icon}</span>}
      <span>{title}</span>
    </div>
  );
}
