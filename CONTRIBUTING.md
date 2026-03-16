# Contributing

Thank you for your interest in improving this project.

## Who Can Contribute

- Web developers who spot rendering issues or accessibility gaps
- Designers who notice responsive layout problems
- Anyone who finds a bug in the HTML, CSS, or JavaScript

## How to Report an Issue

Open a [GitHub Issue](../../issues) describing:

- Which page or component is affected
- What is wrong or broken
- What the correct behavior should be
- Browser and device used

## How to Submit a Fix

1. Fork the repository
2. Create a branch: `git checkout -b fix/short-description`
3. Make your changes
4. Run pre-commit hooks: `pre-commit run --all-files`
5. Open a Pull Request against `main` with a clear description of what you changed and why

## Code Guidelines

- HTML must pass HTMLHint validation
- CSS must pass Stylelint (standard config)
- JavaScript must pass ESLint (browser environment)
- All web files must be formatted with Prettier
- Markdown must pass markdownlint (config in `.markdownlint.yaml`)
- Commits must follow [Conventional Commits](https://www.conventionalcommits.org/)

## Questions

Reach out via email: <gamaware@gmail.com>
