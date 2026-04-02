'use client';

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://weil.bizzcenter.de/#organization",
    "name": "bizzcenter Weil am Rhein",
    "alternateName": "bizzcenter Weil am Rhein GmbH",
    "url": "https://weil.bizzcenter.de",
    "logo": "https://weil.bizzcenter.de/images/logo-header.svg",
    "image": "https://weil.bizzcenter.de/images/og/og-image.jpg",
    "description": "Business Center in Weil am Rhein: Geschäftsadresse, Coworking, Büros und Konferenzräume mieten. Im Dreiländereck Basel, 300m zur Schweizer Grenze. Seit 2004.",
    "telephone": "+4976219165547",
    "email": "weil@bizzcenter.de",
    "foundingDate": "2004",
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Am Kesselhaus 3",
      "addressLocality": "Weil am Rhein",
      "postalCode": "79576",
      "addressRegion": "Baden-Württemberg",
      "addressCountry": "DE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.5944,
      "longitude": 7.6206
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://www.google.com/maps/place/bizzcenter+Weil+am+Rhein"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Bürolösungen",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Geschäftsadresse mieten",
            "description": "Ladungsfähige Geschäftsadresse für Handelsregister und Finanzamt",
            "url": "https://weil.bizzcenter.de/geschaeftsadresse-mieten"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Coworking Space",
            "description": "Flexibler Arbeitsplatz im Green Office — Tagespass, 10er-Karte oder Monatspass",
            "url": "https://weil.bizzcenter.de/coworking"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Büro mieten",
            "description": "Möblierte Einzel- und Teambüros, sofort bezugsfertig",
            "url": "https://weil.bizzcenter.de/buero-mieten"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Konferenzraum mieten",
            "description": "Tageslichtdurchflutete Räume für 2–25 Personen, stundenweise buchbar",
            "url": "https://weil.bizzcenter.de/konferenzraum-mieten"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50",
      "bestRating": "5"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
