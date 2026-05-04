# Security Policy

## Supported Versions

Wingcraft is a portfolio and incident-triage lab project. The `main` and `master` branches are the only supported branches for security fixes.

## Reporting A Vulnerability

Please open a private security advisory if the repository host supports it. If private advisories are unavailable, contact the repository owner directly and avoid posting exploit details in a public issue.

Include:

- A short description of the issue.
- Steps to reproduce.
- Affected package, workflow, or frontend path.
- Any relevant logs, screenshots, or dependency advisory links.

## Dependency And Supply-Chain Checks

The quality workflow runs `npm audit --audit-level=high`. Dependabot, CodeQL, and OpenSSF Scorecard are configured to surface dependency, static-analysis, and repository-health signals.

## License Note

No open-source license is declared for this repository. Do not assume reuse rights beyond viewing the code unless the repository owner adds a license later.
