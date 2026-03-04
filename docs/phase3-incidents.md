# Phase 3 Reproducible Incidents

This catalog documents the 15 Phase 3 scenarios so the Ops Lab behaves like a support playbook. Each entry references the broken files under `ops-lab/configs/templates/<scenario>`, the log signature produced by `ops-lab/scripts/fault-injector/<scenario>.sh`, the safe-first action, and the reset helper that reruns `archive-reset.sh` + `prepare-scenario.sh <scenario>` so your next attempt is clean.

Several scenarios call out PaperMC's guidance (log review, plugin compatibility, startup/runtime checks) and Pterodactyl's docs around memory headroom or networking so the problems stay tethered to realistic infrastructure problems.

## 1. Bad plugin jar
- Template: `ops-lab/configs/templates/bad-plugin-jar` (plugin descriptor + corrupted `BadJar.jar`).
- Log signature: `ops-lab/scripts/fault-injector/bad-plugin-jar.sh`.
- Safe-first step: stop the server, snapshot `plugins/BadJar`, replace the corrupted jar, then restart.
- Reset: `ops-lab/scripts/reset-bad-plugin-jar.sh`.

## 2. Outdated library dependency
- Template: `ops-lab/configs/templates/outdated-library` (LegacyNetBridge + bundled `netty-4.0.0.jar`).
- Log signature: `ops-lab/scripts/fault-injector/outdated-library.sh`.
- Safe-first step: stop, snapshot plugin/libs, and deploy a build targeting the current Paper API.
- Reset: `ops-lab/scripts/reset-outdated-library.sh`.

## 3. Bad plugin config
- Template: `ops-lab/configs/templates/bad-plugin-config` (`ChunkGuard/config.yml` is malformed).
- Log signature: `ops-lab/scripts/fault-injector/bad-plugin-config.sh`.
- Safe-first step: stop, backup the config, roll back the invalid option or reload defaults.
- Reset: `ops-lab/scripts/reset-bad-plugin-config.sh`.

## 4. Wrong server-ip value
- Template: `ops-lab/configs/templates/wrong-server-ip` (`server-ip=192.168.99.123`).
- Log signature: `ops-lab/scripts/fault-injector/wrong-server-ip.sh`.
- Safe-first step: stop the JVM, clear `server-ip`, and restart so the stack can bind to the bridge network.
- Reset: `ops-lab/scripts/reset-wrong-server-ip.sh`.

## 5. Failed bind to port
- Template: `ops-lab/configs/templates/failed-port-bind` (default props paired with env overriding `MINECRAFT_PORT=25566`).
- Log signature: `ops-lab/scripts/fault-injector/failed-port-bind.sh`.
- Safe-first step: drain traffic, inspect `ss -tulpn`, free port 25565, and then restart.
- Reset: `ops-lab/scripts/reset-failed-port-bind.sh`.

## 6. Wrong startup jar name
- Template: `ops-lab/configs/templates/wrong-startup-jar` (wrapper pointing at `paper-server-old.jar`, while only `paperclip.jar` exists).
- Log signature: `ops-lab/scripts/fault-injector/wrong-startup-jar.sh`.
- Safe-first step: stop the wrapper, update the jar path (or rename the file), and restart.
- Reset: `ops-lab/scripts/reset-wrong-startup-jar.sh`.

## 7. Outdated Java version
- Template: `ops-lab/configs/templates/outdated-java` (start script runs `/opt/java11/bin/java`).
- Log signature: `ops-lab/scripts/fault-injector/outdated-java.sh`.
- Safe-first step: stop, point to Java 17, rerun `java -version`, and restart.
- Reset: `ops-lab/scripts/reset-outdated-java.sh`.

## 8. World opened with newer Minecraft version
- Template: `ops-lab/configs/templates/world-newer-version` (world directory includes a 1.20.4 `level.dat`).
- Log signature: `ops-lab/scripts/fault-injector/world-newer-version.sh`.
- Safe-first step: stop, collect `world/level.dat` + `paper.yml` metadata, and align the server/world version before restarting.
- Reset: `ops-lab/scripts/reset-world-version.sh`.

## 9. Circular plugin loading
- Template: `ops-lab/configs/templates/circular-plugin` (`LoopHook` declares `load-after: [LoopHook]`).
- Log signature: `ops-lab/scripts/fault-injector/circular-plugin.sh`.
- Safe-first step: stop, remove one of the circular plugins, and restart.
- Reset: `ops-lab/scripts/reset-circular-plugin.sh`.

## 10. Startup loop after config corruption
- Template: `ops-lab/configs/templates/config-corruption-loop` (`paper.yml` contains invalid characters).
- Log signature: `ops-lab/scripts/fault-injector/config-corruption-loop.sh`.
- Safe-first step: halt the container, restore a clean `paper.yml`, and restart when the file validates.
- Reset: `ops-lab/scripts/reset-config-corruption.sh`.

## 11. Missing environment variable in wrapper
- Template: `ops-lab/configs/templates/missing-env-var` (wrapper exits if `WORLD_NAME` or `JAVA_HOME` empty).
- Log signature: `ops-lab/scripts/fault-injector/missing-env-var.sh`.
- Safe-first step: supply the missing env vars or source the wrapper's `.env` before restarting.
- Reset: `ops-lab/scripts/reset-missing-env-var.sh`.

## 12. Container memory headroom misconfiguration
- Template: `ops-lab/configs/templates/memory-headroom` + `env/memory-headroom.env` (`MAX_MEMORY=6G`).
- Log signature: `ops-lab/scripts/fault-injector/memory-headroom.sh`.
- Safe-first step: stop traffic, document `docker inspect`/`docker stats`, and lower MAX_MEMORY or increase container limits per Pterodactyl docs.
- Reset: `ops-lab/scripts/reset-memory-headroom.sh`.

## 13. Network allocation mismatch
- Template: `ops-lab/configs/templates/network-mismatch` with `server-ip=127.0.0.1` + env forcing port 25575.
- Log signature: `ops-lab/scripts/fault-injector/network-mismatch.sh`.
- Safe-first step: pause the load balancer, gather Docker/Pterodactyl network info, and align `server-ip`/port with 10.0.0.5:25575.
- Reset: `ops-lab/scripts/reset-network-mismatch.sh`.

## 14. Plugin update required
- Template: `ops-lab/configs/templates/plugin-update-required` (BetterJoin built for Paper 1.18 and bundles legacy libs).
- Log signature: `ops-lab/scripts/fault-injector/plugin-update-required.sh`.
- Safe-first step: stop, quarantine the plugin, and install a version tested against Paper 1.20.
- Reset: `ops-lab/scripts/reset-plugin-update.sh`.

## 15. Ambiguous crash with insufficient evidence
- Template: `ops-lab/configs/templates/ambiguous-crash` (`logs/crash-report.log` is truncated).
- Log signature: `ops-lab/scripts/fault-injector/ambiguous-crash.sh`.
- Safe-first step: stop the JVM if it loops, collect the crash report + `docker inspect`, and escalate per the docs.
- Reset: `ops-lab/scripts/reset-ambiguous-crash.sh`.

Each scenario is linked from the frontend catalog, the docs, and the parser dataset so candidates can begin from log evidence and follow the reproducible steps end-to-end.
