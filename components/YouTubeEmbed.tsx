'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const STRINGS = {
  de: {
    notice: 'Video wird von YouTube geladen. Dabei werden Daten an Google übertragen.',
    load: 'Video laden',
    channel: 'Video',
  },
  en: {
    notice: 'Video will be loaded from YouTube. Data will be transferred to Google.',
    load: 'Load video',
    channel: 'Video',
  },
  fr: {
    notice: 'La vidéo sera chargée depuis YouTube. Des données seront transmises à Google.',
    load: 'Charger la vidéo',
    channel: 'Vidéo',
  },
  it: {
    notice: 'Il video verrà caricato da YouTube. I dati saranno trasmessi a Google.',
    load: 'Carica video',
    channel: 'Video',
  },
};

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  channel?: string;
}

export function YouTubeEmbed({ videoId, title, channel }: YouTubeEmbedProps) {
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' | 'it' =
    pathname?.startsWith('/en') ? 'en'
    : pathname?.startsWith('/fr') ? 'fr'
    : pathname?.startsWith('/it') ? 'it'
    : 'de';
  const t = STRINGS[locale];

  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <div className="w-full">
        <div className="relative w-full overflow-hidden rounded-xl shadow-md bg-black" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            aria-label={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
        {channel && (
          <p className="text-xs text-gray-500 mt-2">{t.channel}: {channel}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setActivated(true)}
        aria-label={`${t.load} — ${title}`}
        className="relative w-full overflow-hidden rounded-xl shadow-md cursor-pointer group bg-black"
        style={{ aspectRatio: '16 / 9' }}
      >
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-[#6b7f3e] ml-1" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 p-3 md:p-4 text-left">
          <p className="text-white text-xs md:text-sm font-medium line-clamp-2">{title}</p>
        </div>
      </button>
      <p className="text-xs text-gray-500 mt-2">
        {t.notice}{' '}
        <span className="text-[#6b7f3e] font-medium">{t.load} ↑</span>
      </p>
    </div>
  );
}
