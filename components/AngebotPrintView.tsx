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
  firmenname: string;
  rechtsformLabel: string;
  vertreterName: string;
  kontakt: string;
  email: string;
}

/* ─────────────────────── HELPER ─────────────────────── */

function fmtEUR(n: number): string {
  if (Number.isInteger(n)) return `EUR ${n},-`;
  return `EUR ${n.toFixed(2).replace('.', ',')}`;
}

/* ─────────────────────── PRINT CSS ─────────────────────── */

const PRINT_CSS = `
@media print {
  /* Show print view, hide screen */
  .angebot-print-root .angebot-screen-view { display: none !important; }
  .angebot-print-root div.angebot-print-view { display: block !important; }
  nav, header, footer, [class*="sticky"], [class*="fixed"], [class*="backdrop"] { display: none !important; }

  @page { size: A4 portrait; margin: 0; }
  body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}

/* Print view base styles (apply in both screen-preview and print) */
.angebot-print-view {
  font-family: 'Segoe UI', Calibri, Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.55;
  color: #1a1a1a;
}
.angebot-print-view .page {
  width: 210mm;
  min-height: 297mm;
  padding: 22mm 25mm 38mm 25mm;
  position: relative;
  box-sizing: border-box;
  background: #fff;
  page-break-after: always;
  page-break-inside: avoid;
}
.angebot-print-view .page:last-child {
  page-break-after: auto;
}

/* Logo block */
.angebot-print-view .logo-block {
  position: absolute;
  top: 18mm;
  right: 25mm;
  width: 38mm;
}
.angebot-print-view .logo-block img {
  width: 100%;
  height: auto;
}

/* Footer */
.angebot-print-view .page-footer {
  position: absolute;
  bottom: 8mm;
  left: 25mm;
  right: 25mm;
  font-size: 6.5pt;
  color: #888;
  line-height: 1.5;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* Absenderzeile (Fensterzeile) */
.angebot-print-view .absender-zeile {
  font-size: 7pt;
  color: #999;
  border-bottom: 0.5pt solid #ccc;
  padding-bottom: 1mm;
  margin-bottom: 3mm;
  max-width: 85mm;
  text-decoration: underline;
}

/* Section headings */
.angebot-print-view h2 {
  font-size: 13pt;
  font-weight: 700;
  color: #2C4A7C;
  margin: 0 0 3mm 0;
  padding: 0;
}
.angebot-print-view h3 {
  font-size: 11pt;
  font-weight: 700;
  color: #2C4A7C;
  margin: 4mm 0 2mm 0;
  padding: 0;
}

/* Check items */
.angebot-print-view .check { color: #6b7f3e; font-weight: 700; margin-right: 1.5mm; }

/* Address box */
.angebot-print-view .firmierung-box {
  border: 1pt solid #333;
  padding: 3mm 4mm;
  margin: 3mm 0 4mm 0;
  max-width: 85mm;
  font-size: 10pt;
}

/* Price table */
.angebot-print-view table.price-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.5pt;
  margin: 3mm 0;
}
.angebot-print-view table.price-table th {
  text-align: left;
  font-weight: 700;
  padding: 1.5mm 0;
  border-bottom: 1.5pt solid #333;
  font-size: 9pt;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.3pt;
}
.angebot-print-view table.price-table th:nth-child(2),
.angebot-print-view table.price-table th:nth-child(3) {
  text-align: right;
}
.angebot-print-view table.price-table td {
  padding: 1.5mm 0;
  border-bottom: 0.5pt solid #e0e0e0;
  vertical-align: top;
}
.angebot-print-view table.price-table td:nth-child(2),
.angebot-print-view table.price-table td:nth-child(3) {
  text-align: right;
  white-space: nowrap;
}
.angebot-print-view table.price-table tr.total td {
  border-top: 1.5pt solid #333;
  border-bottom: none;
  font-weight: 700;
  font-size: 10.5pt;
  padding-top: 2mm;
}

/* Summary box */
.angebot-print-view .summary-box {
  background: #f0f4e8;
  border-left: 3pt solid #6b7f3e;
  padding: 3mm 4mm;
  margin: 4mm 0;
  font-size: 11pt;
  font-weight: 700;
  color: #1a1a1a;
}

/* Validity badge */
.angebot-print-view .validity-badge {
  background: #f0f4e8;
  border-radius: 2mm;
  padding: 3mm 4mm;
  margin-top: 5mm;
  font-size: 10pt;
}

/* Vertragsbedingungen */
.angebot-print-view .vb-item {
  margin-bottom: 2.5mm;
  font-size: 8.5pt;
  line-height: 1.5;
}
.angebot-print-view .vb-item strong {
  color: #1a1a1a;
}

/* Two-column address block */
.angebot-print-view .addr-block {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6mm;
}
.angebot-print-view .addr-left { max-width: 85mm; }
.angebot-print-view .addr-right {
  text-align: right;
  font-size: 9pt;
  max-width: 65mm;
}
.angebot-print-view .addr-right .label {
  font-size: 7.5pt;
  color: #888;
  margin-bottom: 0.5mm;
}

/* Addon category */
.angebot-print-view .addon-cat {
  margin-bottom: 2.5mm;
}
.angebot-print-view .addon-cat-title {
  font-weight: 600;
  margin-bottom: 0.5mm;
  font-size: 9.5pt;
}
.angebot-print-view .addon-item {
  padding-left: 4mm;
  margin-bottom: 0.5mm;
  font-size: 9.5pt;
}
`;

