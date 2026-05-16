/**
 * Service-Schema (Schema.org) für Landingpages.
 * Gibt Service-Strukturdaten an Google: Anbieter, areaServed, Audience, Offer.
 */

interface ServiceSchemaProps {
  serviceType: string;
  /** Frei formulierte Zielgruppen-Beschreibung (z. B. "Honorararzt, Anästhesist, Belegarzt") */
  audienceType: string;
  /** Orte/Regionen, in denen der Service angeboten wird */
  areaServed?: string[];
  /** Einstiegspreis in EUR (z. B. 49). Wenn nicht gesetzt: kein Offer-Block. */
  priceFrom?: number;
}

export function ServiceSchema({
  serviceType,
  audienceType,
  areaServed = ['Weil am Rhein', 'Lörrach', 'Basel', 'Rheinfelden', 'Dreiländereck'],
  priceFrom,
}: ServiceSchemaProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    provider: {
      '@type': 'LocalBusiness',
      name: 'bizzcenter Weil am Rhein GmbH',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Am Kesselhaus 3',
        postalCode: '79576',
        addressLocality: 'Weil am Rhein',
        addressCountry: 'DE',
      },
      telephone: '+49 7621 796 0310',
      url: 'https://weil.bizzcenter.de',
    },
    areaServed,
    audience: {
      '@type': 'Audience',
      audienceType,
    },
  };

  if (priceFrom !== undefined) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: String(priceFrom),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(priceFrom),
        priceCurrency: 'EUR',
        unitText: 'MONTH',
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
