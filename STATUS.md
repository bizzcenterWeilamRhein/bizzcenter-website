# STATUS — Produktseiten-Ausbau mit Videos & Kontaktformular-CTA

Stand: 2026-04-21 · Bearbeitung: Claude Code nach Task `CLAUDE_CODE_TASK-produktvideos.md`

## Was umgesetzt wurde

### Neue / erweiterte Komponenten

- **`components/YouTubeEmbed.tsx`** — DSGVO-konforme 2-Klick-Lösung:
  - Zeigt zunächst nur YouTube-Thumbnail + Play-Button + Hinweistext.
  - Video lädt erst nach Nutzer-Klick, dann via `youtube-nocookie.com`.
  - Props: `videoId`, `title`, `channel` (für Attribution).
  - Hinweistext übersetzt in DE/EN/FR/IT.

- **`components/KontaktFormular.tsx`** — für Produktanfragen erweitert:
  - Liest `?produkt=<slug>` aus der URL, belegt den Betreff automatisch vor.
  - Zusätzliche Felder (nur bei Produktanfrage sichtbar): Wunschtermin von/bis (Pflicht), Uhrzeit/Zeitraum (optional, Freitext).
  - Dezenter Vertrauenshinweis unter den Datumsfeldern: „Wir melden uns innerhalb von 24 Stunden (werktags) mit einer Verfügbarkeitsbestätigung."
  - E-Mail-Feld neu als Pflichtfeld (nötig für Bestätigungsmail).

- **`api/lead.ts`** — erweitert:
  - Nimmt strukturierte Felder `wunschterminVon`, `wunschterminBis`, `zeitraumFreitext` entgegen und speichert sie strukturiert im CRM (`notizen`-Feld der Lead-Tabelle).
  - Team-Benachrichtigung: Zeitraum wird **prominent als grüner Hervorhebungs-Block** oben in der E-Mail angezeigt.
  - **Neu: Bestätigungsmail an den Kunden** (wenn E-Mail vorhanden). Enthält Produkt, Wunschtermin und den 24-h-Hinweis.

### Produktseiten — jede bekommt jetzt 2 Videos + 4-Schritte-Ablauf + Kontaktformular-CTA

| Seite | Datei | Videos | CTA |
|---|---|---|---|
| Beamer Epson EH-TW650 | `content/beamer-mieten/de.mdx` | `63ihVWW0sEM` + `OAGwmBg1lwU` | `/kontakt?produkt=beamer-epson-eh-tw650` |
| JBL EON 715 | `content/lautsprecher-mieten/de.mdx` | `i-xP31f_9DY` + `MqqL-pwP06w` | `/kontakt?produkt=musikbox-jbl` |
| Teufel Boomster 4 (NEU) | `content/musikbox-boomster-mieten/de.mdx` + en/fr/it | `hQ2-23Q0Pvg` + `VLmi7dNE1sg` | `/kontakt?produkt=musikbox-boomster` |
| Ecovacs Winbot W2S | `content/fensterputzroboter-mieten/de.mdx` | Herstellerlink + `1JBxRo0CGkI` | `/kontakt?produkt=fensterputzroboter-winbot-w2s` |

**Einheitlicher 4-Schritte-Ablauf** auf allen vier Seiten: Anfrage stellen → Bestätigung & Details → Abholung im Kesselhaus → Nutzung & Rückgabe. Kaution/Ausweis bewusst neutral formuliert — konkrete Details kommen laut Seite mit der Buchungsbestätigung.

### Buchungs-Komponenten / direkte Buchung

- `BeamerBuchung` und `FensterputzroboterBuchung` werden **nicht mehr im MDX eingebunden**. Die Komponenten selbst und die zugehörigen API-Endpunkte (`api/beamer-checkout.ts`, `api/fensterputzroboter-*.ts`) bleiben im Code erhalten — nicht gelöscht, damit sie später reaktiviert werden können, falls das operative Modell geklärt ist.
- Alle „Jetzt buchen" / „Verfügbarkeit prüfen & buchen" / `#buchen`-Links ersetzt durch „Verfügbarkeit anfragen" → Kontaktformular.
- **Nicht angefasst:** Konferenzraum-Buchung, Coworking-Buchung, Geschäftsadresse-Anfrage, Stripe-Flows auf anderen Seiten.

### Navigation / Site-Konfig

- `shipsite.json`: neue Seite `musikbox-boomster-mieten` registriert (alle 4 Locales).
- Navigation: neuer Dropdown-Eintrag „Teufel Boomster 4 mieten" unter Services, direkt nach „Musikbox mieten".

## Herstellerbilder — Entscheidung

**Keine Hersteller-Produktbilder eingebunden** (JBL, Teufel, Ecovacs). Begründung:

