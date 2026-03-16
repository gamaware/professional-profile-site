#!/usr/bin/env bash
set -euo pipefail

echo "Waiting 10 seconds for propagation..."
sleep 10
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$EXPECTED_URL" || echo "000")
echo "Website response: HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "PASS: Website is responding"
  exit 0
fi

echo "ERROR: Website returned HTTP $HTTP_CODE"
exit 1
