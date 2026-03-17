#!/usr/bin/env bash
set -euo pipefail

# Wait for Quality Checks workflow to complete before deploying
# Required env vars: GITHUB_SHA, GITHUB_REPOSITORY, GH_TOKEN

SHA="$GITHUB_SHA"
MAX_ATTEMPTS=60
SLEEP_INTERVAL=10

echo "Waiting for Quality Checks to complete for $SHA..."

i=0
while [ "$i" -lt "$MAX_ATTEMPTS" ]; do
  i=$((i + 1))
  QC_STATUS=$(gh api "repos/$GITHUB_REPOSITORY/actions/runs?head_sha=$SHA&event=push" \
    --jq '[.workflow_runs[] | select(.name == "Quality Checks")] | sort_by(.created_at) | last | .conclusion // "pending"' 2>/dev/null || echo "pending")

  echo "Attempt $i/$MAX_ATTEMPTS — Quality Checks: $QC_STATUS"

  if [ "$QC_STATUS" = "success" ]; then
    echo "Quality Checks passed!"

    {
      echo "## Quality Gate"
      echo ""
      echo "- Quality Checks: Passed"
      echo "- Status: Deployment authorized"
    } >> "$GITHUB_STEP_SUMMARY"

    exit 0
  fi

  if [ "$QC_STATUS" = "failure" ] || [ "$QC_STATUS" = "cancelled" ] \
    || [ "$QC_STATUS" = "timed_out" ] || [ "$QC_STATUS" = "action_required" ] \
    || [ "$QC_STATUS" = "neutral" ] || [ "$QC_STATUS" = "skipped" ] \
    || [ "$QC_STATUS" = "stale" ]; then
    echo "BLOCKED: Quality Checks concluded with: $QC_STATUS"
    echo "Deployment will not proceed."

    {
      echo "## Quality Gate"
      echo ""
      echo "- Quality Checks: $QC_STATUS"
      echo "- Status: BLOCKED — Deployment will not proceed"
    } >> "$GITHUB_STEP_SUMMARY"

    exit 1
  fi

  if [ "$i" -lt "$MAX_ATTEMPTS" ]; then
    sleep "$SLEEP_INTERVAL"
  fi
done

echo "Timed out waiting for Quality Checks after $((MAX_ATTEMPTS * SLEEP_INTERVAL)) seconds."

{
  echo "## Quality Gate"
  echo ""
  echo "- Quality Checks: $QC_STATUS"
  echo "- Status: TIMED OUT — Deployment blocked"
} >> "$GITHUB_STEP_SUMMARY"

exit 1
