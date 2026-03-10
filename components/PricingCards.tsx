'use client';

import React, { useState } from 'react';

interface PriceItem {
  label: string;
  amount: string;
  badge?: string;
  note?: string;
  tenner?: {
    amount: string;
  };
}

interface PricingCard {
  title: string;
  subtitle?: string;
  price?: string;
  prices?: PriceItem[];
  image: string;
  description: string;
  ctaHref?: string;
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

function PricingCardItem({ card, ctaText, ctaHref, onImageClick }: { card: PricingCard; ctaText?: string; ctaHref?: string; onImageClick?: (src: string) => void }) {
  const [selected, setSelected] = useState<{ index: number; tenner: boolean } | null>(null);

  const buildHref = () => {
    const href = card.ctaHref || ctaHref;
    if (!href) return '#';
    const params = new URLSearchParams({
      raum: card.title,
      ...(selected !== null && card.prices?.[selected.index] ? {
        tarif: card.prices[selected.index].label,
        preis: selected.tenner && card.prices[selected.index].tenner
          ? card.prices[selected.index].tenner!.amount
          : card.prices[selected.index].amount,
        karte: selected.tenner ? '10er' : 'einzel',
      } : {}),
    });
    return `${href}?${params.toString()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col border border-gray-100 relative">
      {/* Title + Subtitle */}
      <div className="pt-5 pb-2 px-5 text-center">
        <div className="font-bold text-lg text-gray-900">{card.title}</div>
        {card.subtitle && (
          <div className="text-sm text-[#6b7f3e] font-semibold mt-0.5">{card.subtitle}</div>
        )}
      </div>

      {/* Image */}
      <div className="px-4">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group" onClick={() => onImageClick?.(card.image || '')}>
          <img
            src={card.image}
            alt={card.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pt-3 pb-3 text-sm text-gray-600 text-center leading-relaxed flex-grow">
        {card.description}
      </div>

      {/* Prices — selectable */}
      <div className="px-5 pb-4">
        {card.price && (
          <div className="text-center">
            <span className="text-2xl font-bold text-[#6b7f3e]">{card.price}</span>
          </div>
        )}
        {card.prices && card.prices.length > 0 && (
          <div className="space-y-3">
            {card.prices.map((p, j) => {
              const isSelectedNormal = selected?.index === j && !selected.tenner;
              const isSelectedTenner = selected?.index === j && selected.tenner;
              const isAnySelected = isSelectedNormal || isSelectedTenner;
              return (
                <div key={j} className={`rounded-xl border transition-all overflow-hidden ${
                  isAnySelected ? 'border-[#6b7f3e] shadow-sm' : 'border-gray-200'
                }`}>
                  {/* Normaler Preis */}
                  <button
                    type="button"
                    onClick={() => setSelected(isSelectedNormal ? null : { index: j, tenner: false })}
                    className={`w-full px-4 py-3 transition-all cursor-pointer text-left ${
                      isSelectedNormal
                        ? 'bg-[#6b7f3e]'
                        : 'bg-[#f0f4e8] hover:bg-[#e8eede]'
                    }`}
                  >
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                      <span className={`text-sm font-medium ${isSelectedNormal ? 'text-white' : 'text-gray-700'}`}>{p.label}</span>
                      <span className={`text-base font-bold tabular-nums text-right ${isSelectedNormal ? 'text-white' : 'text-[#6b7f3e]'}`}>{p.amount}</span>
                    </div>
                    {p.note && (
                      <span className={`text-[11px] block mt-1 ${isSelectedNormal ? 'text-white/70' : 'text-gray-400'}`}>{p.note}</span>
                    )}
                  </button>
                  {/* 10er-Karte */}
                  {p.tenner && (
                    <button
                      type="button"
                      onClick={() => setSelected(isSelectedTenner ? null : { index: j, tenner: true })}
                      className={`w-full px-4 py-2.5 transition-all cursor-pointer text-left border-t ${
                        isSelectedTenner
                          ? 'bg-[#6b7f3e] border-[#5a6b35]'
                          : 'bg-white hover:bg-[#e8eede] border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${isSelectedTenner ? 'text-white/80' : 'text-gray-500'}`}>10er-Karte</span>
                        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${isSelectedTenner ? 'bg-white text-[#6b7f3e]' : 'bg-[#6b7f3e] text-white'}`}>−15%</span>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      {ctaText && ctaHref && (
        <div className="px-5 pb-5">
          <a
            href={buildHref()}
            className={`block text-center text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors ${
              selected
                ? 'bg-[#6b7f3e] text-white hover:bg-[#5a6b35]'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );
}

export function PricingCards({ cards, backgroundImage, headline, title, description, ctaText, ctaHref }: PricingCardsProps) {
  const displayTitle = title || headline;
  const [lightbox, setLightbox] = useState<string | null>(null);

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
            <PricingCardItem key={i} card={card} ctaText={ctaText} ctaHref={ctaHref} onImageClick={setLightbox} />
          ))}
        </div>
      </div>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            className="absolute top-6 right-6 text-white text-3xl font-light hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >✕</button>
        </div>
      )}
    </section>
  );
}
