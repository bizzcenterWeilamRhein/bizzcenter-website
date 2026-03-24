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
  .angebot-print-root .angebot-screen-view { display: none !important; }
  .angebot-print-root div.angebot-print-view { display: block !important; }
  nav, header, footer, [class*="sticky"], [class*="fixed"], [class*="backdrop"] { display: none !important; }

  @page {
    size: A4 portrait;
    margin: 20mm 25mm 28mm 25mm;
  }

  body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}

/* ─── Print view base ─── */
.angebot-print-view {
  font-family: 'Segoe UI', Calibri, Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.55;
  color: #1a1a1a;
}

/* ─── Section breaks ─── */
.angebot-print-view .print-section {
  page-break-inside: avoid;
  margin-bottom: 4mm;
}
.angebot-print-view .page-break {
  page-break-before: always;
}

/* ─── Footer (repeats on every page via @bottom) ─── */
.angebot-print-view .print-footer-block {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 6.5pt;
  color: #888;
  line-height: 1.5;
  border-top: 0.5pt solid #ddd;
  padding-top: 2mm;
}

/* ─── Logo ─── */
.angebot-print-view .logo-inline {
  float: right;
  width: 38mm;
  margin: 0 0 3mm 5mm;
}
.angebot-print-view .logo-inline img {
  width: 100%;
  height: auto;
}

/* ─── Typography ─── */
.angebot-print-view h2 {
  font-size: 13pt;
  font-weight: 700;
  color: #2C4A7C;
  margin: 6mm 0 3mm 0;
  padding: 0;
  clear: both;
}
.angebot-print-view h3 {
  font-size: 11pt;
  font-weight: 700;
  color: #2C4A7C;
  margin: 4mm 0 2mm 0;
  padding: 0;
}

