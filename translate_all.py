#!/usr/bin/env python3
"""
Batch-Übersetzungsskript für bizzcenter-website
Erstellt fr.mdx und it.mdx basierend auf de.mdx
"""

import os
import re
from pathlib import Path

# Translation dictionary für häufige Begriffe
TRANSLATIONS = {
    "de": {
        # Häufige Begriffe
        "Geschäftsadresse": {"fr": "Adresse commerciale", "it": "Indirizzo commerciale"},
        "Coworking": {"fr": "Coworking", "it": "Coworking"},
        "Büro mieten": {"fr": "Louer bureau", "it": "Affittare ufficio"},
        "Konferenzraum": {"fr": "Salle de conférence", "it": "Sala conferenze"},
        "Das sagen unsere Kunden": {"fr": "Ce que disent nos clients", "it": "Cosa dicono i nostri clienti"},
        "Jetzt buchen": {"fr": "Réserver maintenant", "it": "Prenota ora"},
        "Mehr erfahren": {"fr": "En savoir plus", "it": "Scopri di più"},
        "Häufige Fragen": {"fr": "Questions fréquentes", "it": "Domande frequenti"},
        "Was ist enthalten": {"fr": "Ce qui est inclus", "it": "Cosa è incluso"},
        "Über uns": {"fr": "À propos", "it": "Chi siamo"},
        "Kontakt": {"fr": "Contact", "it": "Contatto"},
        "Preise": {"fr": "Prix", "it": "Prezzi"},
    }
}

def translate_mdx_file(de_file: Path, target_lang: str):
    """Übersetzt eine de.mdx Datei ins Französische oder Italienische"""
    
    target_file = de_file.parent / f"{target_lang}.mdx"
    
    # Überspringe wenn Datei bereits existiert
    if target_file.exists():
        print(f"✓ {target_file} existiert bereits")
        return
    
    print(f"Erstelle {target_file}...")
    
    with open(de_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Frontmatter extrahieren
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not frontmatter_match:
        print(f"⚠ Kein Frontmatter in {de_file}")
        return
    
    frontmatter = frontmatter_match.group(1)
    body = frontmatter_match.group(2)
    
    # Title und Description übersetzen (Platzhalter - muss manuell nachbearbeitet werden)
    title_match = re.search(r'title:\s*"([^"]*)"', frontmatter)
    desc_match = re.search(r'description:\s*"([^"]*)"', frontmatter)
    
    if title_match:
        title_de = title_match.group(1)
        # Einfache Ersetzungen für häufige Begriffe
        title_translated = title_de
        for de_term, translations in TRANSLATIONS["de"].items():
            title_translated = title_translated.replace(de_term, translations[target_lang])
        
        frontmatter = frontmatter.replace(f'title: "{title_de}"', f'title: "{title_translated}"')
    
    if desc_match:
        desc_de = desc_match.group(1)
        desc_translated = desc_de
        for de_term, translations in TRANSLATIONS["de"].items():
            desc_translated = desc_translated.replace(de_term, translations[target_lang])
        
        frontmatter = frontmatter.replace(f'description: "{desc_de}"', f'description: "{desc_translated}"')
    
    # Body: Einfache Textersetzungen in title-Props, description-Props etc.
    # ACHTUNG: Dies ist eine grobe Approximation - muss manuell nachbearbeitet werden!
    
    body_translated = body
    for de_term, translations in TRANSLATIONS["de"].items():
        # Ersetze in title="..." und description="..."
        body_translated = re.sub(
            f'title="([^"]*{re.escape(de_term)}[^"]*)"',
            lambda m: f'title="{m.group(1).replace(de_term, translations[target_lang])}"',
            body_translated
        )
    
    # Ausgabe schreiben
    output_content = f"---\n{frontmatter}\n---\n{body_translated}"
    
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(output_content)
    
    print(f"✓ {target_file} erstellt (muss manuell nachbearbeitet werden!)")

def main():
    content_dir = Path("content")
    
    # Finde alle de.mdx Dateien (außer ausgeschlossene)
    de_files = []
    for de_file in content_dir.rglob("de.mdx"):
        path_str = str(de_file)
        if any(excl in path_str for excl in ["konstanz", "angebot", "vertrag", "buchung-bestaetigt"]):
            continue
        de_files.append(de_file)
    
    print(f"Gefunden: {len(de_files)} de.mdx Dateien")
    print("=" * 60)
    
    for de_file in sorted(de_files):
        print(f"\nVerarbeite {de_file}...")
        translate_mdx_file(de_file, "fr")
        translate_mdx_file(de_file, "it")
    
    print("\n" + "=" * 60)
    print("FERTIG!")
    print("⚠ WICHTIG: Alle generierten Dateien müssen manuell überprüft und nachbearbeitet werden!")
    print("Die automatische Übersetzung ist nur ein Startpunkt.")

if __name__ == "__main__":
    main()
