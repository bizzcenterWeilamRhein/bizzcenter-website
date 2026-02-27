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

export function ServiceHero({ backgroundImage, headline, services }: ServiceHeroProps) {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/15" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 sm:py-20">
        {headline && (
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8 sm:mb-12 drop-shadow-lg">
            {headline}
          </h1>
        )}

        {/* Service Cards Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-5 flex flex-col"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              
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

              <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed">
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
      </div>
    </section>
  );
}
