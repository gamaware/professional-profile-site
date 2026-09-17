---
name: lint-all
description: >-
  Run all 25 pre-commit checks against the entire repo without committing.
  Use when you want to verify everything passes before staging changes,
  or to diagnose linting failures outside the commit flow.
user-invocable: true
disable-model-invocation: true
---

# Lint All — Run Pre-commit Checks

Run every pre-commit hook against all files in the repository.

## Steps

1. Run:

   ```bash
   pre-commit run --all-files
   ```

2. Report results:
   - If all checks pass, confirm success.
   - If any checks fail, list each failing hook with the affected files
     and error messages. Suggest fixes for each failure.

## Rules

- Never suppress or skip hooks.
- If `pre-commit` is not installed, tell the user to run
  `pip install pre-commit && pre-commit install`.
