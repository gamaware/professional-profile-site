---
name: deploy
description: >-
  Trigger a manual deployment of the site to S3/CloudFront via the
  deploy GitHub Actions workflow. Use when the user wants to deploy
  without pushing to main, or to re-deploy the current main branch.
user-invocable: true
disable-model-invocation: true
---

# Deploy — Trigger Manual Deployment

Manually trigger the deploy workflow to sync files to S3 and invalidate
the CloudFront cache.

## Steps

1. Confirm the user wants to deploy by showing the current branch and
   latest commit.

2. Trigger the workflow:

   ```bash
   gh workflow run deploy.yml --ref main
   ```

3. Wait a few seconds, then find the run:

   ```bash
   gh run list --workflow=deploy.yml --limit 1
   ```

4. Monitor until completion:

   ```bash
   gh run watch <run-id>
   ```

5. Report success or failure. If failed, fetch logs with
   `gh run view <run-id> --log-failed`.

## Rules

- Always confirm the target branch before triggering.
- Default to `main` unless the user specifies otherwise.
- If `gh` is not authenticated, tell the user to run `gh auth login`.
