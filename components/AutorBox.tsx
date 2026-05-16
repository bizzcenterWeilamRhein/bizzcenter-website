/**
 * Autor-Box am Ende einer Landingpage.
 * E-E-A-T-Signal: nennt den Verantwortlichen + Erfahrungs-Kontext + Stand-Datum.
 */

interface AutorBoxProps {
  /** Datum als "DD.MM.YYYY" oder "Mai 2026" — wird sichtbar als "Stand: ..." */
  stand: string;
  /** Default: Torben + 22 Jahre Business-Center-Erfahrung */
  autor?: string;
  /** Default: Geschäftsführer-Beschreibung */
  rolle?: string;
}

export function AutorBox({
  stand,
  autor = 'Torben Götz',
  rolle = 'Geschäftsführer der bizzcenter Weil am Rhein GmbH. Seit 2004 im Business-Center-Bereich tätig, betreut mit dem Team über 200 Kunden im Dreiländereck.',
}: AutorBoxProps) {
  return (
    <section style={{ maxWidth: '720px', margin: '4rem auto 2rem', padding: '0 1.5rem' }}>
      <div style={{ background: '#f7f3ec', borderRadius: '1rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: '#6b7f3e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
          TG
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B3A5C', marginBottom: '0.25rem' }}>
            Verfasst von {autor}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            {rolle}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#888' }}>
            Stand: {stand}
          </p>
        </div>
      </div>
    </section>
  );
}
