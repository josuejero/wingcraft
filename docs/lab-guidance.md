# Ops Lab Guidance

This private lab mirrors the “safe first step, evidence-first, escalate when necessary” workflow described in Phase 1. The lab uses Docker Compose to run a PaperMC server inside `ops-lab/`, and the `scripts/` folder provides quick commands for the safe-first checklist.

## Safe-first checklist
1. **Stop traffic** – run `ops-lab/scripts/stop-server.sh` before modifying plugins, properties, or files.
2. **Back up** – `ops-lab/scripts/backup-logs.sh` copies the latest `logs/` directory so you can reference the exact evidence that triggered the incident.
3. **Inspect** – `ops-lab/scripts/tail-logs.sh` and `ops-lab/scripts/collect-evidence.sh` gather the last 60 log lines, filtered logs, and container metadata.
4. **Document** – the resulting `logs/evidence.log` and `logs/inspect.json` go into the incident record as “what evidence to collect.”

## Reproducing seeded incidents
Each of the 15 seeded incidents in `packages/data/incidents.json` (exported via `@wingcraft/data`) contains evidence lines that can be simulated via server log injection or config tweaks:
- For **startup errors**, corrupt or rename `ops-lab/data/paperclip.jar` temporarily and watch the server refuse to start.
- For **plugin/config conflicts**, edit `ops-lab/data/plugins/<plugin>/config.yml` or drop an incompatible jar into `ops-lab/data/plugins` and restart.
- For **version mismatches**, set `server.properties` to a different protocol (`minecraft-protocol=1.16.5`) and watch the handshake logs.
- For **infrastructure issues**, trigger port conflicts by starting another `paper` container or consume memory with `stress-ng` on the host.
- For **needs escalation**, simulate provider outages by toggling the `backend` network or pointing backups at a local HTTP endpoint that returns 500.

## Connecting to the schema
Every incident you reproduce should be logged using the schema in `packages/data/incident-schema.json`. Note how the schema lists the fields for category, affected component, safe first step, what to tell the customer, and whether escalation is required.

## Tying lab work to the parser/UI
After collecting evidence, paste the relevant log excerpt into `frontend/` (or run `@wingcraft/parser/buildTriageResult` via Node). The parser modules reference `@wingcraft/data`, so the React UI can truthfully highlight which fields were seeded versus heuristically inferred.
