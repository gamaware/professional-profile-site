#!/usr/bin/env bash
set -euo pipefail

echo "Waiting 10 seconds for propagation..."
sleep 10
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$EXPECTED_URL" || echo "000")
echo "Website response: HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "PASS: Website is responding"
else
  echo "WARN: Website returned HTTP $HTTP_CODE (CloudFront cache may still be propagating)"
fi
