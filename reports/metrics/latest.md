# Wingcraft Metrics

Generated: 2026-05-04T19:19:16.456Z
Git: master @ c4783cb

> Seeded parser validation is a regression metric for the fixtures in this repo, not an independent accuracy claim.

| Metric | Current result |
| --- | ---: |
| Parser seeded incident validation | 15/15 passed |
| Diagnosis labels covered | 5 |
| Priority tiers covered | P0, P1, P2 |
| Escalation cases | 6 |
| TypeScript workspace packages | 9 |
| Source/doc/config files | 172 |
| Nonblank source/doc/config lines | 4698 |
| Signature patterns | 6 |
| Regex matchers | 32 |
| Ops-lab incident manifests | 17 |
| Frontend JS gzip | 68.43 kB |
| Frontend CSS gzip | 1.58 kB |

## Quality Gates

| Gate | Status |
| --- | --- |
| lint | recorded in CI |
| unitCoverage | 96.55% lines |
| playwright | passed |
| lighthouse | passed |
| dependencyAudit | high severity gate configured |
| openssfScorecard | recorded in GitHub Actions |
