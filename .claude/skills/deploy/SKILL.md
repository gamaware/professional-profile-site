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

2. Record the newest existing dispatch run so the new one can be told
   apart from it (prints nothing when there is none):

   ```bash
   gh run list --workflow=deploy.yml --event workflow_dispatch --branch <branch> --limit 1 --json databaseId --jq '.[0].databaseId'
   ```

3. Trigger the workflow on the branch confirmed in step 1 (`main` unless
   the user chose another branch):

   ```bash
   gh workflow run deploy.yml --ref <branch>
   ```

4. Find the run this dispatch started. A new run can take several seconds
   to register, so repeat the command every few seconds until the
   `databaseId` differs from the value recorded in step 2. The event and
   branch filters keep a concurrent push-triggered run out of the result:

   ```bash
   gh run list --workflow=deploy.yml --event workflow_dispatch --branch <branch> --limit 1 --json databaseId,status,createdAt
   ```

5. Monitor until completion:

   ```bash
   gh run watch <run-id>
   ```

6. Report success or failure. If failed, fetch logs with
   `gh run view <run-id> --log-failed`.

## Rules

- Always confirm the target branch before triggering.
- Default to `main` unless the user specifies otherwise.
- A manual dispatch skips the quality-gate job (it only runs on push), so
  any branch other than `main` ships to production unvalidated. State this
  and get an explicit confirmation before dispatching a non-`main` branch.
- If `gh` is not authenticated, tell the user to run `gh auth login`.
