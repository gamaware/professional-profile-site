#!/usr/bin/env bash
set -euo pipefail

if ! grep -q "## " README.md; then
  echo "WARNING: README.md should have sections (##)"
fi

if ! grep -q "!\[" README.md; then
  echo "WARNING: README.md should have badges"
fi

if ! grep -qi "author\|created by" README.md; then
  echo "WARNING: README.md should have author information"
fi

if ! grep -qi "license" README.md; then
  echo "WARNING: README.md should mention license"
fi

echo "README quality check complete"
