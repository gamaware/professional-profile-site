# Professional Profile Website

Personal professional profile and resume website hosted at
[alexgarcia.info](https://alexgarcia.info).

## Features

- Responsive design (mobile, tablet, desktop)
- Dark mode with system preference detection
- Multi-language support (English, Spanish, Portuguese)
- PDF download via browser print
- Custom 404 error page

## Architecture

- **Hosting**: AWS S3 (static website)
- **CDN**: AWS CloudFront (HTTPS, caching)
- **Domain**: AWS Route 53 (`alexgarcia.info`)
- **Certificate**: AWS ACM (SSL/TLS)

## Local Development

Open `index.html` in a browser. No build step required.

## Deployment

```bash
# Sync files to S3
aws s3 sync . s3://alexgarcia.info --exclude ".git/*" --exclude ".github/*" \
  --exclude ".claude/*" --exclude "docs/*" --exclude ".pre-commit-config.yaml" \
  --exclude "CLAUDE.md" --exclude "CODEOWNERS" --exclude "LICENSE" \
  --exclude "README.md" --exclude ".gitignore" --exclude ".secrets.baseline" \
  --exclude ".markdownlint.yaml" --exclude ".yamllint.yml" --exclude ".coderabbit.yaml" \
  --exclude "zizmor.yml" --profile personal

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> \
  --paths "/*" --profile personal
```

## Repository Structure

```text
index.html                 # Main resume page
style.css                  # Stylesheet (dark mode, responsive)
error.html                 # Custom 404 page
headshot.jpg               # Profile photo
CLAUDE.md                  # Claude Code project instructions
.claude/                   # Claude Code hooks and skills
.github/                   # CI/CD, templates, dependabot
docs/adr/                  # Architecture Decision Records
```

## Author

Jorge Alejandro Garcia Martinez — [gamaware@gmail.com](mailto:gamaware@gmail.com)

## License

[MIT](LICENSE)
