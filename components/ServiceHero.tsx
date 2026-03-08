'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ServiceCard {
  title: string;
  description: string;
  image: string;
  links: { label: string; href: string }[];
}

interface ServiceHeroProps {
  backgroundImage: string;
  headline?: string;
  services: ServiceCard[];
}

function MobileServiceCard({ service, index }: { service: ServiceCard; index: number }) {
  const [showLocations, setShowLocations] = useState(false);

  return (
    <div
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 flex flex-col cursor-pointer"
      onClick={() => setShowLocations(!showLocations)}
    >
      <div className="flex items-center gap-3">
        {service.image && (
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
              loading={index < 2 ? "eager" : "lazy"}
            />
          </div>
        )}
        <div className="flex-grow min-w-0">
          <h3 className="text-base font-bold text-gray-900">{service.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{service.description}</p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showLocations ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {showLocations && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
          {service.links.map((link, j) => (
            <Link
              key={j}
              href={link.href}
              className={`flex-1 text-center text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${
                j === 0
                  ? 'bg-[var(--color-primary,#1a73b5)] text-white hover:opacity-90'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceHero({ backgroundImage, headline, services }: ServiceHeroProps) {
  return (
    <section className="relative w-full min-h-[auto] sm:min-h-[90vh] flex items-start justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/15" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-4 pt-3 sm:pt-[30vh] pb-6 sm:pb-20">
        {headline && (
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4 sm:mb-16 drop-shadow-lg">
            {headline}
          </h1>
        )}

        {/* Desktop: Cards with full layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-5 flex flex-col"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{service.title}</h3>
              
              {service.image && (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed text-center">
                {service.description}
              </p>

              <div className="flex flex-col gap-2 mt-auto">
                {service.links.map((link, j) => (
                  <Link
                    key={j}
                    href={link.href}
                    className={`block text-center text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors ${
                      j === 0
                        ? 'bg-[var(--color-primary,#1a73b5)] text-white hover:opacity-90'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Compact cards with click-to-expand location */}
        <div className="sm:hidden flex flex-col gap-2.5 max-w-sm mx-auto">
          {services.map((service, i) => (
            <MobileServiceCard key={i} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
