# GitHub Advanced Security training map

This repository is intentionally vulnerable. It is designed for local training and should not be deployed.

## Code scanning

| Area | File | CWE | Expected CodeQL query |
|---|---|---:|---|
| SQL injection | `src/db.js` | CWE-89 | `js/sql-injection` |
| Path traversal | `src/services/receiptService.js` | CWE-22 / CWE-73 | `js/path-injection` |
| Command injection | `src/services/reportService.js` | CWE-78 / CWE-88 | `js/command-line-injection` |
| Cross-site scripting | `src/routes/expenses.js` | CWE-79 | `js/reflected-xss` or `js/html-constructed-from-input` |
| Prototype pollution | `src/security-labs/prototypePollution.js` | CWE-94 / CWE-1321 | `js/prototype-pollution` family |
| Log injection | `src/security-labs/logging.js` | CWE-117 | `js/log-injection` |
| Missing rate limiting | `src/routes/expenses.js` | CWE-307 | `js/missing-rate-limiting` |

## Dependabot

`package.json` intentionally includes legitimate packages with known advisories so Dependabot can open alerts and remediation pull requests. The packages are widely used training dependencies, not known malware packages.

## Secret scanning

Add the four company-approved inactive keys to `src/security-labs/approvedSecretPlaceholders.js` when you are ready to demonstrate secret scanning. Do not add unapproved real credentials.

## Code Quality

`src/code-quality-labs/qualityIssues.js` contains intentional maintainability issues such as repeated branches, unreachable code, redundant conditions, and imprecise regular expressions.
