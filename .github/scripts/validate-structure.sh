#!/usr/bin/env bash
set -euo pipefail

echo "Checking repository structure..."
errors=0

for file in LICENSE README.md .gitignore CLAUDE.md CODEOWNERS \
  CONTRIBUTING.md SECURITY.md index.html style.css error.html main.js; do
  if [ ! -f "$file" ]; then
    echo "ERROR: $file missing"
    errors=$((errors + 1))
  else
    echo "$file found"
  fi
done

for dir in .github/ISSUE_TEMPLATE docs; do
  if [ ! -d "$dir" ]; then
    echo "ERROR: $dir/ directory missing"
    errors=$((errors + 1))
  else
    echo "$dir/ found"
  fi
done

if [ "$errors" -gt 0 ]; then
  echo "$errors required files/directories missing"
  exit 1
fi

echo "Repository structure validation complete"
