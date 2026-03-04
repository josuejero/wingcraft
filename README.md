# Wingcraft Triage Lab

A private operations lab plus public parser frontend for realistic PaperMC incidents. The repo follows the Phase 1 plan: define the incident schema, seed 15 scenarios, build the parser/validator, spin up a Paper ops lab, and expose the results via a React + Vite GitHub Pages site.

## Structure
- `packages/types/` – canonical type definitions exported as `@wingcraft/types` for every consuming surface.
- `packages/data/` – JSON schema, severity/priority rules, and the 15 seeded incidents published via `@wingcraft/data` so every package uses the same dataset.
- `packages/parser/` – TypeScript classifier plus validation script that ships as `@wingcraft/parser` and conforms to the incident schema.
- `frontend/` – React + TypeScript + Vite project that lets interviewers paste logs, view the structured incident record, and browse the seeded scenarios. Deploys to GitHub Pages via workflow under `.github/workflows`.
- `ops-lab/` – Docker Compose lab with scripts for safe-first steps (stop, backup, tail logs, collect evidence) that mirror the documented workflow in `docs/lab-guidance.md`.
- `docs/` – lab guidance and a narrated walkthrough connecting log ingestion, classification, safe-first steps, and customer messaging.

## MVP vs Stretch
| Scope | Status in Phase 1 |
| --- | --- |
| Seeded incidents + schema | ✅ Defined in `packages/data/` and exported through `@wingcraft/data`, covering the schema, priority rules, and all 15 seeded scenarios. |
| Client-side parser | ✅ `@wingcraft/parser/buildTriageResult` runs locally and is reused by both Node validation and the frontend. |
| GitHub Pages frontend | ✅ Vite app renders logs, shows structured fields, and can be deployed via the workflow. |
| Recorded walkthrough | ✅ `docs/walkthrough.md` narrates a full incident. |
| Local ops lab | ✅ `ops-lab/` includes Docker Compose and safe-first scripts for Linux/Docker testing. |
| Stretch items (confidence scoring, search, downloadable reports, GitHub Actions parser fixtures) | ⏳ Reserved for later phases. |

## Getting started
1. **Install dependencies** – run `npm run bootstrap` from the repo root to install workspace dependencies and hoist shared tooling.
2. **Ops Lab** – `cd ops-lab && docker compose up` then follow `scripts/` to stop, backup logs, and collect evidence before touching server files.
3. **Parser validation** – `npm run test` (alias for `@wingcraft/parser`’s validation) to ensure seeded samples produce the expected label, priority, and escalation decisions.
4. **Frontend** – `cd frontend && npm run dev` to launch the static UI; `npm run build --workspace frontend` prepares `frontend/dist` for GitHub Pages, and `npm run build:all` compiles every workspace end-to-end.

## Deploying the frontend
The workflow at `.github/workflows/pages.yml` builds the Vite app and pushes `frontend/dist` to `gh-pages`. The site is a read-only recruiter demo; all sensitive work is done through the private ops lab.
