interface Logo {
  src: string;
  alt: string;
}

interface MemberLogosProps {
  title?: string;
  logos: Logo[];
  /** Scroll speed in seconds for one full cycle. Default: 30 */
  speed?: number;
}

export function MemberLogos({ title, logos, speed = 30 }: MemberLogosProps) {
  const doubled = [...logos, ...logos];

  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-x-clip">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 text-center mb-10">
          {title}
        </p>
      )}

      <div className="relative overflow-hidden" style={{ contain: 'paint' }}>
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div
          className="flex items-center gap-16 sm:gap-20 w-max will-change-transform"
          style={{
            animation: `memberScroll ${speed}s linear infinite`,
          }}
        >
          {doubled.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="h-20 sm:h-28 w-auto object-contain flex-shrink-0"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes memberScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
