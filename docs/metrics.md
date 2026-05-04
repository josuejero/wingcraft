# Wingcraft Metrics

Wingcraft metrics are generated from the repository and CI outputs. They are intended to make parser regression behavior, fixture coverage, build output, and quality gates visible without manually inflating claims.

## Generated Reports

- `reports/metrics/latest.json` is the committed machine-readable snapshot.
- `reports/metrics/latest.md` is the committed human-readable snapshot.
- `reports/metrics/parser-validation.json` and `reports/metrics/frontend-build.json` are local/CI intermediate reports and are not committed.
- Coverage, Playwright, and Lighthouse outputs are CI artifacts, not committed project files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Builds `@wingcraft/parser` and validates all seeded incidents. |
| `npm run metrics` | Builds the frontend and regenerates committed latest metrics. |
| `npm run test:unit` | Runs Vitest with V8 coverage and baseline 70% thresholds. |
| `npm run test:e2e` | Runs Playwright Chromium smoke tests against the built frontend. |
| `npm run lhci` | Runs Lighthouse CI against `frontend/dist`. |
| `npm run audit:high` | Fails on high or critical npm audit findings. |
| `npm run quality` | Runs the local quality gate sequence. |

## Interpreting Parser Metrics

The parser validation report checks every seeded incident fixture against the parser output for:

- Diagnosis label.
- Priority.
- Escalation flag.
- Evidence line count.
- Signature id, when a signature matched.
- Confidence score.

This is a regression metric for the fixtures in this repository. It should be described as seeded incident validation, not broad parser accuracy. Independent accuracy claims would require separate logs that were not used to design the rules.

## Budgets

The initial quality budgets are intentionally baseline-friendly:

- Vitest coverage: 70% global lines, statements, functions, and branches.
- JavaScript gzip bundle: 100 kB.
- CSS gzip bundle: 10 kB.
- Lighthouse performance: 80 or higher.
- Lighthouse accessibility: 90 or higher.
- Lighthouse best practices: 90 or higher.
- Lighthouse SEO: 80 or higher.

These thresholds should only be raised after the generated reports show stable headroom.

## CI Artifacts

The `Quality` workflow uploads:

- `reports/metrics`
- `reports/test-results`
- `reports/lighthouse`
- `coverage`

The workflow also writes a Markdown job summary through `$GITHUB_STEP_SUMMARY` so reviewers can see parser validation, coverage, browser smoke tests, Lighthouse, bundle size, and audit status without reading raw logs.
