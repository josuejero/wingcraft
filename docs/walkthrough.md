# Walkthrough: Resolving a plugin/config conflict

1. **Evidence ingestion** – The Ops Lab log `logs/latest.log` records the lines `java.lang.IllegalArgumentException: Cannot set property 'world-edit' to 'true'` and `Loading plugin WorldGuard v7.0.5`. Paste that excerpt into the frontend textarea or run `@wingcraft/parser/buildTriageResult` with the same text.

2. **Classification** – The parser matches keywords like `illegalargumentexception` and `loading plugin` to the `plugin/config conflict` label, classifies the severity as `HIGH`, maps to `P1`, and notes that the internal `fieldSources` indicate the configuration fields came from the `plugin/config conflict` template while the log-derived `evidenceLines` came from heuristics. Under the hood, `@wingcraft/parser` wires `@wingcraft/parser-heuristics`, `@wingcraft/parser-classifier`, and `@wingcraft/parser-builder` together so each concern can be composed or replaced without changing the orchestrator.

3. **Safe-first action** – The recommended safe step (also present in `packages/data/incidents.json` for incident `inc-002`) is to stop the server, snapshot `plugins`/`config`, and disable the conflicting plugin before editing files. The `ops-lab/scripts/stop-server.sh` script provides that stop step without touching live players.

4. **Customer message** – The `customerMessage` from the incident record explains that WorldGuard’s config conflicts with Paper protection defaults. Share that wording with the customer to communicate the cause calmly while you investigate.

5. **Evidence collection** – The parser and incident record both remind you to gather `plugins/WorldGuard/config.yml`, `paper.yml` chunk settings, and the stack trace. Running `ops-lab/scripts/collect-evidence.sh` captures the recent logs and container inspect output to attach to the ticket.

6. **Escalation decision** – Because `inc-002` has `escalate: false`, the incident stays in the frontline queue. The parser surfaces that flag so recruiters can see the tool respects escalation policy.

7. **Resolution notes** – After rolling back the config, the resolution in `packages/data/incidents.json` states, “Pushed patched config via git; plugin loads after reapplying older option semantics.” That message closes the loop between the lab (where you disable the plugin), the parser/UI (where you classically classify), and the candidate-facing narrative.

This walkthrough demonstrates how log-based diagnosis, safe-first scripts, and curated incident metadata combine to produce a “good triage result.”
