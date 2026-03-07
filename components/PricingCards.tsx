'use client';

import React from 'react';

interface PricingCard {
  title: string;
  price: string;
  image: string;
  description: string;
}

interface PricingCardsProps {
  cards: PricingCard[];
  backgroundImage?: string;
  headline?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function PricingCards({ cards, backgroundImage, headline, ctaText, ctaHref }: PricingCardsProps) {
  return (
    <section className="relative overflow-hidden">
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}
      <div className="relative z-10 container-main py-16 md:py-20">
        {headline && (
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
            {headline}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
            >
              <div className="font-bold text-lg text-center pt-5 pb-2 text-gray-900">{card.title}</div>
              <div className="px-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="px-5 pt-3 pb-2 text-center">
                <div className="text-2xl font-bold text-primary mb-1">{card.price}</div>
              </div>
              <div className="px-5 pb-4 text-sm text-gray-600 text-center leading-relaxed flex-grow">
                {card.description}
              </div>
              {ctaText && ctaHref && (
                <div className="px-5 pb-5">
                  <a
                    href={ctaHref}
                    className="block text-center text-sm font-semibold py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {ctaText}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
