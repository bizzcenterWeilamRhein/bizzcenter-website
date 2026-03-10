#!/bin/bash
# Stabiler Dev-Server Start — killt alte Prozesse + räumt Turbopack-Cache auf
cd "$(dirname "$0")"

# Alte Prozesse killen
ps aux | grep -E "next|shipsite" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 2

# Turbopack-Cache komplett löschen (verhindert .sst Korruption)
rm -rf .shipsite/.next /tmp/next-panic* node_modules/.cache

# Server starten ohne Turbopack Persistence
NEXT_TURBOPACK_TASK_PERSISTENCE=false PORT=3000 npx shipsite dev
