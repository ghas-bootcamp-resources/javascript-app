# GHAS Expense Tracker

GHAS Expense Tracker is a local-only JavaScript application for GitHub Advanced Security training. It is a small Express app that tracks expenses, stores data in SQLite, saves local receipt text files, and exports reports.

> This repository intentionally contains vulnerable code, vulnerable dependencies, secret scanning placeholders, and code quality issues for training. Do not deploy it.

## Quickstart

```bash
npm install
npm test
npm run test:coverage
npm start
```

Open <http://localhost:3000> after starting the app.

## What this repo demonstrates

- Code scanning with CodeQL findings for SQL injection, path traversal, command injection, XSS, prototype pollution, log injection, and missing rate limiting.
- Dependabot alerts from legitimate, intentionally outdated packages in `package.json` and `package-lock.json`.
- Secret scanning using four placeholder slots in `src/security-labs/approvedSecretPlaceholders.js`.
- Code Quality findings in `src/code-quality-labs/qualityIssues.js`.
- A test suite with coverage thresholds of at least 80%.

## Training docs

- [GHAS training map](docs/ghas-training-map.md)
- [Remediation guide](docs/remediation-guide.md)

## Local data

The app writes local runtime data to `.expense-tracker-data/`. This directory is ignored by Git.
