#!/usr/bin/env bash
set -euo pipefail

{
  echo "## Lighthouse CI"
  echo ""
  if [ -d ".lighthouseci" ]; then
    found=false
    for f in .lighthouseci/lhr-*.json; do
      if [ -f "$f" ]; then
        found=true
        URL=$(jq -r '.requestedUrl' "$f")
        A11Y=$(jq -r '.categories.accessibility.score * 100' "$f")
        SEO=$(jq -r '.categories.seo.score * 100' "$f")
        PERF=$(jq -r '.categories.performance.score * 100' "$f")
        BP=$(jq -r '."categories"."best-practices".score * 100' "$f")
        echo "### $URL"
        echo ""
        echo "| Category | Score |"
        echo "| --- | --- |"
        echo "| Accessibility | ${A11Y}% |"
        echo "| SEO | ${SEO}% |"
        echo "| Performance | ${PERF}% |"
        echo "| Best Practices | ${BP}% |"
        echo ""
      fi
    done
    if [ "$found" = false ]; then
      echo "- Lighthouse results not available"
    fi
  else
    echo "- Lighthouse results not available"
  fi
} >> "$GITHUB_STEP_SUMMARY"