/* ─── Check items ─── */
.angebot-print-view .check { color: #6b7f3e; font-weight: 700; margin-right: 1.5mm; }

/* ─── Absenderzeile ─── */
.angebot-print-view .absender-zeile {
  font-size: 7pt;
  color: #999;
  border-bottom: 0.5pt solid #ccc;
  padding-bottom: 1mm;
  margin-bottom: 3mm;
  max-width: 85mm;
  text-decoration: underline;
}

/* ─── Address blocks ─── */
.angebot-print-view .addr-block {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4mm;
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

/* ─── Firmierung box ─── */
.angebot-print-view .firmierung-box {
  border: 1pt solid #333;
  padding: 3mm 4mm;
  margin: 3mm 0 4mm 0;
  max-width: 85mm;
  font-size: 10pt;
}

/* ─── Summary box ─── */
.angebot-print-view .summary-box {
  background: #f0f4e8;
  border-left: 3pt solid #6b7f3e;
  padding: 3mm 4mm;
  margin: 3mm 0;
  font-size: 11pt;
  font-weight: 700;
  color: #1a1a1a;
}

/* ─── Price table ─── */
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
.angebot-print-view table.price-table th:nth-child(3) { text-align: right; }
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

/* ─── Validity badge ─── */
.angebot-print-view .validity-badge {
  background: #f0f4e8;
  border-radius: 2mm;
  padding: 3mm 4mm;
  margin-top: 5mm;
  font-size: 10pt;
}

/* ─── Vertragsbedingungen ─── */
.angebot-print-view .vb-item {
  margin-bottom: 2mm;
  font-size: 8.5pt;
  line-height: 1.5;
}
.angebot-print-view .vb-item strong { color: #1a1a1a; }

/* ─── Addon columns ─── */
.angebot-print-view .addon-grid {
  column-count: 2;
  column-gap: 6mm;
  font-size: 9pt;
}
.angebot-print-view .addon-cat { margin-bottom: 2.5mm; break-inside: avoid; }
.angebot-print-view .addon-cat-title { font-weight: 600; margin-bottom: 0.5mm; font-size: 9.5pt; }
.angebot-print-view .addon-item { padding-left: 4mm; margin-bottom: 0.5mm; font-size: 9pt; }
`;

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
  const nettoMonat = jahresvorauskasse ? monatlichNettoRabatt : monatlichNetto;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="angebot-print-view" style={{ display: 'none' }}>

        {/* ── Repeating footer (position: fixed repeats on every print page in Chrome) ── */}
        <div className="print-footer-block">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div>bizzcenter Weil am Rhein GmbH | Im Schwarzenbach 4 | 79576 Weil am Rhein</div>
              <div>Geschäftsführer: Torben Götz | AG Freiburg HRB 720019</div>
              <div>Tel. +49 (0)7621 9165547 | weilamrhein@bizzcenter.de | www.bizzcenter.de</div>
              <div>Sparkasse Markgräflerland | IBAN DE87 6905 1410 0007 0844 37</div>
            </div>
          </div>
        </div>

        {/* ════════════════ SEITE 1: DECKBLATT ════════════════ */}

        <div className="logo-inline"><img src="/images/logo-bizzcenter.png" alt="bizzcenter" /></div>

        <div className="absender-zeile">
          bizzcenter Weil am Rhein GmbH · Im Schwarzenbach 4 · 79576 Weil am Rhein
        </div>

        <div className="addr-block">
          <div className="addr-left">
            <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>{displayFirma}</div>
            {vertreterName && <div>{vertreterName}</div>}
            {kontakt && kontakt !== vertreterName && <div>{kontakt}</div>}
            {email && <div style={{ fontSize: '9pt', color: '#666' }}>{email}</div>}
          </div>
          <div className="addr-right">
            <div className="label">Ihr Ansprechpartner:</div>
            <div style={{ fontWeight: 600 }}>{angebot.ansprechpartner}</div>
            <div>{angebot.ansprechpartnerTitel}</div>
            <div>Tel. {angebot.ansprechpartnerTel}</div>
            <div>{angebot.ansprechpartnerEmail}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: '4mm', fontSize: '10pt', clear: 'both' }}>
          {angebot.datum}
        </div>

        <h2 style={{ fontSize: '15pt', margin: '0 0 4mm 0' }}>
          Angebot Geschäftsadresse — {angebot.standort}
        </h2>

        <p style={{ margin: '0 0 4mm 0', fontSize: '10pt', lineHeight: 1.6 }}>
          {angebot.anrede} {angebot.name}, vielen Dank für Ihr Interesse. Wir freuen uns,
          Ihnen ein persönliches Angebot für Ihre Geschäftsadresse im bizzcenter {angebot.standort} zu unterbreiten.
        </p>

        <div style={{ margin: '2mm 0', borderRadius: '2mm', overflow: 'hidden' }}>
          <img
            src={angebot.heroImage || '/images/standorte/weil-am-rhein/green-office.jpg'}
            alt={`bizzcenter ${angebot.standort}`}
            style={{ width: '100%', height: '50mm', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2mm', fontSize: '8.5pt', color: '#888' }}>
          <span>Angebot-Nr. {angebot.slug.toUpperCase()}</span>
          <span>Gültig bis {angebot.gueltigBis}</span>
        </div>

        {/* ════════════════ SEITE 2: LEISTUNGEN ════════════════ */}
        <div className="page-break" />

        <div className="logo-inline"><img src="/images/logo-bizzcenter.png" alt="bizzcenter" /></div>

        <h2 style={{ marginTop: '0' }}>Leistungen Servicepaket Geschäftsadresse</h2>

        <p style={{ margin: '0 0 3mm 0' }}>
          Vollumfängliche, impressumsfähige Geschäftsadresse
          am Standort {angebot.adresse}:
        </p>

        <div className="firmierung-box">
          <div style={{ fontWeight: 700 }}>{displayFirma}{rechtsformLabel ? ` ${rechtsformLabel}` : ''}</div>
          <div>{angebot.adresse}</div>
        </div>

        <div style={{ margin: '3mm 0 4mm 0' }}>
          {inklusivLeistungen.map((l, i) => (
            <div key={i} style={{ marginBottom: '1.2mm', lineHeight: 1.5 }}>
              <span className="check">✓</span>
              <strong>{l.label}</strong> — {l.desc}
            </div>
          ))}
        </div>

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

        {/* ════════════════ SEITE 3: KOSTEN & SERVICES ════════════════ */}
        <div className="page-break" />

        <div className="logo-inline"><img src="/images/logo-bizzcenter.png" alt="bizzcenter" /></div>

        <h2 style={{ marginTop: '0' }}>Kostenübersicht</h2>

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

        <div style={{ fontSize: '8.5pt', color: '#666', margin: '2mm 0 4mm', lineHeight: 1.6 }}>
          Einrichtungsgebühr und Kaution ({fmtEUR(kaution)}, 3 Brutto-Monatsmieten) werden nach Vertragsunterzeichnung separat in Rechnung gestellt.
          {einmalig > 0 && <> · Einmalige Add-ons: {fmtEUR(einmalig)} zzgl. MwSt.</>}
        </div>

        <div className="summary-box" style={{ fontSize: '12pt' }}>
          Ihr Monatspreis: {fmtEUR(nettoMonat)} zzgl. MwSt.
        </div>

        <h3 style={{ marginTop: '6mm' }}>Optional zubuchbare Serviceleistungen</h3>
        <p style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 2mm' }}>
          Jederzeit flexibel hinzubuchbar. Alle Preise zzgl. 19 % MwSt.
        </p>

        <div className="addon-grid">
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

        {/* ════════════════ SEITE 4: VERTRAGSBEDINGUNGEN ════════════════ */}
        <div className="page-break" />

        <div className="logo-inline"><img src="/images/logo-bizzcenter.png" alt="bizzcenter" /></div>

        <h2 style={{ marginTop: '0' }}>Vertragsbedingungen</h2>

        <div style={{ marginTop: '2mm' }}>
          <div className="vb-item"><strong>1. Preise:</strong> Alle Preise zzgl. 19 % MwSt. sowie Nebenkosten (Porto, Telefon, Druck, Kopien, Scan).</div>
          <div className="vb-item"><strong>2. Vertragsdauer:</strong> Unbefristet. Kündigungsfrist: {selectedTarif?.kuendigung || 'gemäß Tarif'}. Automatische Verlängerung bei nicht fristgerechter Kündigung.</div>
          <div className="vb-item"><strong>3. Abrechnung:</strong> Monatliche Vorauszahlung. Anfallende Auslagen quartalsweise.</div>
          <div className="vb-item"><strong>4. Kaution:</strong> Drei Brutto-Monatsmieten, unverzinst. Wird nach Vertragsunterzeichnung separat in Rechnung gestellt.</div>
          <div className="vb-item"><strong>5. Postservice:</strong> bizzcenter agiert als Empfangsbote. Inklusive: 200 Briefe und 10 Pakete/Monat. Darüber hinaus: EUR 1,50 je Brief, EUR 5,50 je Paket.</div>
          <div className="vb-item"><strong>6. Einrichtung:</strong> Einmalig EUR 199,- zzgl. MwSt. Wird nach Vertragsunterzeichnung separat berechnet.</div>
          <div className="vb-item"><strong>7. Kostenanpassung:</strong> Ab dem zweiten Vertragsjahr jährlich +2,25 %.</div>
          <div className="vb-item"><strong>8. Negativ-Bestätigung:</strong> Der Kunde stellt, vertreibt oder unterstützt keine militärischen, nukleartechnischen oder dem Allgemeinwohl zuwider handelnde Produkte oder Services.</div>
          <div className="vb-item"><strong>9. Pflichten:</strong> Behördliche Anmeldung der Betriebsstätte. Es gelten die AGB der bizzcenter Weil am Rhein GmbH.</div>
          <div className="vb-item"><strong>10. Identitätsprüfung:</strong> Gemäß GwG (§ 2 Abs. 1 Nr. 9). Personalausweis erforderlich. Unterlagen werden 5 Jahre aufbewahrt.</div>
          <div className="vb-item"><strong>11. Schlussbestimmungen:</strong> Vertrag kommt durch konkludente Nutzung zustande. Deutsches Recht. Gerichtsstand: Lörrach.</div>
        </div>

        <div className="validity-badge">
          <strong>Gültigkeit:</strong> Dieses Angebot ist gültig bis <strong>{angebot.gueltigBis}</strong>.
        </div>

        <div style={{ marginTop: '4mm', fontSize: '8pt', color: '#888' }}>
          Angebot-Nr. {angebot.slug.toUpperCase()} · Erstellt am {angebot.datum} · {angebot.standort}
        </div>
      </div>
    </>
  );
}
