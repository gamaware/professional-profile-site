# Copilot Code Review Instructions

This is a personal professional profile website (resume/CV) hosted on AWS S3 + CloudFront.
It contains static HTML, CSS, and JavaScript.

## Review priorities

1. **Accessibility** — Ensure proper alt text, semantic HTML, ARIA labels,
   and keyboard navigation support.

2. **Security** — Flag any hardcoded credentials, API keys, or personal
   information that should not be public. Check for XSS vulnerabilities.

3. **SEO** — Verify meta tags, Open Graph tags, structured data, and
   proper heading hierarchy.

4. **Responsive design** — Ensure the site works on mobile, tablet, and
   desktop viewports.

5. **Performance** — Flag large unoptimized images, render-blocking resources,
   or unnecessary JavaScript.

6. **Markdown quality** — 120-char limit (tables exempt), fenced code blocks,
   ATX headings.

## What NOT to flag

- The headshot image (intentionally included in the repo).
- Google Analytics tracking code (intentional).