- Produktbilder von den Herstellerseiten herunterzuladen wäre ohne explizite Freigabe (Pressekit-Lizenz oder Händlerfreigabe) urheberrechtlich riskant.
- Wir sind nicht autorisierte Händler — „Dealer Resources" gelten nicht für Vermieter.
- Mit Torben abgestimmt (Chat 2026-04-21): Risiko hoch, Nutzen gering.

Stattdessen: Auf den Produkt-Boxen werden bestehende, eigene Event-/Raumfotos aus dem Kesselhaus als Platzhalter verwendet. Für Epson wurde **nichts geändert** — eigene Fotos bleiben unverändert bestehen.

**Kandidaten für eigene Produktfotos (mittelfristig):**
- JBL EON 715 — Foto im Konferenzraum mit Mikrofon
- Teufel Boomster 4 — Foto outdoor (Green Office Terrasse / Lounge)
- Ecovacs Winbot W2S Omni — Foto am Fenster, idealerweise in Nutzung

Mailvorlage für Pressekit-Anfrage beim Hersteller liegt laut Task-Beschreibung bei Torben vor.

## Offene TODOs

- **Französisch / Italienisch für Boomster-Seite:** Stub-Übersetzung drin (Hero, Produkt-Info, Videos, Ablauf, Final-CTA). Sektionen „JBL vs. Boomster" und erweiterte FAQ fehlen in FR/IT — werden nachgezogen. In FR könnte als Demo-Video statt `VLmi7dNE1sg` das französische Review `jRT6G5AuIOg` verwendet werden (Task-Hinweis).
- **Englische Kontaktformular-Übersetzung vollständig prüfen:** Die neuen Felder (Wunschtermin, Zeitraum) sind in DE/EN/FR übersetzt — IT fehlt (Kontaktformular kennt IT nicht als Locale, fällt auf DE zurück).
- **Besseres deutsches Review-Video für Epson EH-TW650:** Aktuell nur ein Review-Video eingebunden (`63ihVWW0sEM`). Sobald ein aktuelleres/deutschsprachiges Review auftaucht, ersetzen.
- **Videos ansehen und prüfen:** Video-IDs sind aus der Task übernommen. Bitte einmal auf YouTube prüfen, dass alle verwendeten Videos tatsächlich noch online und inhaltlich passend sind, bevor wir pushen.
- **Seiten-Inkonsistenz `/musikbox-mieten` vs. `/lautsprecher-mieten`:** Es gibt parallel eine generische `/musikbox-mieten`-Seite (ohne konkretes Modell) und `/lautsprecher-mieten` (= JBL EON 715). Die Task beschreibt `/musikbox-mieten` als JBL-Seite — das passt nicht zu unserer aktuellen Struktur. **Empfehlung:** `/musikbox-mieten` mittelfristig zur **Übersichtsseite** umbauen, die zu JBL und Boomster verlinkt, oder die generische Seite entfernen.

## Strategisch (aus dem Task mitgenommen)

- **Epson EH-TW650 ist abgekündigt.** Prüfen, ob mittelfristig ein Nachfolger (EH-TW740) oder ein Business-Modell (EB-FH52) beschafft werden soll. Kein Zeitdruck — das aktuelle Gerät funktioniert, ältere Videos zeigen die Kernfunktionen gleich gut.
- **Operatives Modell für Abholung/Kaution ist weiterhin offen** (bemannt vs. unbemannt, Deposit-Box, Stripe-Vorautorisierung). Die Seiten sind so formuliert, dass sie bei jeder operativen Entscheidung weiter passen. Thematische Überschneidung mit dem Paketbox-Projekt — dort mitdenken.
- **ShipSite-Bugs aus dieser Session** (zwei Punkte wurden an ShipSite gemeldet: verschachtelte `<html>`-Tags, Farbinkonsistenz der Nav-Links). Erstes Problem ist mit Update auf `@shipsite.dev/cli@0.2.74` behoben.

## Noch nicht committet / gepusht

Gesamter Stand ist **lokal**. Vor Freigabe durch Torben wird nichts committet oder gepusht. Folgende Änderungen warten:

- `components/YouTubeEmbed.tsx` (neu)
- `components/KontaktFormular.tsx` (Produkt-URL + Datumsfelder + Bestätigungsmail)
- `components/index.ts` (Export)
- `api/lead.ts` (neue Felder, prominente Zeitraum-Darstellung, Kundenbestätigungsmail)
- `content/beamer-mieten/de.mdx`
- `content/lautsprecher-mieten/de.mdx`
- `content/fensterputzroboter-mieten/de.mdx`
- `content/musikbox-boomster-mieten/` (neuer Ordner, de/en/fr/it)
- `shipsite.json` (Navigation + neue Seite)
- Außerdem aus früheren Sessions wartend: LanguageSwitcher-Burger-Fix, Lautsprecher-Seite-Überarbeitung, Geschäftsadresse-Preisblock-Auskommentierung, Kontaktseite-Anpassungen, CTA-Anrufen-Bereinigung, shipsite-Update auf 0.2.74.
