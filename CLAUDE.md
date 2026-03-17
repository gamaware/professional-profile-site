# CLAUDE.md — Project Instructions for Claude Code

This file is automatically loaded into context when Claude Code starts a conversation
in this repository. It defines the conventions, rules, and structure that must be followed.

## Repository Overview

Personal professional profile website hosted at `alexgarcia.info`. Static HTML/CSS/JS
resume site with automatic dark mode (`prefers-color-scheme`), multi-language support
(EN/ES/PT), and PDF download functionality. Served via AWS S3 + CloudFront with a
custom domain through Route 53.

## Repository Structure

```text
index.html              # Main resume page
style.css               # Stylesheet with dark mode and responsive design
main.js                 # Language selector and PDF download
error.html              # Custom 404 error page
headshot.jpg            # Profile photo
CONTRIBUTING.md         # Contribution guidelines
SECURITY.md             # Security disclosure policy
docs/
  adr/                  # Architecture Decision Records (dateless)
.claude/
  settings.json         # Project-level Claude Code settings (hooks, permissions)
  hooks/                # Automation hooks (post-edit formatters)
  skills/               # Reusable skills (/ship for PR lifecycle)
.github/
  workflows/            # CI/CD pipelines (quality-checks, deploy)
  actions/              # Composite actions (deploy-composite)
  scripts/              # Extracted bash scripts (validate-structure, etc.)
  ISSUE_TEMPLATE/       # Issue templates (bug-report.md, feature-request.md)
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

### Hooks in use (25 checks)

- **General**: trailing-whitespace, end-of-file-fixer, check-yaml, check-json,
  check-added-large-files (1MB), check-merge-conflict, detect-private-key,
  check-executables-have-shebangs, check-shebang-scripts-are-executable,
  check-symlinks, check-case-conflict, no-commit-to-branch (main).
- **Secrets**: detect-secrets (with `.secrets.baseline`), gitleaks (`--redact`).
- **Shell**: shellcheck (`--severity=warning`), shellharden (`--check`).
- **Web**: Prettier (HTML/CSS/JS), HTMLHint (HTML), Stylelint (CSS), ESLint (JS).
- **Markdown**: markdownlint with `--fix`.
- **Prose**: Vale (write-good, proselint).
- **GitHub Actions**: actionlint, zizmor (security analysis).
- **Commits**: conventional-pre-commit (commit-msg stage).

## CI/CD (quality-checks.yml — 12 jobs)

| Job | Tool |
| --- | --- |
| markdown-lint | markdownlint-cli2 |
| link-checker | markdown-link-check |
| yaml-lint | yamllint |
| html-validate | HTMLHint |
| css-lint | Stylelint |
| js-lint | ESLint |
| file-structure | validate-structure.sh |
| readme-quality | check-readme.sh |
| actions-security | zizmor v1.23.1 |
| prose-lint | vale-action |
| lighthouse | lighthouse-ci-action |
| shell-check | action-shellcheck |

## Claude Code Hooks

Hooks in `.claude/settings.json` automate deterministic actions:

- **Post-edit** (`post-edit.sh`): Auto-runs `shellharden --replace` + `chmod +x`
  on `.sh` files and `markdownlint --fix` on `.md` files after every Edit/Write.

## Claude Code Skills

Skills in `.claude/skills/` provide reusable workflows:

- **`/ship [PR-number]`** — End-to-end PR lifecycle: updates docs, commits, creates PR,
  monitors CI, addresses CodeRabbit and Copilot review comments, and merges with
  `--admin`. Pass a PR number to resume monitoring.

## Linting Policy

### Absolute rule: NO suppressions on our own code

- All default linting rules are enforced. Fix violations, never suppress them.
- Markdownlint config: MD013 line length at 120 characters, tables exempt.

## Web Code Guidelines

- **HTML**: Must pass HTMLHint. Use semantic elements and alt text on images.
- **CSS**: Must pass Stylelint (standard config). Dark mode uses
  `@media (prefers-color-scheme: dark)` — no JavaScript theme toggle.
- **JavaScript**: Must pass ESLint (browser env). No `eval()` or `implied-eval`.
- **Formatting**: All HTML/CSS/JS formatted with Prettier.

## Frontend Design Rules

### Reference image workflow

- If a reference image is provided: match layout, spacing, typography, and color
  exactly. Swap in placeholder content where needed. Do not improve or add to
  the design.
- If no reference image: design from scratch following the existing design system
  (CSS custom properties, Lato font, accent color palette).
- After changes, visually verify the result. Compare against reference if one
  was provided. Fix mismatches before considering the task done.

### Design system

This site uses **Tailwind CSS via CDN** (`cdn.tailwindcss.com`) with a custom
config for fonts. Custom CSS in `style.css` handles animations, print styles,
and elements Tailwind cannot express (blob keyframes, section-heading underline,
reveal transitions).

- **Colors**: Indigo-500/400 primary, slate background/surface palette.
  `darkMode: "media"` for automatic `prefers-color-scheme` switching.
- **Typography**: Plus Jakarta Sans (display/headings), Inter (body). Extended
  via `tailwind.config.theme.extend.fontFamily`.
- **Dark mode**: Handled by Tailwind `dark:` variant (media strategy). Never
  use JavaScript for theme switching.
- **Trilingual**: Single DOM with `data-i18n` attributes. `TRANSLATIONS` object
  in `main.js` holds EN/ES/PT strings. `setLanguage()` walks `[data-i18n]`
  elements and sets `textContent`.

### Quality guardrails

- **Animations**: Only animate `transform` and `opacity`. Never use
  `transition: all`. Use specific properties (e.g., `transition: background
  0.3s ease, color 0.3s ease`).
- **Interactive states**: Every clickable element needs `hover`, `focus-visible`,
  and `active` states.
- **Images**: Always include `alt` text. Use `width`/`height` attributes to
  prevent layout shift.
- **Responsive**: Mobile-first. Test that layout works at common breakpoints.

### Hard rules

- Do not add sections, features, or content not requested.
- Do not "improve" a reference design — match it.
- Tailwind via CDN only — no npm-installed CSS frameworks or build steps.
- Custom CSS goes in `style.css`; Tailwind utility classes go in HTML.

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
