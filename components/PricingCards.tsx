'use client';

import React from 'react';

interface PriceItem {
  label: string;
  amount: string;
  badge?: string;
}

interface PricingCard {
  title: string;
  subtitle?: string;
  price?: string;
  prices?: PriceItem[];
  image: string;
  description: string;
}

interface PricingCardsProps {
  cards: PricingCard[];
  backgroundImage?: string;
  headline?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function PricingCards({ cards, backgroundImage, headline, title, description, ctaText, ctaHref }: PricingCardsProps) {
  const displayTitle = title || headline;

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
        {(displayTitle || description) && (
          <div className="text-center mb-12">
            {displayTitle && (
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
                {displayTitle}
              </h2>
            )}
            {description && (
              <p className={`text-lg max-w-2xl mx-auto ${backgroundImage ? 'text-white/80' : 'text-muted-foreground'}`}>
                {description}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col border border-gray-100"
            >
              {/* Title + Subtitle */}
              <div className="pt-5 pb-2 px-5 text-center">
                <div className="font-bold text-lg text-gray-900">{card.title}</div>
                {card.subtitle && (
                  <div className="text-sm text-[#6b7f3e] font-semibold mt-0.5">{card.subtitle}</div>
                )}
              </div>

              {/* Image */}
              <div className="px-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="px-5 pt-3 pb-3 text-sm text-gray-600 text-center leading-relaxed flex-grow">
                {card.description}
              </div>

              {/* Prices */}
              <div className="px-5 pb-4">
                {card.price && (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#6b7f3e]">{card.price}</span>
                  </div>
                )}
                {card.prices && card.prices.length > 0 && (
                  <div className="space-y-2">
                    {card.prices.map((p, j) => (
                      <div key={j} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${p.badge ? 'bg-[#6b7f3e]/10 border border-[#6b7f3e]/20' : 'bg-[#f0f4e8]'}`}>
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          {p.label}
                          {p.badge && <span className="text-[10px] font-bold text-white bg-[#6b7f3e] rounded-full px-1.5 py-0.5">{p.badge}</span>}
                        </span>
                        <span className="text-base font-bold text-[#6b7f3e]">{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              {ctaText && ctaHref && (
                <div className="px-5 pb-5">
                  <a
                    href={ctaHref}
                    className="block text-center text-sm font-semibold py-2.5 px-4 rounded-lg bg-[#6b7f3e] text-white hover:bg-[#5a6b35] transition-colors"
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
