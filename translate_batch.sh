#!/bin/bash

# Batch-Übersetzungsskript für bizzcenter-website
# Erstellt fr.mdx und it.mdx für alle Seiten die eine de.mdx haben
# (außer konstanz-*, angebot/*, vertrag/*, buchung-bestaetigt)

cd /data/.openclaw/workspace/bizzcenter-website/content

# Liste aller de.mdx Dateien (außer ausgeschlossene)
find . -name "de.mdx" | \
  grep -v konstanz | \
  grep -v angebot | \
  grep -v vertrag | \
  grep -v buchung-bestaetigt | \
  sort

