'use client';

import React from 'react';

/* ─────────────────────── TYPES ─────────────────────── */

interface PrintProps {
  angebot: {
    slug: string;
    firma: string;
    anrede: string;
    name: string;
    ansprechpartner: string;
    ansprechpartnerTitel: string;
    ansprechpartnerTel: string;
    ansprechpartnerEmail: string;
    standort: string;
    adresse: string;
    datum: string;
    gueltigBis: string;
    heroImage?: string;
  };
  selectedTarif: {
    id: string;
    name: string;
    label: string;
    kuendigung: string;
    priceNetto: number;
    priceBrutto: number;
  } | null;
  allTarife: {
    id: string;
    name: string;
    label: string;
    kuendigung: string;
    priceNetto: number;
    priceBrutto: number;
  }[];
  selectedAddons: Set<string>;
  addonList: {
    id: string;
    label: string;
    description?: string;
    priceNetto: number;
    priceBrutto: number;
    unit: string;
    einmalig?: boolean;
    category?: string;
  }[];
  inklusivLeistungen: { label: string; desc: string }[];
  monatlichNetto: number;
  einmalig: number;
  kaution: number;
  jahresvorauskasse: boolean;
  monatlichNettoRabatt: number;
  // Form data
  firmenname: string;
  rechtsformLabel: string;
  vertreterName: string;
  kontakt: string;
  email: string;
}

/* ─────────────────────── HELPER ─────────────────────── */

function formatEUR(n: number): string {
  return `EUR ${n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })},-`;
}

/* ─────────────────────── STYLES ─────────────────────── */

const pageStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  padding: '25mm 25mm 40mm 25mm',
  fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
  fontSize: '10.5pt',
  lineHeight: '1.5',
  color: '#1a1a1a',
  position: 'relative',
  pageBreakAfter: 'always',
  boxSizing: 'border-box',
};

const lastPageStyle: React.CSSProperties = {
  ...pageStyle,
  pageBreakAfter: 'auto',
};

const logoBlockStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20mm',
  right: '25mm',
  width: '55mm',
};

const footerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '10mm',
  left: '25mm',
  right: '25mm',
  fontSize: '7pt',
  color: '#666',
  lineHeight: '1.6',
  borderTop: '0.5pt solid #ccc',
  paddingTop: '3mm',
};

const h2Style: React.CSSProperties = {
  fontSize: '14pt',
  fontWeight: 700,
  color: '#2C4A7C',
  margin: '0 0 4mm 0',
};

const h3Style: React.CSSProperties = {
  fontSize: '12pt',
  fontWeight: 700,
  color: '#2C4A7C',
  margin: '5mm 0 3mm 0',
};

const checkStyle: React.CSSProperties = {
  color: '#6b7f3e',
  fontWeight: 700,
  marginRight: '2mm',
};

/* ─────────────────────── FOOTER COMPONENT ─────────────────────── */

