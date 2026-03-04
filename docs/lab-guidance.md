# Ops Lab Guidance

This portion of the lab is Compose-first: the Paper server is defined as a top-level `paper` service, persistent state lives in named volumes, and every incident profile lives behind its own `.env` so you can swap scenarios without touching the shared repo. `ops-lab/docker-compose.yml` wires a `paper` service with `paper_world`, `paper_logs`, and `paper_configs` volumes plus a health check so any dependent helpers wait for the server to finish booting.

## Safe-first checklist
1. **Stop traffic** – run `ops-lab/scripts/stop-server.sh` so the Compose stack shuts down cleanly before you edit configs or logs.
2. **Back up** – `ops-lab/scripts/backup.sh` copies the contents of the world, log, and config volumes out to `backups/` (pass a directory argument to override the default timestamped path).
3. **Inspect** – `ops-lab/scripts/tail-logs.sh` replays the last 60 lines and `ops-lab/scripts/collect-evidence.sh` saves timestamped logs, `docker compose ps`, and `docker inspect` metadata under `logs/` for the incident ticket.
4. **Export logs** – `ops-lab/scripts/export-logs.sh` demonstrates the sample log export step by writing `docker compose logs` output into `exports/log-export-<timestamp>.log` so you can drop it into a report.
5. **Document** – attach the generated files (`logs/evidence-*.log`, `logs/inspect-*.json`, `exports/log-export-*.log`) to your incident record, then share them with the parser or UI.

## Scenario management
- Each incident profile keeps its own `.env` under `ops-lab/env/` (`baseline.env`, `plugin-crash.env`, etc.). Run `scripts/prepare-scenario.sh <scenario>` to seed the `paper_configs` volume from `configs/templates/<scenario>` and print the precise `docker compose --env-file` command to bring the lab up.
- The scenario manifests in `ops-lab/incidents/*.yml` describe the profile, which env file to load, which templates to seed, and which fault-injector scripts belong to that incident. Use them to verify you are reproducing the correct evidence before starting the parser or UI.
- When you want a clean slate, `ops-lab/scripts/archive-reset.sh` backs up the volumes, tears the stack down, and removes the named volumes so the next `prepare-scenario` run starts from scratch.

## Fault injection toolkit
The `ops-lab/scripts/fault-injector/` folder is the fault injector script set. Each script writes realistic log lines into `/data/logs/latest.log` inside the `wingcraft_paper_logs` volume; run them via `./scripts/fault-injector/run.sh <script.sh>` (the helper will invoke the `fault-injector` profile so it only runs when you ask for it). Pair the scripts with the manifests above to reenact plugin crashes, tick lag, or connection resets without editing the server jar itself.

## Stretch target
Once the Compose MVP behaves, consider the optional stretch plan: deploy Pterodactyl/Wings on a disposable Linux VM (root required, admin-heavy, and private) and show it in a recorded walkthrough. Follow the Pterodactyl docs for self-hosting, but keep that VM offline and outside this repository.
