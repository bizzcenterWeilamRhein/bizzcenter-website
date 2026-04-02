'use client';

import React, { useState, useCallback } from 'react';
import SignaturePad from './SignaturePad';

/* ───────────────────────────── TYPES ───────────────────────────── */

interface VertragData {
  slug: string;
  firma: string;
  rechtsform: string;
  vertreter: string;
  vertreterAnrede: string;
  vertreterLabel: string;
  kundeAdresse: string;
  service: 'geschaeftsadresse' | 'servicebuero';
  standort: string;
  adresse: string;
  tarifName: string;
  tarifLaufzeit: string;
  kuendigung: string;
  preisNetto: number;
  preisBrutto: number;
  addons: { label: string; preisNetto: number; preisBrutto: number; unit: string }[];
  einrichtungsgebuehr: number;
  kautionBrutto: number;
  starttermin: string;
  postlimitBriefe: number;
  postlimitPakete: number;
  ansprechpartner: string;
  ansprechpartnerTel: string;
  ansprechpartnerEmail: string;
  angebotSlug: string;
}

/* ───────────────────────────── COMPONENT ───────────────────────────── */

// Rechtsformen ohne Transparenzregisterpflicht
const keinTransparenzregister = ['einzelunternehmen', 'freiberufler', 'ek'];

