interface Logo {
  src: string;
  alt: string;
}

interface MemberLogosProps {
  title?: string;
  logos: Logo[];
}

export function MemberLogos({ title, logos }: MemberLogosProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 sm:py-16">
      {title && (
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 text-center mb-8">
          {title}
        </h2>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        {logos.map((logo, i) => (
          <img
            key={i}
            src={logo.src}
            alt={logo.alt}
            className="h-12 sm:h-16 w-auto object-contain"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
