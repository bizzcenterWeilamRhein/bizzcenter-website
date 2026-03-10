#!/bin/bash
# Quick dev server restart with cache clear
pkill -f "shipsite\|next" 2>/dev/null
sleep 2
cd /data/.openclaw/workspace/bizzcenter-website
rm -rf .next 2>/dev/null
PORT=3000 npx shipsite dev > /tmp/shipsite.log 2>&1 &
echo "Restarting dev server..."
sleep 12
if curl -m5 -s http://localhost:3000 -o /dev/null -w "%{http_code}" | grep -q 200; then
  echo "✓ Dev server ready on port 3000"
else
  echo "✗ Dev server not ready yet, waiting..."
  sleep 8
  curl -m5 -s http://localhost:3000 -o /dev/null -w "%{http_code}"
fi
