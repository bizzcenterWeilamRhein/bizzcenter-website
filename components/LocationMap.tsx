interface Location {
  name: string;
  address: string[];
  phone: string;
  email: string;
  mapEmbedUrl: string;
}

interface LocationMapProps {
  title?: string;
  locations: Location[];
}

export function LocationMap({ title, locations }: LocationMapProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 sm:py-16">
      {title && (
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {locations.map((loc, i) => (
          <div key={i} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{loc.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {loc.address.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
              <p>
                Telefon: <a href={"tel:" + loc.phone.replace(/\s/g, "")} className="text-blue-600 hover:underline">{loc.phone}</a>
              </p>
              <p>
                E-Mail: <a href={"mailto:" + loc.email} className="text-blue-600 hover:underline">{loc.email}</a>
              </p>
            </div>
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
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
          </div>
        ))}
      </div>
    </section>
  );
}
