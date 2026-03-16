# CLAUDE.md — Project Instructions for Claude Code

This file is automatically loaded into context when Claude Code starts a conversation
in this repository. It defines the conventions, rules, and structure that must be followed.

## Repository Overview

Personal professional profile website hosted at `alexgarcia.info`. Static HTML/CSS resume
site with dark mode, multi-language support (EN/ES/PT), and PDF download functionality.
Served via AWS S3 + CloudFront with a custom domain through Route 53.

## Repository Structure

```text
index.html              # Main resume page (was detailed-resume.html in S3)
style.css               # Stylesheet with dark mode and responsive design
error.html              # Custom 404 error page
headshot.jpg            # Profile photo
docs/
  adr/                  # Architecture Decision Records (dateless)
.claude/
  settings.json         # Project-level Claude Code settings (hooks, permissions)
  hooks/                # Automation hooks (post-edit formatters)
  skills/               # Reusable skills (/ship for PR lifecycle)
.github/
  workflows/            # CI/CD pipelines
  ISSUE_TEMPLATE/       # Issue templates
  PULL_REQUEST_TEMPLATE.md
  copilot-instructions.md  # Copilot code review custom instructions
  dependabot.yml        # Dependabot configuration
```

## Git Workflow

### Commits

- **Conventional commits required** — enforced by `conventional-pre-commit` hook.
- Format: `type: description` (e.g., `fix:`, `feat:`, `docs:`, `chore:`, `ci:`).
- Never commit directly to `main` — enforced by `no-commit-to-branch` hook.
- Always work on a feature branch and create a PR.
- Do NOT add `Co-Authored-By` watermarks or any Claude/AI attribution to commits,
  code, or content. Ever.

### Pull Requests

- All changes go through PRs — no direct pushes to `main`.
- Squash merge only (merge commits and rebase disabled).
- CodeRabbit and GitHub Copilot auto-review all PRs — address their comments
  before merging.
- All required status checks must pass before merge.
- At least 1 approving review required (CODEOWNERS enforced).
- All review conversations must be resolved before merge.
- Use `--admin` flag to bypass branch protection when necessary.

## Pre-commit Hooks

All hooks must pass before committing. Install with `pre-commit install`.

### Hooks in use

- **General**: trailing-whitespace, end-of-file-fixer, check-yaml, check-json,
  check-added-large-files (1MB), check-merge-conflict, detect-private-key,
  check-executables-have-shebangs, check-shebang-scripts-are-executable,
  check-symlinks, check-case-conflict, no-commit-to-branch (main).
- **Secrets**: detect-secrets (with `.secrets.baseline`), gitleaks.
- **Markdown**: markdownlint with `--fix`.
- **GitHub Actions**: actionlint, zizmor (security analysis).
- **Commits**: conventional-pre-commit (commit-msg stage).

## Claude Code Hooks

Hooks in `.claude/settings.json` automate deterministic actions:

- **Post-edit** (`post-edit.sh`): Auto-runs `markdownlint --fix` on `.md` files
  after every Edit/Write.

## Claude Code Skills

Skills in `.claude/skills/` provide reusable workflows:

- **`/ship [PR-number]`** — End-to-end PR lifecycle: updates docs, commits, creates PR,
  monitors CI, addresses CodeRabbit and Copilot review comments, and merges with
  `--admin`. Pass a PR number to resume monitoring.

## Linting Policy

### Absolute rule: NO suppressions on our own code

- All default linting rules are enforced. Fix violations, never suppress them.
- Markdownlint config: MD013 line length at 120 characters, tables exempt.

## Markdown

- Line length limit: 120 characters (MD013).
- Tables are exempt from line length.
- Table separator lines must have spaces around pipes: `| --- | --- |` not `|---|---|`.
- Use ATX headings (`#`), not bold text as headings.
- Fenced code blocks must specify a language.

## Deployment

- Static files are hosted in S3 bucket `alexgarcia.info`.
- CloudFront distribution serves the site with HTTPS.
- Route 53 manages the `alexgarcia.info` domain.
- ACM provides the SSL certificate.
- **Automated**: Push to main with HTML/CSS/JS/image changes triggers
  `deploy.yml` — syncs to S3 and invalidates CloudFront cache via OIDC.
- **Manual**: Can also trigger via workflow_dispatch.
- Infrastructure is managed in a separate repo:
  [professional-profile-iac](https://github.com/gamaware/professional-profile-iac)

## Security

- Never commit secrets, credentials, private keys, or `.env` files.
- `.gitignore` excludes: `.env`, `.env.local`, `*.pem`, `*.key`, `credentials.json`.

## Repo Configuration

- **Visibility**: Public
- **Topics**: resume, portfolio, website, aws, s3, cloudfront
- **Merge strategy**: Squash only, PR title used as commit title
- **Auto merge**: Enabled
- **Delete branch on merge**: Enabled
- **Wiki**: Disabled
- **Projects**: Disabled