function PageFooter({ pageNum, totalPages }: { pageNum: number; totalPages: number }) {
  return (
    <div style={footerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div>bizzcenter Weil am Rhein GmbH | Im Schwarzenbach 4 | 79576 Weil am Rhein</div>
          <div>Geschäftsführer: Torben Götz | Registergericht: AG Freiburg | Registernummer: HRB 720019</div>
          <div>Tel. +49 (0)7621 9165547 | E-Mail: weilamrhein@bizzcenter.de | Web: www.bizzcenter.de</div>
          <div>Bankverbindung: Sparkasse Markgräflerland | IBAN: DE87 6905 1410 0007 0844 37</div>
          <div>Standorte: Konstanz und Weil am Rhein</div>
        </div>
        <div style={{ fontSize: '8pt', whiteSpace: 'nowrap' }}>Seite {pageNum} von {totalPages}</div>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export function AngebotPrintView({
  angebot,
  selectedTarif,
  allTarife,
  selectedAddons,
  addonList,
  inklusivLeistungen,
  monatlichNetto,
  einmalig,
  kaution,
  jahresvorauskasse,
  monatlichNettoRabatt,
  firmenname,
  rechtsformLabel,
  vertreterName,
  kontakt,
  email,
}: PrintProps) {
  const activeAddons = addonList.filter(a => selectedAddons.has(a.id));
  const monthlyAddons = activeAddons.filter(a => !a.einmalig);
  const oneTimeAddons = activeAddons.filter(a => a.einmalig);
  const displayFirma = firmenname || angebot.firma;
  const totalPages = 4;

  // Group addons by category
  const addonCategories: Record<string, typeof activeAddons> = {};
  activeAddons.forEach(a => {
    const cat = a.category || 'sonstiges';
    if (!addonCategories[cat]) addonCategories[cat] = [];
    addonCategories[cat].push(a);
  });

  const categoryLabels: Record<string, string> = {
    post: 'Post & Digitalisierung',
    coworking: 'Coworking & Arbeitsplatz',
    aufbewahrung: 'Aufbewahrung',
    parkplatz: 'Parken',
    service: 'Services & Extras',
    sonstiges: 'Sonstiges',
  };

  return (
    <div className="angebot-print-view hidden">
      {/* Print-only styles injected inline */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .angebot-print-root .angebot-screen-view { display: none !important; }
          .angebot-print-root .angebot-print-view { display: block !important; }
          body > *:not(.angebot-print-root) { display: none !important; }
          nav, header, footer, [class*="sticky"], [class*="fixed"], [class*="backdrop"] { display: none !important; }
          @page { size: A4; margin: 0; }
          body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          img { max-width: 100% !important; page-break-inside: avoid; }
          .angebot-print-view > div:not(:last-child) { page-break-after: always; }
        }
      ` }} />
      {/* ══════════════════ SEITE 1: DECKBLATT ══════════════════ */}
      <div style={pageStyle}>
        {/* Logo */}
        <div style={logoBlockStyle}>
          <img src="/images/logo-bizzcenter.png" alt="bizzcenter" style={{ width: '100%', height: 'auto' }} />
        </div>

        {/* Absenderzeile */}
        <div style={{ fontSize: '7pt', color: '#999', borderBottom: '0.5pt solid #ccc', paddingBottom: '1mm', marginTop: '5mm', marginBottom: '4mm', maxWidth: '100mm' }}>
          bizzcenter Weil am Rhein GmbH | Im Schwarzenbach 4 | 79576 Weil am Rhein
        </div>

        {/* Adressblock + Ansprechpartner (zweispaltig) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8mm' }}>
          <div style={{ maxWidth: '80mm' }}>
            <div style={{ fontWeight: 700 }}>{displayFirma}</div>
            {vertreterName && <div>{vertreterName}</div>}
            {kontakt && kontakt !== vertreterName && <div>{kontakt}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '9.5pt' }}>
            <div style={{ fontSize: '8pt', color: '#888', marginBottom: '1mm' }}>Ihr persönlicher Ansprechpartner:</div>
            <div style={{ fontWeight: 600 }}>{angebot.ansprechpartner}</div>
            <div>{angebot.ansprechpartnerTitel}</div>
            <div>Tel. {angebot.ansprechpartnerTel}</div>
            <div>{angebot.ansprechpartnerEmail}</div>
          </div>
        </div>

        {/* Datum */}
        <div style={{ textAlign: 'right', marginBottom: '6mm', fontSize: '10.5pt' }}>
          {angebot.datum}
        </div>

        {/* Überschrift */}
        <h1 style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6mm 0' }}>
          Angebot Geschäftsadresse — {angebot.standort}
        </h1>

        {/* Großes Bild */}
        <div style={{ marginTop: '4mm' }}>
          <img
            src={angebot.heroImage || '/images/standorte/weil-am-rhein/green-office.jpg'}
            alt={`bizzcenter ${angebot.standort}`}
            style={{ width: '100%', height: 'auto', maxHeight: '110mm', objectFit: 'cover', borderRadius: '2mm' }}
          />
        </div>

        <PageFooter pageNum={1} totalPages={totalPages} />
      </div>

      {/* ══════════════════ SEITE 2: LEISTUNGEN & PREISE ══════════════════ */}
      <div style={pageStyle}>
        <div style={logoBlockStyle}>
          <img src="/images/logo-bizzcenter.png" alt="bizzcenter" style={{ width: '100%', height: 'auto' }} />
        </div>

        <h2 style={{ ...h2Style, marginTop: '0' }}>Leistungen Servicepaket Geschäftsadresse</h2>

        <p style={{ marginBottom: '4mm' }}>
          {angebot.anrede} {angebot.name}, wir stellen Ihnen eine vollumfängliche, impressumsfähige Geschäftsadresse
          am Standort {angebot.adresse} zur Verfügung.
        </p>

        {/* Firmierungs-Box */}
        <div style={{ border: '1pt solid #333', padding: '4mm 5mm', marginBottom: '5mm', maxWidth: '90mm' }}>
          <div style={{ fontWeight: 700 }}>{displayFirma}{rechtsformLabel ? ` ${rechtsformLabel}` : ''}</div>
          <div>{angebot.adresse}</div>
        </div>

        {/* Inklusive Leistungen */}
        <div style={{ marginBottom: '5mm' }}>
          {inklusivLeistungen.map((l, i) => (
            <div key={i} style={{ marginBottom: '1.5mm' }}>
              <span style={checkStyle}>✓</span>
              <strong>{l.label}</strong> — {l.desc}
            </div>
          ))}
        </div>

        {/* Unser Angebot */}
        <h3 style={h3Style}>Unser Angebot für {angebot.standort}</h3>

        {selectedTarif ? (
          <div>
            <p style={{ marginBottom: '3mm' }}>
              Wir bieten Ihnen die Geschäftsadresse im Tarif <strong>{selectedTarif.name}</strong> ({selectedTarif.label} Laufzeit)
              zu monatlich <strong>{formatEUR(selectedTarif.priceNetto)}</strong> zzgl. MwSt. an.
            </p>

            {allTarife.length > 1 && (
              <div style={{ marginBottom: '4mm' }}>
                <div style={{ fontSize: '9.5pt', color: '#666', marginBottom: '2mm' }}>Alternative Laufzeiten:</div>
                {allTarife.filter(t => t.id !== selectedTarif.id).map(t => (
                  <div key={t.id} style={{ paddingLeft: '4mm', marginBottom: '1mm' }}>
                    • {formatEUR(t.priceNetto)} mtl. bei einer Kündigungsfrist von {t.kuendigung}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p>Bitte wählen Sie einen Tarif aus.</p>
        )}

        {/* Ihr Nutzen */}
        <h3 style={h3Style}>Ihr Nutzen</h3>
        <div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> Ladungsfähige Geschäftsadresse für Handelsregister, Finanzamt und Impressum</div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> Ihre Privatadresse bleibt geschützt</div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> EORI-Nummer und USt-ID beantragbar</div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> Gewerbeanmeldung und Niederlassung in der EU möglich</div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> Post- und Paketannahme inkl. 24/7 Paketabholung</div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> Professionelles Business Center mit über 22 Jahren Erfahrung</div>
          <div style={{ marginBottom: '1.5mm' }}><span style={checkStyle}>✓</span> 300m zur Schweizer Grenze — ideal für Schweizer Unternehmen</div>
        </div>

        {/* Optional zubuchbare Services Teaser */}
        {activeAddons.length > 0 && (
          <>
            <h3 style={h3Style}>Ihre gewählten Zusatzleistungen</h3>
            {Object.entries(addonCategories).map(([cat, addons]) => (
              <div key={cat} style={{ marginBottom: '3mm' }}>
                <div style={{ fontWeight: 600, marginBottom: '1mm' }}>{categoryLabels[cat] || cat}:</div>
                {addons.map(a => (
                  <div key={a.id} style={{ paddingLeft: '4mm', marginBottom: '1mm' }}>
                    <span style={checkStyle}>✓</span>
                    {a.label} — {formatEUR(a.priceNetto)} {a.einmalig ? 'einmalig' : a.unit} zzgl. MwSt.
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        <PageFooter pageNum={2} totalPages={totalPages} />
      </div>

      {/* ══════════════════ SEITE 3: KOSTENÜBERSICHT & ZUSATZOPTIONEN ══════════════════ */}
      <div style={pageStyle}>
        <div style={logoBlockStyle}>
          <img src="/images/logo-bizzcenter.png" alt="bizzcenter" style={{ width: '100%', height: 'auto' }} />
        </div>

        {/* Kostenübersicht */}
        <h2 style={{ ...h2Style, marginTop: '0' }}>Kostenübersicht</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '10pt' }}>
          <thead>
            <tr style={{ borderBottom: '1.5pt solid #333' }}>
              <th style={{ textAlign: 'left', padding: '2mm 0', fontWeight: 700 }}>Position</th>
              <th style={{ textAlign: 'right', padding: '2mm 0', fontWeight: 700 }}>Netto</th>
              <th style={{ textAlign: 'right', padding: '2mm 0', fontWeight: 700 }}>Zeitraum</th>
            </tr>
          </thead>
          <tbody>
            {selectedTarif && (
              <tr style={{ borderBottom: '0.5pt solid #ddd' }}>
                <td style={{ padding: '2mm 0' }}>Geschäftsadresse — Tarif {selectedTarif.name} ({selectedTarif.label})</td>
                <td style={{ textAlign: 'right', padding: '2mm 0' }}>{formatEUR(selectedTarif.priceNetto)}</td>
                <td style={{ textAlign: 'right', padding: '2mm 0' }}>/Monat</td>
              </tr>
            )}
            {monthlyAddons.map(a => (
              <tr key={a.id} style={{ borderBottom: '0.5pt solid #ddd' }}>
                <td style={{ padding: '2mm 0' }}>{a.label}</td>
                <td style={{ textAlign: 'right', padding: '2mm 0' }}>{formatEUR(a.priceNetto)}</td>
                <td style={{ textAlign: 'right', padding: '2mm 0' }}>{a.unit}</td>
              </tr>
            ))}
            {oneTimeAddons.map(a => (
              <tr key={a.id} style={{ borderBottom: '0.5pt solid #ddd' }}>
                <td style={{ padding: '2mm 0' }}>{a.label}</td>
                <td style={{ textAlign: 'right', padding: '2mm 0' }}>{formatEUR(a.priceNetto)}</td>
                <td style={{ textAlign: 'right', padding: '2mm 0' }}>einmalig</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1.5pt solid #333' }}>
              <td style={{ padding: '3mm 0', fontWeight: 700, fontSize: '11pt' }}>Monatlich gesamt</td>
              <td style={{ textAlign: 'right', padding: '3mm 0', fontWeight: 700, fontSize: '11pt' }}>
                {formatEUR(jahresvorauskasse ? monatlichNettoRabatt : monatlichNetto)}
              </td>
              <td style={{ textAlign: 'right', padding: '3mm 0', fontWeight: 700 }}>
                /Monat zzgl. MwSt.
              </td>
            </tr>
          </tbody>
        </table>

        {jahresvorauskasse && (
          <p style={{ fontSize: '9pt', color: '#6b7f3e', fontWeight: 600, marginBottom: '3mm' }}>
            ✓ 10% Jahresvorauskasse-Rabatt eingerechnet
          </p>
        )}

        <p style={{ fontSize: '9pt', color: '#666', marginBottom: '6mm' }}>
          Kaution (3 Brutto-Monatsmieten): {formatEUR(kaution)} · Einrichtungsgebühr: EUR 199,- zzgl. MwSt.
          {einmalig > 0 && ` · Einmalige Add-ons: ${formatEUR(einmalig)} zzgl. MwSt.`}
        </p>

        {/* Optional zubuchbare Services (Katalog) */}
        <h2 style={h2Style}>Optional zubuchbare Serviceleistungen</h2>
        <p style={{ fontSize: '9.5pt', color: '#666', marginBottom: '4mm' }}>
          Folgende Leistungen können Sie jederzeit flexibel hinzubuchen:
        </p>

        <div style={{ marginBottom: '3mm' }}>
          <div style={{ fontWeight: 600, marginBottom: '1mm' }}>Coworking:</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Tagespass EUR 29,- pro Tag</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Flatrate 24/7 EUR 249,- /Monat</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Flatrate Randzeiten EUR 139,- /Monat</div>
        </div>

        <div style={{ marginBottom: '3mm' }}>
          <div style={{ fontWeight: 600, marginBottom: '1mm' }}>Aufbewahrung:</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Spind EUR 19,- /Monat</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Aktenschrank (mittel) EUR 27,- /Monat</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Aktenschrank (groß) EUR 47,- /Monat</div>
        </div>

        <div style={{ marginBottom: '3mm' }}>
          <div style={{ fontWeight: 600, marginBottom: '1mm' }}>Parkplatz:</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Parkkarte Areal EUR 49,- /Monat</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Fester Parkplatz EUR 79,- /Monat</div>
        </div>

        <div style={{ marginBottom: '3mm' }}>
          <div style={{ fontWeight: 600, marginBottom: '1mm' }}>Services:</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Scanpaket EUR 49,- /Monat</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Büroservice EUR 69,- /Stunde</div>
          <div style={{ paddingLeft: '4mm', marginBottom: '1mm' }}><span style={checkStyle}>✓</span> Firmenschild EUR 179,- einmalig</div>
        </div>

        <p style={{ fontSize: '9pt', color: '#666', marginTop: '3mm' }}>
          Alle Preise zzgl. 19% MwSt. Zusatzleistungen können jederzeit zum Folgemonat hinzugebucht oder abbestellt werden.
        </p>

        <PageFooter pageNum={3} totalPages={totalPages} />
      </div>

      {/* ══════════════════ SEITE 4: VERTRAGSBEDINGUNGEN ══════════════════ */}
      <div style={lastPageStyle}>
        <div style={logoBlockStyle}>
          <img src="/images/logo-bizzcenter.png" alt="bizzcenter" style={{ width: '100%', height: 'auto' }} />
        </div>

        <h2 style={{ ...h2Style, marginTop: '0', textDecoration: 'underline' }}>Vertragsbedingungen</h2>

        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '3mm' }}>
            <strong>1. Preise:</strong> Alle Preise verstehen sich zzgl. 19% MwSt. sowie Nebenkosten wie Porto, Telefongebühren, Druck, Kopien, Scannen etc.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>2. Vertragsdauer:</strong> Der Vertrag läuft unbefristet. Kündigungsfrist: {selectedTarif?.kuendigung || 'gemäß gewähltem Tarif'}.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>3. Abrechnung:</strong> Monatliche Vorauszahlung gem. Angebot, anfallende Auslagen werden quartalsweise abgerechnet.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>4. Kaution:</strong> Bei Vertragsschluss ist eine unverzinsliche Kaution in Höhe von drei Brutto-Monatspauschalen zu leisten. Zahlung ist <strong>vor</strong> Nutzung erforderlich.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>5. Postservice:</strong> bizzcenter tritt lediglich als Empfangsbote auf. Im Postservice ist die Bearbeitung von 200 Briefen und 10 Paketen pro Monat enthalten. Zusätzliche Kosten: je weiterer Brief EUR 1,50, je weiteres Paket EUR 5,50.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>6. Einrichtung:</strong> Einmalige Einrichtungsgebühr EUR 199,- vorbehaltlich einer positiven Bonitätsauskunft.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>7. Kostenanpassung:</strong> Ab dem zweiten Vertragsjahr wird eine jährliche Kostenanpassung von +2,25% vereinbart.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>8. Nutzungsbedingungen:</strong> Der Kunde verpflichtet sich zur behördlichen Anmeldung der Betriebsstätte. Die Geschäftsadresse darf ausschließlich für legale gewerbliche Zwecke genutzt werden.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>9. Identitätsprüfung:</strong> Gemäß Geldwäschegesetz (§ 2 Abs. 1 Nr. 9) ist die bizzcenter Weil am Rhein GmbH verpflichtet, die Identität des Vertragspartners festzustellen und zu überprüfen.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>10. Haftung:</strong> Die bizzcenter Weil am Rhein GmbH haftet nicht für Verlust oder Beschädigung von Post und Paketen, soweit dies nicht auf grobe Fahrlässigkeit oder Vorsatz zurückzuführen ist.
          </p>
          <p style={{ marginBottom: '3mm' }}>
            <strong>11. Schlussbestimmungen:</strong> Es gelten ausschließlich die AGB der bizzcenter Weil am Rhein GmbH. Es gilt deutsches Recht. Gerichtsstand ist Lörrach.
          </p>
        </div>

        <div style={{ marginTop: '8mm', padding: '4mm 5mm', backgroundColor: '#f0f4e8', borderRadius: '2mm', fontSize: '10pt' }}>
          <strong>Gültigkeit:</strong> Dieses Angebot ist gültig bis <strong>{angebot.gueltigBis}</strong>.
        </div>

        <div style={{ marginTop: '6mm', fontSize: '9pt', color: '#666' }}>
          <p>Angebot-ID: {angebot.slug} · Erstellt am {angebot.datum}</p>
        </div>

        <PageFooter pageNum={4} totalPages={totalPages} />
      </div>
    </div>
  );
}
