#!/usr/bin/env bash
set -euo pipefail

# Files that live in the repository but are never published.
EXCLUDES=(
  --exclude ".git/*"
  --exclude ".github/*"
  --exclude "docs/*"
  --exclude "tests/*"
  --exclude ".pre-commit-config.yaml"
  --exclude "CODEOWNERS"
  --exclude "CONTRIBUTING.md"
  --exclude "SECURITY.md"
  --exclude "LICENSE"
  --exclude "README.md"
  --exclude ".gitignore"
  --exclude ".secrets.baseline"
  --exclude ".markdownlint.yaml"
  --exclude ".yamllint.yml"
  --exclude ".coderabbit.yaml"
  --exclude "zizmor.yml"
  --exclude ".vale.ini"
  --exclude "styles/*"
  --exclude ".htmlhintrc"
  --exclude ".stylelintrc.json"
  --exclude ".prettierrc"
  --exclude ".prettierignore"
  --exclude "eslint.config.mjs"
  --exclude "playwright.config.mjs"
  --exclude ".markdown-link-check.json"
  --exclude "lighthouserc.json"
  --exclude ".DS_Store"
  --exclude "package.json"
  --exclude "package-lock.json"
  --exclude "node_modules/*"
  --exclude "playwright-report/*"
  --exclude "test-results/*"
  --exclude ".playwright-cli/*"
  --exclude ".lighthouseci/*"
  --exclude "screenshot*"
)

# Images and fonts change rarely and get a new file name when they do, so
# browsers and CloudFront may keep them for a year.
LONG_CACHE="public, max-age=31536000, immutable"
# Pages, styles and scripts keep stable names, so browsers revalidate them on every load.
SHORT_CACHE="no-cache"

sync_pass() {
  aws s3 sync . "s3://$S3_BUCKET" --delete "$@"
}

# 1. Types that older mime tables may not know get an explicit content type.
sync_pass --exclude "*" --include "*.woff2" "${EXCLUDES[@]}" \
  --content-type "font/woff2" --cache-control "$LONG_CACHE"
sync_pass --exclude "*" --include "*.webp" "${EXCLUDES[@]}" \
  --content-type "image/webp" --cache-control "$LONG_CACHE"

# 2. Remaining static assets (images, icons, font licenses).
sync_pass "${EXCLUDES[@]}" \
  --exclude "*.html" --exclude "*.css" --exclude "*.js" \
  --exclude "*.woff2" --exclude "*.webp" \
  --cache-control "$LONG_CACHE"

# 3. HTML, CSS and JavaScript last, so new pages only reference assets that
#    are already uploaded.
sync_pass --exclude "*" \
  --include "*.html" --include "*.css" --include "*.js" \
  "${EXCLUDES[@]}" \
  --cache-control "$SHORT_CACHE"
