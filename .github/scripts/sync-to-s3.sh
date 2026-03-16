#!/usr/bin/env bash
set -euo pipefail

aws s3 sync . "s3://$S3_BUCKET" \
  --delete \
  --exclude ".git/*" \
  --exclude ".github/*" \
  --exclude ".claude/*" \
  --exclude "docs/*" \
  --exclude ".pre-commit-config.yaml" \
  --exclude "CLAUDE.md" \
  --exclude "CODEOWNERS" \
  --exclude "CONTRIBUTING.md" \
  --exclude "SECURITY.md" \
  --exclude "LICENSE" \
  --exclude "README.md" \
  --exclude ".gitignore" \
  --exclude ".secrets.baseline" \
  --exclude ".markdownlint.yaml" \
  --exclude ".yamllint.yml" \
  --exclude ".coderabbit.yaml" \
  --exclude "zizmor.yml" \
  --exclude ".vale.ini" \
  --exclude "styles/*" \
  --exclude ".htmlhintrc" \
  --exclude ".stylelintrc.json" \
  --exclude ".prettierrc" \
  --exclude ".prettierignore" \
  --exclude "eslint.config.mjs" \
  --exclude ".markdown-link-check.json" \
  --exclude ".DS_Store"
