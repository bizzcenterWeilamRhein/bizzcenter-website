'use client';

import React, { useRef } from 'react';

interface GalleryCarouselItemProps {
  src: string;
  caption?: string;
}

export function GalleryCarouselItem({ src, caption }: GalleryCarouselItemProps) {
  return null; // Data-only; consumed by parent
}

interface GalleryCarouselProps {
  id?: string;
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function GalleryCarousel({ id, title, description, columns = 3, children }: GalleryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child: any) => ({
      src: child.props.src as string,
      caption: child.props.caption as string | undefined,
    }));

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.85;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const gridColsMap: Record<number, string> = {
    2: 'hidden md:grid grid-cols-1 md:grid-cols-2 gap-6',
    3: 'hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    4: 'hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  };

  return (
    <section id={id} className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}

        {/* Desktop: Grid */}
        <div className={gridColsMap[columns] || gridColsMap[3]}>
          {items.map((item, i) => (
            <figure key={i} className="group overflow-hidden rounded-xl glass-1">
              <div className="overflow-hidden">
                <img
                  src={item.src}
                  alt={item.caption || ''}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              {item.caption && (
                <figcaption className="p-4 text-sm text-muted-foreground">{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden relative group/carousel">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {items.map((item, i) => (
              <figure
                key={i}
                className="flex-shrink-0 w-[80vw] max-w-[340px] snap-center overflow-hidden rounded-xl glass-1"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.caption || ''}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
                {item.caption && (
                  <figcaption className="p-3 text-sm text-muted-foreground">{item.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
          {/* Scroll indicators */}
          <div className="flex justify-center gap-1.5 mt-2">
            {items.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
