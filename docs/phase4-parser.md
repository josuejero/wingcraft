# Phase 4 parser pipeline

The Phase 4 parser is a deterministic, client-side TypeScript engine that follows the recommended flow in the lab brief. Each step is local to the browser (and `@wingcraft/parser`) so the recruiter demo stays free and predictable.

## Pipeline stages
1. **Ingest raw log text** – you paste the excerpt, paste a `latest.log` tail, or stream a stack trace into the textarea. The same string feeds the parser pipeline that powers both the frontend and `@wingcraft/parser` validation.
2. **Normalize timestamps and line endings** – every line is trimmed, line endings unify (`\r\n` → `\n`), and common timestamps (e.g., `[12:34:56]` or `2025-01-01 00:00:00`) are removed before everything is lower-cased so pattern matching stays deterministic.
3. **Detect signature patterns** – the parser runs the signature library shown below over the normalized lines. The list mirrors the cues described in the PaperMC docs (latest.log, stack traces, crash reports, plugin faults, and startup failures) so every matcher ties back to a real Paper failure mode.
4. **Extract evidence lines** – when a signature fires, the parser captures those raw log lines for the resulting `evidenceLines` array; the heuristics fallback summarises keywords as "Detected keyword:" entries.
5. **Score confidence** – signature matches carry a base confidence and bump slightly with each matched line (capped at 1). Heuristic matches start at ~0.3 and grow with keyword hits so recruiters can see how confident the rules engine is.
6. **Map to category** – the matching label hooks into `@wingcraft/parser-heuristics`, which provides category, affected component, safe-first step, likely cause, customer message, and evidence-collection guidance.
7. **Generate action plan + customer reply** – the heuristics template fills `safeFirstStep`, `likelyCause`, `customerMessage`, and `evidenceToCollect` so every diagnosis remains calm, safe-first, and consistent with the Phase 3 incidents.
8. **Determine escalation threshold** – the signature severity (plus the heuristics `escalate` flag) drives `priority`/`escalate` decisions so the frontend knows whether the issue stays front-line or hits on-call.

## Modular stage hooks

Each pipeline stage is now its own exported interface so collectors can reuse or replace just the normalization, signature detection, classification, or builder logic. You can access the stage definitions (`NormalizerFn`, `SignatureDetectorFn`, `ClassifierFn`, `BuilderFn`), the composed `ParserPipelineStages`, and the `runParserPipeline` helper from `@wingcraft/parser-core` (re-exported via `@wingcraft/parser`). The default parser pulls in:

- **NormalizerFn** – wraps `normalizeLogLines` from `@wingcraft/parser-utils`, lower-casing and trimming every line while maintaining the raw line order.
- **SignatureDetectorFn** – uses the signature library in `@wingcraft/parser-signatures` to match known PaperMC failure modes.
- **ClassifierFn** – consumes the normalized text/lines plus an optional signature to score heuristics and apply priority rules before handing results downstream.
- **BuilderFn** – turns the `ClassificationSummary` into a `TriageResult` using seeded incidents plus the same heuristics templates.

You can override any stage when creating a parser engine, for example:

```ts
import { createParserEngine } from '@wingcraft/parser'

const customPipeline = createParserEngine({
  detectSignature(lines) {
    // swap in a detector that prefers a custom signature library
    return customDetect(lines)
  }
})

const triage = customPipeline.runPipeline(logText).triage
```

Every stage receives the artifact generated before it (normalized lines, an optional signature, etc.), so the `ClassifierFn` and `BuilderFn` are guaranteed to get the same deterministic inputs used by the default parser.

## Signature library highlights
| Pattern | Label | When it fires |
| --- | --- | --- |
| Port bind failures | `likely infrastructure issue` | Lines containing `failed to bind`, `Address already in use`, or explicit port/`BindException` failures.
| Server IP binding failure | `startup error` | `Cannot assign requested address` paired with `server-ip` or container binding notes so the configured IP can be cleared.
| Plugin names in stack traces | `plugin/config conflict` | `Loading plugin <name>`, `Failed to load plugin`, or `java.lang.IllegalArgumentException`/`NoClassDefFoundError` references in normalized stack-fingerprint form.
| Java/runtime mismatch | `startup error` | `UnsupportedClassVersionError`, "requires Java 17", or other runtime-version markers from `latest.log`.
| "Newer version" worlds | `version mismatch` | Line pairs like `This world was saved with Minecraft ...` alongside `This server supports up to ...` recorded in PaperMC's world-loading checks.
| Memory/container hints | `likely infrastructure issue` | `java.lang.OutOfMemoryError`, `GC overhead limit exceeded`, or container-limit messages that mention `MAX_MEMORY` or enforced quotas.
| No clear signature | `needs escalation` | Falls back when no matcher fires so ambiguous errors escalate immediately.

Each signature includes hints for operators and a base confidence score; heuristics back-stop anything the rules library does not cover.

## References
PaperMC's troubleshooting docs describe where `latest.log`, stack traces, crash reports, and startup failures live, as well as how plugin, Java, and port issues surface, so the signature library mirrors those sections in the public reference.
