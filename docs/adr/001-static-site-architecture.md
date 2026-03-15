# ADR-001: Static Site Architecture

## Status

Accepted

## Context

The professional profile website needs to be hosted reliably with low cost,
fast global delivery, and HTTPS support for a custom domain.

## Decision

Use a static HTML/CSS site hosted on AWS S3, served through CloudFront with
a Route 53 managed domain and ACM certificate.

## Consequences

- No server-side code to maintain
- Near-zero hosting cost (S3 + CloudFront free tier covers low traffic)
- Global CDN delivery via CloudFront edge locations
- HTTPS enforced via ACM certificate
- Deployment is a simple S3 sync + CloudFront invalidation
- No build step required — files are served as-is