/* ─────────────────────── FOOTER ─────────────────────── */

function Footer({ pageNum, totalPages }: { pageNum: number; totalPages: number }) {
  return (
    <div className="page-footer">
      <div>
        <div>bizzcenter Weil am Rhein GmbH | Im Schwarzenbach 4 | 79576 Weil am Rhein</div>
        <div>Geschäftsführer: Torben Götz | AG Freiburg HRB 720019</div>
        <div>Tel. +49 (0)7621 9165547 | weilamrhein@bizzcenter.de | www.bizzcenter.de</div>
        <div>Sparkasse Markgräflerland | IBAN DE87 6905 1410 0007 0844 37</div>
      </div>
      <div style={{ fontSize: '7.5pt', whiteSpace: 'nowrap' }}>Seite {pageNum} von {totalPages}</div>
    </div>
  );
}

function Logo() {
  return (
    <div className="logo-block">
      <img src="/images/logo-bizzcenter-print.svg" alt="bizzcenter" />
    </div>
  );
}

/* ─────────────────────── MAIN ─────────────────────── */

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
  const nettoMonat = jahresvorauskasse ? monatlichNettoRabatt : monatlichNetto;

  const categoryLabels: Record<string, string> = {
    post: 'Post & Digitalisierung', coworking: 'Coworking & Arbeitsplatz',
    aufbewahrung: 'Aufbewahrung', parkplatz: 'Parken', service: 'Services & Extras',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="angebot-print-view" style={{ display: 'none' }}>

        {/* ═══════ SEITE 1: DECKBLATT ═══════ */}
        <div className="page">
          <Logo />

          {/* Absenderzeile */}
          <div className="absender-zeile" style={{ marginTop: '3mm' }}>
            bizzcenter Weil am Rhein GmbH · Im Schwarzenbach 4 · 79576 Weil am Rhein
          </div>

          {/* Adressblock zweispaltig */}
          <div className="addr-block">
            <div className="addr-left">
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>{displayFirma}</div>
              {vertreterName && <div>{vertreterName}</div>}
              {kontakt && kontakt !== vertreterName && <div>{kontakt}</div>}
              {email && <div style={{ fontSize: '9pt', color: '#666' }}>{email}</div>}
            </div>
            <div className="addr-right">
              <div className="label">Ihr persönlicher Ansprechpartner:</div>
              <div style={{ fontWeight: 600 }}>{angebot.ansprechpartner}</div>
              <div>{angebot.ansprechpartnerTitel}</div>
              <div>Tel. {angebot.ansprechpartnerTel}</div>
              <div>{angebot.ansprechpartnerEmail}</div>
            </div>
          </div>

          {/* Datum */}
          <div style={{ textAlign: 'right', marginBottom: '5mm', fontSize: '10pt' }}>
            {angebot.datum}
          </div>

          {/* Betreff */}
          <h1 style={{ fontSize: '15pt', fontWeight: 700, color: '#2C4A7C', margin: '0 0 5mm 0', lineHeight: 1.3 }}>
            Angebot Geschäftsadresse<br />
            {angebot.standort}
          </h1>

          {/* Intro-Text */}
          <p style={{ margin: '0 0 5mm 0', fontSize: '10pt', lineHeight: 1.6 }}>
            {angebot.anrede} {angebot.name}, vielen Dank für Ihr Interesse. Wir freuen uns,
            Ihnen nachfolgend ein persönliches Angebot für Ihre Geschäftsadresse im bizzcenter {angebot.standort} zu unterbreiten.
          </p>

          {/* Hauptbild */}
          <div style={{ margin: '3mm 0', borderRadius: '2mm', overflow: 'hidden' }}>
            <img
              src={angebot.heroImage || '/images/standorte/weil-am-rhein/green-office.jpg'}
              alt={`bizzcenter ${angebot.standort}`}
              style={{ width: '100%', height: '60mm', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Angebotsnummer & Gültigkeit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3mm', fontSize: '8.5pt', color: '#888' }}>
            <span>Angebot-Nr. {angebot.slug.toUpperCase()}</span>
            <span>Gültig bis {angebot.gueltigBis}</span>
          </div>

          <Footer pageNum={1} totalPages={totalPages} />
        </div>

        {/* ═══════ SEITE 2: LEISTUNGEN & PREISE ═══════ */}
        <div className="page">
          <Logo />

          <h2>Leistungen Servicepaket Geschäftsadresse</h2>

          <p style={{ margin: '0 0 3mm 0' }}>
            Wir stellen Ihnen eine vollumfängliche, impressumsfähige Geschäftsadresse
            am Standort {angebot.adresse} zur Verfügung:
          </p>

          {/* Firmierungs-Box */}
          <div className="firmierung-box">
            <div style={{ fontWeight: 700 }}>{displayFirma}{rechtsformLabel ? ` ${rechtsformLabel}` : ''}</div>
            <div>{angebot.adresse}</div>
          </div>

          {/* Inklusive Leistungen */}
          <div style={{ margin: '3mm 0 4mm 0' }}>
            {inklusivLeistungen.map((l, i) => (
              <div key={i} style={{ marginBottom: '1.2mm', lineHeight: 1.5 }}>
                <span className="check">✓</span>
                <strong>{l.label}</strong> — {l.desc}
              </div>
            ))}
          </div>

          {/* Preisangebot */}
          <h3>Unser Angebot</h3>

          {selectedTarif && (
            <>
              <div className="summary-box">
                Tarif {selectedTarif.name} ({selectedTarif.label}) — {fmtEUR(selectedTarif.priceNetto)} /Monat zzgl. MwSt.
              </div>

              {allTarife.length > 1 && (
                <div style={{ margin: '2mm 0 3mm 0', fontSize: '9pt' }}>
                  <div style={{ color: '#666', marginBottom: '1mm' }}>Alternative Laufzeiten:</div>
                  {allTarife.filter(t => t.id !== selectedTarif.id).map(t => (
                    <div key={t.id} style={{ paddingLeft: '4mm', marginBottom: '0.5mm' }}>
                      • {fmtEUR(t.priceNetto)} mtl. — {t.label} Laufzeit, Kündigung {t.kuendigung}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Ihr Nutzen */}
          <h3>Ihr Nutzen</h3>
          <div style={{ marginBottom: '3mm' }}>
            {[
              'Ladungsfähige Geschäftsadresse für Handelsregister, Finanzamt und Impressum',
              'Ihre Privatadresse bleibt geschützt',
              'EORI-Nummer und USt-ID beantragbar',
              'Gewerbeanmeldung und EU-Niederlassung möglich',
              'Post- und Paketannahme inkl. 24/7 Paketabholung',
              'Professionelles Business Center mit über 22 Jahren Erfahrung',
              '300 m zur Schweizer Grenze — ideal für Schweizer Unternehmen',
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '0.8mm' }}>
                <span className="check">✓</span> {item}
              </div>
            ))}
          </div>

          <Footer pageNum={2} totalPages={totalPages} />
        </div>

        {/* ═══════ SEITE 3: KOSTENÜBERSICHT & SERVICES ═══════ */}
        <div className="page">
          <Logo />

          <h2>Kostenübersicht</h2>

          <table className="price-table">
            <thead>
              <tr>
                <th style={{ width: '60%' }}>Position</th>
                <th>Netto</th>
                <th>Zeitraum</th>
              </tr>
            </thead>
            <tbody>
              {selectedTarif && (
                <tr>
                  <td>Geschäftsadresse — Tarif {selectedTarif.name} ({selectedTarif.label})</td>
                  <td>{fmtEUR(selectedTarif.priceNetto)}</td>
                  <td>/Monat</td>
                </tr>
              )}
              {monthlyAddons.map(a => (
                <tr key={a.id}>
                  <td>{a.label}</td>
                  <td>{fmtEUR(a.priceNetto)}</td>
                  <td>{a.unit}</td>
                </tr>
              ))}
              {oneTimeAddons.map(a => (
                <tr key={a.id}>
                  <td>{a.label}</td>
                  <td>{fmtEUR(a.priceNetto)}</td>
                  <td>einmalig</td>
                </tr>
              ))}
              <tr className="total">
                <td>Monatlich gesamt</td>
                <td>{fmtEUR(nettoMonat)}</td>
                <td>/Monat zzgl. MwSt.</td>
              </tr>
            </tbody>
          </table>

          {jahresvorauskasse && (
            <div style={{ fontSize: '8.5pt', color: '#6b7f3e', fontWeight: 600, margin: '1mm 0 2mm' }}>
              ✓ 10 % Jahresvorauskasse-Rabatt eingerechnet
            </div>
          )}

          <div style={{ fontSize: '8.5pt', color: '#666', margin: '2mm 0 5mm', lineHeight: 1.6 }}>
            Einrichtungsgebühr: EUR 199,- zzgl. MwSt. (einmalig) · Kaution: {fmtEUR(kaution)} (3 Brutto-Monatsmieten, unverzinst)
            {einmalig > 0 && <> · Einmalige Add-ons: {fmtEUR(einmalig)} zzgl. MwSt.</>}
          </div>

          {/* Gesamtpreis-Box */}
          <div className="summary-box" style={{ fontSize: '12pt' }}>
            Ihr Monatspreis: {fmtEUR(nettoMonat)} zzgl. MwSt.
          </div>

          {/* Optional zubuchbare Services */}
          <h3 style={{ marginTop: '6mm' }}>Optional zubuchbare Serviceleistungen</h3>
          <p style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 2mm' }}>
            Folgende Leistungen können jederzeit flexibel hinzugebucht werden. Alle Preise zzgl. 19 % MwSt.
          </p>

          <div style={{ columnCount: 2, columnGap: '6mm', fontSize: '9pt' }}>
            <div className="addon-cat">
              <div className="addon-cat-title">Coworking:</div>
              <div className="addon-item"><span className="check">✓</span> Tagespass EUR 29,- /Tag</div>
              <div className="addon-item"><span className="check">✓</span> Flatrate 24/7 EUR 249,- /Mon.</div>
              <div className="addon-item"><span className="check">✓</span> Randzeiten EUR 139,- /Mon.</div>
            </div>
            <div className="addon-cat">
              <div className="addon-cat-title">Aufbewahrung:</div>
              <div className="addon-item"><span className="check">✓</span> Spind EUR 19,- /Mon.</div>
              <div className="addon-item"><span className="check">✓</span> Aktenschrank (M) EUR 27,- /Mon.</div>
              <div className="addon-item"><span className="check">✓</span> Aktenschrank (L) EUR 47,- /Mon.</div>
            </div>
            <div className="addon-cat">
              <div className="addon-cat-title">Parkplatz:</div>
              <div className="addon-item"><span className="check">✓</span> Parkkarte EUR 49,- /Mon.</div>
              <div className="addon-item"><span className="check">✓</span> Fest EUR 79,- /Mon.</div>
            </div>
            <div className="addon-cat">
              <div className="addon-cat-title">Services:</div>
              <div className="addon-item"><span className="check">✓</span> Scanpaket EUR 49,- /Mon.</div>
              <div className="addon-item"><span className="check">✓</span> Büroservice EUR 69,- /Std.</div>
              <div className="addon-item"><span className="check">✓</span> Firmenschild EUR 179,- einm.</div>
            </div>
          </div>

          <Footer pageNum={3} totalPages={totalPages} />
        </div>

        {/* ═══════ SEITE 4: VERTRAGSBEDINGUNGEN ═══════ */}
        <div className="page">
          <Logo />

          <h2 style={{ textDecoration: 'underline', textUnderlineOffset: '2mm' }}>Vertragsbedingungen</h2>

          <div style={{ marginTop: '2mm' }}>
            <div className="vb-item">
              <strong>1. Preise:</strong> Alle Preise verstehen sich zzgl. 19 % MwSt. sowie Nebenkosten (Porto, Telefon, Druck, Kopien, Scan).
            </div>
            <div className="vb-item">
              <strong>2. Vertragsdauer:</strong> Unbefristet. Kündigungsfrist: {selectedTarif?.kuendigung || 'gemäß Tarif'}.
              Automatische Verlängerung um die vereinbarte Laufzeit bei nicht fristgerechter Kündigung.
            </div>
            <div className="vb-item">
              <strong>3. Abrechnung:</strong> Monatliche Vorauszahlung. Anfallende Auslagen quartalsweise.
            </div>
            <div className="vb-item">
              <strong>4. Kaution:</strong> Drei Brutto-Monatsmieten, unverzinst. Zahlung <strong>vor</strong> Nutzungsbeginn erforderlich.
            </div>
            <div className="vb-item">
              <strong>5. Postservice:</strong> bizzcenter agiert als Empfangsbote. Inklusive: 200 Briefe und 10 Pakete/Monat.
              Darüber hinaus: EUR 1,50 je Brief, EUR 5,50 je Paket.
              Post- und Paketannahme nur für die eingetragene Firma und deren Inhaber/Geschäftsführer.
            </div>
            <div className="vb-item">
              <strong>6. Einrichtung:</strong> Einmalig EUR 199,- zzgl. MwSt., vorbehaltlich positiver Bonitätsauskunft.
            </div>
            <div className="vb-item">
              <strong>7. Kostenanpassung:</strong> Ab dem zweiten Vertragsjahr jährlich +2,25 %.
            </div>
            <div className="vb-item">
              <strong>8. Negativ-Bestätigung:</strong> Der Kunde stellt, vertreibt oder unterstützt keine militärischen, nukleartechnischen
              oder dem Allgemeinwohl zuwider handelnde Produkte oder Services.
            </div>
            <div className="vb-item">
              <strong>9. Pflichten:</strong> Der Kunde verpflichtet sich zur behördlichen Anmeldung der Betriebsstätte.
              Es gelten die AGB der bizzcenter Weil am Rhein GmbH.
            </div>
            <div className="vb-item">
              <strong>10. Identitätsprüfung:</strong> Gemäß GwG (§ 2 Abs. 1 Nr. 9) ist die Identität des Vertragspartners
              festzustellen (Personalausweis). Unterlagen werden fünf Jahre aufbewahrt.
            </div>
            <div className="vb-item">
              <strong>11. Schlussbestimmungen:</strong> Durch konkludente Nutzung der Leistungen kommt ein Vertrag zustande.
              Es gilt deutsches Recht. Gerichtsstand ist Lörrach.
            </div>
          </div>

          {/* Gültigkeit */}
          <div className="validity-badge">
            <strong>Gültigkeit:</strong> Dieses Angebot ist gültig bis <strong>{angebot.gueltigBis}</strong>.
          </div>

          {/* Angebots-ID */}
          <div style={{ marginTop: '4mm', fontSize: '8pt', color: '#888' }}>
            Angebot-Nr. {angebot.slug.toUpperCase()} · Erstellt am {angebot.datum} · {angebot.standort}
          </div>

          <Footer pageNum={4} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
