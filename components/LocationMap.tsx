interface Location {
  name: string;
  address: string[];
  phone: string;
  email: string;
  mapEmbedUrl: string;
}

interface LocationMapProps {
  title?: string;
  image?: string;
  imageAlt?: string;
  locations: Location[];
}

export function LocationMap({ title, image, imageAlt, locations }: LocationMapProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 sm:py-16">
      {title && (
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Map */}
        {locations.map((loc, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden" style={{ minHeight: '400px' }}>
            <iframe
              title={"Karte " + loc.name}
              src={loc.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ))}
        {/* Right: Image + Contact info */}
        <div className="flex flex-col gap-4">
          {image && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <img src={image} alt={imageAlt || ''} className="w-full aspect-[4/3] object-cover" />
            </div>
          )}
          {locations.map((loc, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{loc.name}</h3>
              <div className="text-sm text-gray-600 space-y-1.5">
                {loc.address.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
                <p className="pt-2">
                  Telefon: <a href={"tel:" + loc.phone.replace(/\s/g, "")} className="text-[#6b7f3e] hover:underline font-medium">{loc.phone}</a>
                </p>
                <p>
                  E-Mail: <a href={"mailto:" + loc.email} className="text-[#6b7f3e] hover:underline font-medium">{loc.email}</a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