export default function VertragView({ vertrag, readOnly = false }: { vertrag: VertragData; readOnly?: boolean }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [kundeSignatur, setKundeSignatur] = useState<{ dataUrl: string; timestamp: string; method: string } | null>(null);

  const brauchtTransparenzregister = !keinTransparenzregister.includes(vertrag.rechtsform.toLowerCase());
  const [allSectionsRead, setAllSectionsRead] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<Record<string, { name: string; size: string; timestamp: string }>>({});
  const [zahlungHinterlegt, setZahlungHinterlegt] = useState(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('zahlung') === 'erfolgreich'
  );
  const [docsSkipped, setDocsSkipped] = useState(false);

  const markRead = (id: string) => {
    setAllSectionsRead(prev => new Set(prev).add(id));
  };

  const toggle = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    markRead(id);
  };

  const gesamtNetto = vertrag.preisNetto + vertrag.addons.reduce((s, a) => s + a.preisNetto, 0);
  const gesamtMwst = gesamtNetto * 0.19;
  const gesamtBrutto = gesamtNetto + gesamtMwst;

  const sections = [
    {
      id: 'gegenstand',
      title: '§ 1 Vertragsgegenstand',
      content: (
        <div className="space-y-3">
          <p><strong>1.1.</strong> Die bizzcenter Weil am Rhein GmbH (nachfolgend „bizzcenter") stellt dem Kunden eine vollumfängliche, impressumsfähige Geschäftsadresse am Standort {vertrag.adresse} zur Verfügung.</p>
          <p><strong>1.2.</strong> Der Leistungsumfang umfasst:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Nutzung der Geschäftsadresse für Gewerbeanmeldung, Handelsregister, Impressum und allgemeinen Geschäftsverkehr</li>
            <li>Eigener Briefkasten mit Firmenbeschriftung (keine c/o-Adresse)</li>
            <li>Post- und Paketannahme gemäß § 4</li>
            <li>Nutzung des Empfangsbereichs bei Vor-Ort-Besuchen</li>
          </ul>
          <p><strong>1.3.</strong> Postannahme für:</p>
          <div className="bg-white rounded-lg p-3 border border-border">
            <p className="font-semibold">{vertrag.firma}</p>
            <p>{vertrag.adresse}</p>
          </div>
          <p><strong>1.4.</strong> Nicht enthalten sind darüber hinausgehende Zusatzleistungen (Scanpaket, Coworking, Konferenzräume, Tagesbüros etc.), deren Berechnungsgrundlage den jeweils gültigen Preislisten oder gesonderten Vereinbarungen zu entnehmen sind.</p>
          {vertrag.addons.length > 0 && (
            <>
              <p><strong>1.5.</strong> Folgende Zusatzleistungen sind Bestandteil dieses Vertrags:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                {vertrag.addons.map((a, i) => (
                  <li key={i}>{a.label} — EUR {a.preisNetto.toFixed(2)} netto {a.unit}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'laufzeit',
      title: '§ 2 Vertragsdauer',
      content: (
        <div className="space-y-3">
          <p><strong>2.1.</strong> Das Vertragsverhältnis beginnt am {vertrag.starttermin}. Die Mindestvertragslaufzeit beträgt {vertrag.tarifLaufzeit}.</p>
          <p><strong>2.2.</strong> Die Kündigungsfrist beträgt {vertrag.kuendigung}. Die Kündigung hat schriftlich zu erfolgen.</p>
          <p><strong>2.3.</strong> Der Vertrag verlängert sich automatisch um die vereinbarte Laufzeit, sofern er nicht fristgerecht gekündigt wird.</p>
          <p><strong>2.4.</strong> Der Kunde ist verpflichtet, seinen Geschäftssitz bis zum Ende der Kündigungsfrist an einen anderen Standort zu verlegen und dies dem bizzcenter nachzuweisen. Erfolgt der Nachweis nicht rechtzeitig, kann das bizzcenter nach eigenem Ermessen die Kündigungsfrist angemessen verlängern, bis die Verlegung nachgewiesen ist.</p>
        </div>
      ),
    },
    {
      id: 'verguetung',
      title: '§ 3 Vergütung',
      content: (
        <div className="space-y-3">
          <p><strong>3.1.</strong> Monatliche Vergütung:</p>
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">Geschäftsadresse Tarif {vertrag.tarifName}</td>
                  <td className="px-3 py-2 text-right font-medium">EUR {vertrag.preisNetto.toFixed(2)}</td>
                </tr>
                {vertrag.addons.map((a, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-3 py-2">{a.label}</td>
                    <td className="px-3 py-2 text-right font-medium">EUR {a.preisNetto.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-b border-border">
                  <td className="px-3 py-2">zzgl. 19% MwSt.</td>
                  <td className="px-3 py-2 text-right font-medium">EUR {gesamtMwst.toFixed(2)}</td>
                </tr>
                <tr className="bg-[#f0f4e8] font-bold">
                  <td className="px-3 py-2">Gesamt brutto</td>
                  <td className="px-3 py-2 text-right">EUR {gesamtBrutto.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>3.2.</strong> Die Abrechnung erfolgt monatsweise im Voraus. Anfallende Auslagen und Zusatzgebühren (Porto, Druck, Kopien etc.) werden quartalsweise gesondert in Rechnung gestellt.</p>
          <p><strong>3.3.</strong> Die Zahlung erfolgt über den Zahlungsdienstleister Stripe Inc. Der Kunde hinterlegt eine gültige Zahlungsmethode (Kreditkarte, SEPA-Lastschrift oder vergleichbar) oder wählt die Zahlung auf Rechnung mit einem Zahlungsziel von 14 Tagen.</p>
          <p><strong>3.4.</strong> Es wird eine jährliche Kostenanpassung von 2,25% vereinbart, erstmals 12 Monate nach Vertragsbeginn.</p>
          <p><strong>3.5.</strong> Die einmalige Einrichtungsgebühr beträgt EUR {vertrag.einrichtungsgebuehr.toFixed(2)} zzgl. MwSt. und ist mit der ersten Monatsrechnung fällig.</p>
          <p><strong>3.6.</strong> Alle Preise in diesem Vertrag verstehen sich, soweit nicht anders ausgewiesen, zzgl. der gesetzlichen MwSt.</p>
        </div>
      ),
    },
    {
      id: 'post',
      title: '§ 4 Postbearbeitung',
      content: (
        <div className="space-y-3">
          <p><strong>4.1.</strong> bizzcenter nimmt stellvertretend für den Kunden Post und Pakete entgegen. Die Mitarbeiter des bizzcenter sind ausschließlich zur Entgegennahme berechtigt. Sie können für Einsprüche, Fristen oder andere Reaktionen namens des Kunden keine Verantwortung übernehmen.</p>
          <p><strong>4.2.</strong> Die Organe des Kunden sind selbst verantwortlich, dass Fristen aller Art eingehalten werden. Bei Abwesenheit ist dem bizzcenter rechtzeitig eine handlungsfähige Stellvertretung bekannt zu geben.</p>
          <p><strong>4.3.</strong> Eine Gewährleistung — insbesondere bei Fehlern oder Verzögerungen bei der Weiterleitung von Post oder Nachrichten — wird ausdrücklich ausgeschlossen, soweit dies nicht auf grobe Fahrlässigkeit oder Vorsatz zurückzuführen ist. Die Haftung ist auf den Warenwert, maximal EUR 500, begrenzt.</p>
          <p><strong>4.4.</strong> Für Paketanlieferungen muss den entsprechenden Paketdiensten durch den Kunden eine Abstellerlaubnis erteilt werden.</p>
          <p><strong>4.5.</strong> Inklusive ist die Bearbeitung von {vertrag.postlimitBriefe} Briefen und die Annahme von {vertrag.postlimitPakete} Paketen monatlich. Darüber hinausgehende Mengen werden nach aktueller Preisliste berechnet.</p>
          <p><strong>4.6.</strong> Vom Leistungsumfang sind ausschließlich Geschäftspakete des Unternehmens und Pakete an den Geschäftsführer/Inhaber erfasst. Privatpakete sind vom Leistungsumfang ausgeschlossen.</p>
        </div>
      ),
    },
    {
      id: 'kaution',
      title: '§ 5 Mietsicherheit',
      content: (
        <div className="space-y-3">
          <p><strong>5.1.</strong> Die unverzinsliche Kaution als Sicherheit beträgt drei Brutto-Monatspauschalen (EUR {vertrag.kautionBrutto.toFixed(2)}).</p>
          <p><strong>5.2.</strong> Die Kaution ist eine Woche vor Vertragsbeginn, spätestens jedoch zu Vertragsbeginn fällig.</p>
          <p><strong>5.3.</strong> Gerät der Kunde mit der Kautionsleistung in Verzug, kann das bizzcenter die Leistungserbringung verweigern, den Vertrag fristlos kündigen oder vom Vertrag zurücktreten.</p>
          <p><strong>5.4.</strong> Mietschulden und offene Forderungen dürfen mit der Kaution verrechnet werden.</p>
          <p><strong>5.5.</strong> Die Kaution wird nach Vertragsende und ordnungsgemäßer Abwicklung aller Verpflichtungen innerhalb von 30 Tagen zurückerstattet.</p>
        </div>
      ),
    },
    {
      id: 'kuendigung',
      title: '§ 6 Außerordentliche Kündigung',
      content: (
        <div className="space-y-3">
          <p><strong>6.1.</strong> Beide Parteien haben das Recht zur fristlosen Kündigung aus wichtigem Grund.</p>
          <p><strong>6.2.</strong> Ein wichtiger Grund liegt für das bizzcenter insbesondere vor bei:</p>
          <ol className="list-[lower-alpha] list-inside ml-2 space-y-1">
            <li>Zahlungsverzug von mehr als zwei Monatsmieten</li>
            <li>Mehrfach unpünktlicher Zahlung trotz Abmahnung</li>
            <li>Erheblicher Belästigung anderer Mieter oder des bizzcenter</li>
            <li>Vertragswidrigem Gebrauch der Geschäftsadresse</li>
            <li>Nutzung der Adresse für illegale, betrügerische oder sittenwidrige Zwecke</li>
          </ol>
          <p><strong>6.3.</strong> Als wichtiger Grund gilt auch die wesentliche Verschlechterung der wirtschaftlichen Verhältnisse des Kunden, insbesondere bei Zahlungseinstellung, Beantragung oder Eröffnung eines Insolvenzverfahrens oder Ablehnung der Eröffnung mangels Masse.</p>
        </div>
      ),
    },
    {
      id: 'nutzung',
      title: '§ 7 Nutzungsbedingungen',
      content: (
        <div className="space-y-3">
          <p><strong>7.1.</strong> Ein Vertretungsrecht wird durch diesen Vertrag ausdrücklich ausgeschlossen. bizzcenter wird optional lediglich als Empfangsbote tätig.</p>
          <p><strong>7.2.</strong> Der Kunde verpflichtet sich, die Geschäftsadresse ausschließlich für legale gewerbliche Zwecke zu nutzen.</p>
          <p><strong>7.3.</strong> Ein Weiterverkauf, eine Weitervermietung oder sonstige — auch unentgeltliche — Überlassung der Leistungen an Dritte ist nicht zulässig.</p>
          <p><strong>7.4.</strong> Der Kunde hat dem bizzcenter unaufgefordert aktuelle Nachweise vorzulegen: {brauchtTransparenzregister ? 'Handelsregisterauszug, Transparenzregister-Auszug sowie' : 'Gewerbeanmeldung sowie'} Ausweiskopie des Inhabers/Geschäftsführers.</p>
          <p><strong>7.5.</strong> Änderungen (Sitz des Unternehmens, Meldeanschrift des Inhabers/Geschäftsführers, Rechtsform etc.) sind dem bizzcenter umgehend mitzuteilen. Die im Vertrag angegebene Anschrift gilt als zustellfähige Adresse, bis der Kunde eine neue mitteilt.</p>
        </div>
      ),
    },
    {
      id: 'kommunikation',
      title: '§ 8 Kommunikation & Zustellungen',
      content: (
        <div className="space-y-3">
          <p><strong>8.1.</strong> E-Mail gilt als wirksamer Kommunikationsweg für alle vertraglichen Angelegenheiten, ausgenommen Kündigungen und Vertragsänderungen.</p>
          <p><strong>8.2.</strong> Kündigungen und Vertragsänderungen bedürfen der Schriftform (Brief oder qualifizierte elektronische Signatur).</p>
        </div>
      ),
    },
    {
      id: 'datenschutz',
      title: '§ 9 Datenschutz',
      content: (
        <div className="space-y-3">
          <p><strong>9.1.</strong> bizzcenter verarbeitet personenbezogene Daten des Kunden ausschließlich zur Vertragserfüllung und auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.</p>
          <p><strong>9.2.</strong> Daten werden nach Vertragsende und Ablauf gesetzlicher Aufbewahrungsfristen gelöscht.</p>
          <p><strong>9.3.</strong> Weitere Details entnehmen Sie unserer <a href="/datenschutz" className="text-[#6b7f3e] underline">Datenschutzerklärung</a>.</p>
        </div>
      ),
    },
    {
      id: 'schluss',
      title: '§ 10 Schlussbestimmungen',
      content: (
        <div className="space-y-3">
          <p><strong>10.1.</strong> Die Vertragssprache ist Deutsch.</p>
          <p><strong>10.2.</strong> Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Lörrach, soweit gesetzlich zulässig.</p>
          <p><strong>10.3.</strong> Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform.</p>
          <p><strong>10.4.</strong> Sollte eine Bestimmung dieses Vertrags ganz oder teilweise unwirksam sein oder werden, bleibt die Gültigkeit der übrigen Bestimmungen unberührt. Anstelle der unwirksamen Bestimmung gelten die gesetzlichen Vorschriften.</p>
          <p><strong>10.5.</strong> Folgende Anlagen sind Bestandteil dieses Vertrags:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Anlage 1: {brauchtTransparenzregister ? 'Handelsregisterauszug' : 'Gewerbeanmeldung'}</li>
            {brauchtTransparenzregister && <li>Anlage 2: Transparenzregister-Auszug</li>}
            <li>Anlage {brauchtTransparenzregister ? '3' : '2'}: Ausweiskopie des Inhabers/Geschäftsführers</li>
            <li>Anlage {brauchtTransparenzregister ? '4' : '3'}: Allgemeine Geschäftsbedingungen</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] print:bg-white">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PRINT-ONLY: Sauberes Vertrags-PDF wie NAXCON-Referenz        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, footer, nav, [role="banner"], [role="contentinfo"], [role="navigation"] { display: none !important; }
          body { margin: 0 !important; padding: 0 !important; }
          @page { margin: 18mm 20mm 25mm 20mm; size: A4; }
          .web-view { display: none !important; }
          .print-view { display: block !important; }
        }
        @media screen {
          .print-view { display: none !important; }
        }
      `}} />

      <div className="print-view" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt', lineHeight: '1.5', color: '#000' }}>
        {/* Titel */}
        <div style={{ textAlign: 'center', marginBottom: '24pt' }}>
          <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 6pt 0' }}>
            Dienstleistungsvertrag Geschäftsadresse
          </h1>
        </div>

        {/* Parteien */}
        <p style={{ marginBottom: '12pt' }}>zwischen</p>
        <p style={{ marginBottom: '2pt' }}><strong>bizzcenter Weil am Rhein GmbH</strong> – bizzcenter –</p>
        <p style={{ marginBottom: '2pt' }}>- vertreten durch den Geschäftsführer Herrn Torben Götz -</p>
        <p style={{ marginBottom: '2pt' }}>Im Schwarzenbach 4</p>
        <p style={{ marginBottom: '16pt' }}>79576 Weil am Rhein</p>

        <p style={{ marginBottom: '12pt' }}>und</p>
        <p style={{ marginBottom: '2pt' }}><strong>{vertrag.firma}</strong> – Kunde –</p>
        <p style={{ marginBottom: '2pt' }}>- vertreten durch {vertrag.vertreterLabel === 'Inhaber' ? 'den Inhaber' : `den ${vertrag.vertreterLabel}`} {vertrag.vertreterAnrede} {vertrag.vertreter} -</p>
        <p style={{ marginBottom: '2pt' }}>{vertrag.kundeAdresse ? vertrag.kundeAdresse.split(',')[0]?.trim() : ''}</p>
        <p style={{ marginBottom: '24pt' }}>{vertrag.kundeAdresse ? vertrag.kundeAdresse.split(',').slice(1).join(',').trim() : ''}</p>

        {/* §§ */}
        {sections.map((s) => (
          <div key={s.id} style={{ marginBottom: '12pt' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '4pt' }}>{s.title}</p>
            <div style={{ fontSize: '10.5pt' }}>{s.content}</div>
          </div>
        ))}

        {/* Unterschriften */}
        <div style={{ marginTop: '36pt', pageBreakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40pt' }}>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '4pt', fontSize: '10pt' }}>Weil am Rhein, den ______________________</p>
              <div style={{ borderBottom: '1px solid #000', height: '60pt', marginBottom: '4pt' }}>
                {/* bizzcenter Unterschrift */}
              </div>
              <p style={{ fontSize: '9pt' }}>bizzcenter Weil am Rhein GmbH / Unterschrift</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '4pt', fontSize: '10pt' }}>_____________________, den ______________________</p>
              <div style={{ borderBottom: '1px solid #000', height: '60pt', marginBottom: '4pt', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kundeSignatur && (
                  <img src={kundeSignatur.dataUrl} alt="Unterschrift" style={{ maxHeight: '56pt', maxWidth: '200pt' }} />
                )}
              </div>
              <p style={{ fontSize: '9pt' }}>Kunde (Unterschrift + Name)</p>
            </div>
          </div>
        </div>

        {/* Footer auf jeder Seite */}
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', textAlign: 'center', fontSize: '7.5pt', color: '#666', borderTop: '0.5pt solid #ccc', paddingTop: '4pt', paddingBottom: '0' }}>
          bizzcenter Weil am Rhein GmbH | Business Center Weil &nbsp;&middot;&nbsp; Im Schwarzenbach 4 | 79576 Weil am Rhein &nbsp;&middot;&nbsp; Geschäftsführer: Torben Götz<br />
          Registergericht: AG Freiburg | Registernummer: HRB 720019
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* WEB-VIEW: Interaktive Ansicht (nur auf Screen)                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="web-view mx-auto max-w-3xl px-4 py-8 md:py-14 space-y-6">

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between print:hidden">
          <a
            href={`/angebot/${vertrag.angebotSlug}`}
            className="inline-flex items-center gap-2 text-sm text-[#6b7f3e] font-medium hover:underline no-underline"
          >
            ← Zurück zum Angebot
          </a>
          <span className="text-xs text-muted-foreground bg-white border border-border rounded-full px-3 py-1 print:hidden">
            {kundeSignatur ? 'Vertrag' : 'Vertragsentwurf'}
          </span>
        </div>

        {/* ── Header ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8 print-no-break">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f0f4e8] flex items-center justify-center print:hidden">
              <svg className="w-7 h-7 text-[#6b7f3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Dienstleistungsvertrag Geschäftsadresse
            </h1>
            <p className="text-sm text-muted-foreground">
              zwischen <strong>bizzcenter Weil am Rhein GmbH</strong> und <strong>{vertrag.firma}</strong>
            </p>
          </div>

          {/* Vertragsparteien */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#f5f5f0] p-4">
              <p className="text-xs font-semibold text-[#6b7f3e] uppercase tracking-wider mb-2">Dienstleister</p>
              <p className="font-semibold text-sm">bizzcenter Weil am Rhein GmbH</p>
              <p className="text-xs text-muted-foreground">vertreten durch den Geschäftsführer Herrn Torben Götz</p>
              <p className="text-xs text-muted-foreground mt-1">Im Schwarzenbach 4, 79576 Weil am Rhein</p>
            </div>
            <div className="rounded-lg bg-[#f5f5f0] p-4">
              <p className="text-xs font-semibold text-[#6b7f3e] uppercase tracking-wider mb-2">Kunde</p>
              <p className="font-semibold text-sm">{vertrag.firma}</p>
              <p className="text-xs text-muted-foreground">
                vertreten durch {vertrag.vertreterAnrede === 'Frau' ? 'die' : 'den'} {vertrag.vertreterLabel} {vertrag.vertreterAnrede} {vertrag.vertreter}
              </p>
              {vertrag.kundeAdresse && <p className="text-xs text-muted-foreground mt-1">{vertrag.kundeAdresse}</p>}
            </div>
          </div>
        </div>

        {/* ── Vertragsübersicht (Kurzfassung) ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8 print-no-break">
          <h2 className="text-lg font-bold text-foreground mb-4">Vertragsübersicht</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg bg-[#f0f4e8] p-3">
              <p className="text-xs text-muted-foreground">Tarif</p>
              <p className="font-bold text-[#6b7f3e]">{vertrag.tarifName}</p>
            </div>
            <div className="rounded-lg bg-[#f0f4e8] p-3">
              <p className="text-xs text-muted-foreground">Laufzeit</p>
              <p className="font-bold text-[#6b7f3e]">{vertrag.tarifLaufzeit}</p>
            </div>
            <div className="rounded-lg bg-[#f0f4e8] p-3">
              <p className="text-xs text-muted-foreground">Monatlich netto</p>
              <p className="font-bold text-[#6b7f3e]">EUR {gesamtNetto.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-[#f0f4e8] p-3">
              <p className="text-xs text-muted-foreground">Beginn</p>
              <p className="font-bold text-[#6b7f3e]">{vertrag.starttermin}</p>
            </div>
          </div>
        </div>

        {/* ── Paragraphen (Accordion) ── */}
        <div className="rounded-2xl border border-border bg-white shadow-sm divide-y divide-border overflow-hidden">
          <div className="p-6 md:px-8">
            <h2 className="text-lg font-bold text-foreground">Vertragsbedingungen</h2>
            <p className="text-xs text-muted-foreground mt-1 print:hidden">Klicken Sie auf einen Paragraphen, um die Details einzusehen.</p>
          </div>
          {sections.map((s) => (
            <div key={s.id}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="w-full flex items-center justify-between px-6 md:px-8 py-4 text-left hover:bg-[#f5f5f0] transition-colors cursor-pointer print:hidden"
              >
                <span className="font-semibold text-sm text-foreground">{s.title}</span>
                <span className={`text-[#6b7f3e] transition-transform duration-200 ${expandedSection === s.id ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              {expandedSection === s.id && (
                <div className="px-6 md:px-8 pb-5 text-sm text-muted-foreground leading-relaxed print:hidden">
                  {s.content}
                </div>
              )}
              {/* Print version: always show all content */}
              <div className="hidden print:block px-6 md:px-8 pb-5">
                <p className="font-semibold text-sm text-foreground mb-2">{s.title}</p>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {s.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Unterschriften-Block ── */}
        <div data-section="unterschrift" className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8">
          {readOnly ? (
            <div className="text-center space-y-4">
              <h2 className="text-lg font-bold text-foreground">Vertragsvorschau</h2>
              <p className="text-sm text-muted-foreground">Dies ist eine Vorschau der Vertragsbedingungen. Um den Vertrag zu unterschreiben, kehren Sie zur Angebotsseite zurück und füllen Sie alle Pflichtfelder aus.</p>
              <a
                href={`/angebot/${vertrag.angebotSlug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#6b7f3e] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm no-underline"
              >
                ← Zurück zum Angebot
              </a>
            </div>
          ) : (
            <>
          <h2 className="text-lg font-bold text-foreground mb-2">Vertrag unterschreiben</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Mit Ihrer Unterschrift schließen Sie den Vertrag rechtskräftig ab. Der Vertrag tritt nach Prüfung Ihrer Unterlagen durch bizzcenter in Kraft.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* bizzcenter Seite */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#6b7f3e] uppercase tracking-wider">Dienstleister</p>
              <div className="rounded-lg border-2 border-[#6b7f3e] bg-[#f0f4e8] p-4">
                <p className="text-xs text-muted-foreground mb-1">Weil am Rhein, den {new Date().toLocaleDateString('de-DE')}</p>
                <div className="h-20 flex items-center justify-center">
                  <p className="text-sm italic text-muted-foreground">Wird nach Prüfung durch bizzcenter unterschrieben</p>
                </div>
              </div>
              <p className="text-sm font-medium">bizzcenter Weil am Rhein GmbH</p>
              <p className="text-xs text-muted-foreground">Torben Götz, Geschäftsführer</p>
            </div>

            {/* Kunde Seite */}
            <div>
              <SignaturePad
                label="Kunde"
                onSignature={async (data) => {
                  setKundeSignatur(data);
                  // Titel im Browser-Tab aktualisieren
                  if (typeof window !== 'undefined') {
                    document.title = `Vertrag Geschäftsadresse – ${vertrag.firma}`;
                  }
                  // Google Ads Conversion: Vertrag unterschrieben
                  if (typeof window !== 'undefined') {
                    (window as any).dataLayer = (window as any).dataLayer || [];
                    (window as any).dataLayer.push({
                      event: 'contract_signed',
                      conversion_value: vertrag.preisNetto,
                      currency: 'EUR',
                    });
                  }

                  // GCLID aus URL oder Cookie
                  const urlParams = new URLSearchParams(window.location.search);
                  const gclid = urlParams.get('gclid') || document.cookie.match(/gclid=([^;]+)/)?.[1] || undefined;

                  // Vertrag an Backend senden
                  try {
                    await fetch('/api/contract', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        slug: vertrag.slug,
                        firma: vertrag.firma,
                        rechtsform: vertrag.rechtsform,
                        vertreter: vertrag.vertreter,
                        vertreterAnrede: vertrag.vertreterAnrede,
                        email: vertrag.ansprechpartnerEmail,
                        telefon: vertrag.ansprechpartnerTel,
                        tarifName: vertrag.tarifName,
                        tarifLaufzeit: vertrag.tarifLaufzeit,
                        preisNetto: vertrag.preisNetto,
                        preisBrutto: vertrag.preisBrutto,
                        addons: vertrag.addons,
                        starttermin: vertrag.starttermin,
                        signatur: data,
                        gclid,
                      }),
                    });
                  } catch (err) {
                    console.error('Contract submission failed:', err);
                  }
                }}
              />
              <div className="mt-2">
                <p className="text-sm font-medium">{vertrag.firma}</p>
                <p className="text-xs text-muted-foreground">{vertrag.vertreterAnrede} {vertrag.vertreter}, {vertrag.vertreterLabel}</p>
              </div>
            </div>
          </div>

          {/* Bestätigungs-Hinweis nach Unterschrift */}
          {kundeSignatur && (
            <div className="mt-6 rounded-lg bg-[#f0f4e8] border border-[#6b7f3e]/30 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#6b7f3e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="font-semibold text-sm text-foreground">Vertrag unterschrieben — der Vertrag ist damit geschlossen.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unterschrieben am {new Date(kundeSignatur.timestamp).toLocaleString('de-DE')} · 
                    Der Vertrag tritt in Kraft, sobald bizzcenter Ihre Unterlagen geprüft und gegengezeichnet hat. Sie erhalten den vollständig unterschriebenen Vertrag als PDF per E-Mail.
                  </p>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* ── Dokumente hochladen (nur nach Unterschrift) ── */}
        {kundeSignatur && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-white shadow-sm p-6 md:p-8 print:hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#f0f4e8] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#6b7f3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Dokumente hochladen</h2>
                <p className="text-xs text-muted-foreground">Laden Sie die erforderlichen Unterlagen hoch, um den Vertrag abzuschließen.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { id: 'ausweis', label: 'Personalausweis / Reisepass', desc: `Ausweiskopie ${vertrag.vertreterLabel} (Vorder- & Rückseite)`, required: true },
                ...(brauchtTransparenzregister
                  ? [
                      { id: 'handelsregister', label: 'Handelsregisterauszug', desc: 'Aktueller Auszug (nicht älter als 3 Monate)', required: true },
                      { id: 'transparenzregister', label: 'Transparenzregister-Auszug', desc: 'Nachweis der wirtschaftlich Berechtigten', required: true },
                    ]
                  : [
                      { id: 'gewerbeanmeldung', label: 'Gewerbeanmeldung', desc: 'Kopie der Gewerbeanmeldung', required: true },
                    ]
                ),

              ].map((doc) => (
                <div key={doc.id} className={`rounded-lg border-2 p-4 transition-colors ${
                  uploads[doc.id] ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-dashed border-border bg-[#f5f5f0]'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{doc.label}</p>
                        {doc.required && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Pflicht</span>}
                        {!doc.required && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Optional</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                      {uploads[doc.id] && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[#6b7f3e]">✓</span>
                          <span className="text-xs text-foreground font-medium">{uploads[doc.id].name}</span>
                          <span className="text-[10px] text-muted-foreground">({uploads[doc.id].size})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...uploads };
                              delete next[doc.id];
                              setUploads(next);
                            }}
                            className="text-[10px] text-red-500 hover:underline ml-1 cursor-pointer"
                          >
                            Entfernen
                          </button>
                        </div>
                      )}
                    </div>
                    {!uploads[doc.id] && (
                      <div className="shrink-0 flex flex-col gap-1.5">
                        {/* Kamera-Button (Mobile: öffnet Kamera direkt) */}
                        <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#6b7f3e] text-white px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg> Fotografieren
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const size = file.size < 1024 * 1024
                                ? `${(file.size / 1024).toFixed(0)} KB`
                                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                              setUploads(prev => ({
                                ...prev,
                                [doc.id]: { name: file.name, size, timestamp: new Date().toISOString() }
                              }));
                            }}
                          />
                        </label>
                        {/* Datei-Upload */}
                        <label className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-[#f0f4e8] hover:border-[#6b7f3e] transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg> Datei wählen
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const size = file.size < 1024 * 1024
                                ? `${(file.size / 1024).toFixed(0)} KB`
                                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                              setUploads(prev => ({
                                ...prev,
                                [doc.id]: { name: file.name, size, timestamp: new Date().toISOString() }
                              }));
                            }}
                          />
                        </label>
                      </div>
                    )}
                    {uploads[doc.id] && (
                      <span className="w-8 h-8 rounded-full bg-[#6b7f3e] text-white flex items-center justify-center text-sm shrink-0">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fortschritt */}
            {(() => {
              const requiredDocs = brauchtTransparenzregister
                ? ['ausweis', 'handelsregister', 'transparenzregister']
                : ['ausweis', 'gewerbeanmeldung'];
              const uploaded = requiredDocs.filter(d => uploads[d]);
              const allDone = uploaded.length === requiredDocs.length;
              return (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Pflichtdokumente: {uploaded.length} von {requiredDocs.length}</span>
                    {allDone && <span className="text-[#6b7f3e] font-semibold">✓ Vollständig</span>}
                  </div>
                  <div className="w-full h-2 bg-[#e8e3d6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6b7f3e] rounded-full transition-all duration-500"
                      style={{ width: `${(uploaded.length / requiredDocs.length) * 100}%` }}
                    />
                  </div>
                  {allDone && (
                    <div className="mt-4 rounded-lg bg-[#f0f4e8] border border-[#6b7f3e]/30 p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#6b7f3e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Alles vollständig!</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vertrag unterschrieben und alle Dokumente hochgeladen. Wir prüfen Ihre Unterlagen und melden uns innerhalb von 24 Stunden bei Ihnen.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!allDone && !docsSkipped && (
                    <button
                      type="button"
                      onClick={() => setDocsSkipped(true)}
                      className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-[#6b7f3e] underline cursor-pointer transition-colors"
                    >
                      Dokumente später per E-Mail nachreichen →
                    </button>
                  )}
                  {docsSkipped && !allDone && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        <p className="text-xs text-amber-800">
                          Kein Problem — Sie können die fehlenden Dokumente auch per E-Mail an <a href={`mailto:${vertrag.ansprechpartnerEmail}`} className="font-semibold underline">{vertrag.ansprechpartnerEmail}</a> nachreichen. Der Vertrag wird erst nach vollständiger Prüfung aktiviert.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Zahlung via Stripe (nach Unterschrift + Dokumente) ── */}
        {kundeSignatur && (() => {
          const requiredDocs = brauchtTransparenzregister
            ? ['ausweis', 'handelsregister', 'transparenzregister']
            : ['ausweis', 'gewerbeanmeldung'];
          const allDocsUploaded = requiredDocs.every(d => uploads[d]);
          if (!allDocsUploaded && !docsSkipped) return null;
          return (
            <div className="rounded-2xl border-2 border-[#6b7f3e] bg-white shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#f0f4e8] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#6b7f3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Zahlung einrichten</h2>
                  <p className="text-xs text-muted-foreground">Letzter Schritt — hinterlegen Sie Ihre Zahlungsmethode über unseren sicheren Zahlungsdienstleister Stripe.</p>
                </div>
              </div>

              {!zahlungHinterlegt ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-lg bg-[#f5f5f0] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monatliche Miete</span>
                      <span className="font-bold text-foreground">EUR {gesamtBrutto.toFixed(2)} brutto</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>EUR {gesamtNetto.toFixed(2)} netto + EUR {gesamtMwst.toFixed(2)} MwSt.</span>
                      <span>Abbuchung monatlich im Voraus</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-[#f5f5f0] rounded border border-border">Visa</span>
                    <span className="text-xs px-2 py-0.5 bg-[#f5f5f0] rounded border border-border">Mastercard</span>
                    <span className="text-xs px-2 py-0.5 bg-[#f5f5f0] rounded border border-border">SEPA</span>
                    <span className="text-xs px-2 py-0.5 bg-[#f5f5f0] rounded border border-border">Giropay</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // Tarif-Key für Stripe bestimmen
                        const tarifMap: Record<string, string> = {
                          'Langzeit': vertrag.addons.length > 0 ? 'ga_langzeit_mit' : 'ga_langzeit_ohne',
                          'Standard': vertrag.addons.length > 0 ? 'ga_standard_mit' : 'ga_standard_ohne',
                          'Flex': vertrag.addons.length > 0 ? 'ga_flex_mit' : 'ga_flex_ohne',
                        };
                        const priceId = tarifMap[vertrag.tarifName] || 'ga_standard_ohne';

                        const res = await fetch('/api/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId,
                            customerEmail: vertrag.ansprechpartnerEmail,
                            customerName: vertrag.vertreter,
                            firma: vertrag.firma,
                            successUrl: `${window.location.origin}/vertrag/${vertrag.slug}?zahlung=erfolgreich`,
                            cancelUrl: `${window.location.origin}/vertrag/${vertrag.slug}?zahlung=abgebrochen`,
                          }),
                        });
                        const data = await res.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          alert('Fehler beim Erstellen der Zahlungssitzung. Bitte versuchen Sie es erneut.');
                        }
                      } catch (err) {
                        console.error('Stripe checkout error:', err);
                        alert('Verbindungsfehler. Bitte versuchen Sie es erneut.');
                      }
                    }}
                    className="w-full rounded-lg bg-[#6b7f3e] text-white py-3.5 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Weiter zur Zahlung
                  </button>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    Sie werden zu Stripe weitergeleitet. Ihre Zahlungsmethode wird gespeichert, die erste Abbuchung erfolgt nach Prüfung Ihrer Unterlagen zum Vertragsbeginn.
                  </p>
                </div>
              ) : (
                /* Erfolg nach Stripe-Rückkehr */
                <div className="mt-5 rounded-lg bg-[#f0f4e8] border border-[#6b7f3e]/30 p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-7 h-7 text-[#6b7f3e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <p className="font-bold text-foreground">Geschafft — alles abgeschlossen!</p>
                      <p className="text-sm text-muted-foreground mt-2">Ihre Zahlungsmethode wurde erfolgreich hinterlegt.</p>
                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="font-semibold text-sm text-foreground mb-2">Was passiert jetzt?</p>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                          <li>Wir prüfen Ihre Unterlagen <span className="text-muted-foreground/60">(innerhalb von 24h)</span></li>
                          <li>Sie erhalten eine Bestätigung per E-Mail</li>
                          <li>Ihr Vertrag wird aktiviert zum {vertrag.starttermin}</li>
                          <li>Erste Abbuchung zum Vertragsbeginn</li>
                          <li>Willkommenspaket mit Zugangsdaten & Briefkastenschlüssel</li>
                        </ol>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs text-muted-foreground">Fragen? Ihr Ansprechpartner:</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{vertrag.ansprechpartner}</p>
                        <a href={`tel:${vertrag.ansprechpartnerTel}`} className="text-[#6b7f3e] font-bold text-lg">{vertrag.ansprechpartnerTel}</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Actions ── */}
        {!kundeSignatur && (
          <div className="text-center">
            <a
              href="#unterschrift"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('[data-section="unterschrift"]')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6b7f3e] text-white px-8 py-3.5 text-base font-bold hover:opacity-90 transition-opacity shadow-sm no-underline"
            >
              Jetzt Vertrag unterschreiben
            </a>
          </div>
        )}
        <div className="flex items-center justify-center gap-4 text-sm print:hidden">
          <button
            onClick={() => window.print()}
            className="text-muted-foreground hover:text-[#6b7f3e] underline cursor-pointer transition-colors"
          >
            {kundeSignatur ? 'Vertrag als PDF speichern' : 'Entwurf als PDF speichern'}
          </button>
          {!kundeSignatur && (
            <>
              <span className="text-border">·</span>
              <a
                href={`/angebot/${vertrag.angebotSlug}`}
                className="text-muted-foreground hover:text-[#6b7f3e] underline no-underline transition-colors"
              >
                Zurück zum Angebot
              </a>
            </>
          )}
        </div>

        {/* ── Kontakt ── */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">Fragen zum Vertrag?</p>
          <p className="text-sm font-medium text-foreground">{vertrag.ansprechpartner} · <a href={`tel:${vertrag.ansprechpartnerTel}`} className="text-[#6b7f3e]">{vertrag.ansprechpartnerTel}</a> · <a href={`mailto:${vertrag.ansprechpartnerEmail}`} className="text-[#6b7f3e]">{vertrag.ansprechpartnerEmail}</a></p>
        </div>
      </div>
    </div>
  );
}
