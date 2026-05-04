import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'
import {
  buildTriageResult,
  seededIncidentRecords,
  type IncidentRecord,
  type TriageResult
} from './index.js'

export type ParserValidationCheck = {
  label: boolean
  priority: boolean
  escalate: boolean
}

export type ParserValidationIncident = {
  id: string
  expected: Pick<IncidentRecord, 'label' | 'priority' | 'escalate'>
  actual: Pick<TriageResult, 'label' | 'priority' | 'escalate'> & {
    evidenceCount: number
    signatureId: string | null
    confidenceScore: number | null
    matchedIncidentId: string | null
  }
  checks: ParserValidationCheck
  passed: boolean
}

export type ParserValidationSummary = {
  seededIncidents: number
  passed: number
  failed: number
  passRate: number
  labelMatchRate: number
  priorityMatchRate: number
  escalationMatchRate: number
  evidenceCaptureRate: number
  confidence: {
    min: number | null
    max: number | null
    average: number | null
  }
}

export type ParserValidationReport = {
  project: 'Wingcraft'
  generatedAt: string
  summary: ParserValidationSummary
  incidents: ParserValidationIncident[]
  failures: string[]
}

const round = (value: number): number => Math.round(value * 10000) / 10000

const ratio = (count: number, total: number): number => (total === 0 ? 0 : round(count / total))

const buildFailureMessages = (incident: ParserValidationIncident): string[] => {
  const failures: string[] = []

  if (!incident.checks.label) {
    failures.push(
      `${incident.id}: expected label ${incident.expected.label} but got ${incident.actual.label}`
    )
  }
  if (!incident.checks.priority) {
    failures.push(
      `${incident.id}: expected priority ${incident.expected.priority} but got ${incident.actual.priority}`
    )
  }
  if (!incident.checks.escalate) {
    failures.push(
      `${incident.id}: expected escalate ${incident.expected.escalate} but got ${incident.actual.escalate}`
    )
  }

  return failures
}

const validateIncident = (incident: IncidentRecord): ParserValidationIncident => {
  const logText = incident.evidenceLines.join('\n')
  const result = buildTriageResult(logText)
  const checks = {
    label: result.label === incident.label,
    priority: result.priority === incident.priority,
    escalate: result.escalate === incident.escalate
  }

  return {
    id: incident.id,
    expected: {
      label: incident.label,
      priority: incident.priority,
      escalate: incident.escalate
    },
    actual: {
      label: result.label,
      priority: result.priority,
      escalate: result.escalate,
      evidenceCount: result.evidenceLines.length,
      signatureId: result.signature?.id ?? null,
      confidenceScore: result.confidenceScore ?? null,
      matchedIncidentId: result.matchedIncidentId ?? null
    },
    checks,
    passed: checks.label && checks.priority && checks.escalate
  }
}

export function runParserValidation(
  generatedAt = new Date().toISOString()
): ParserValidationReport {
  const incidents = seededIncidentRecords.map(validateIncident)
  const confidenceScores = incidents
    .map((incident) => incident.actual.confidenceScore)
    .filter((value): value is number => typeof value === 'number')

  const failures = incidents.flatMap(buildFailureMessages)
  const total = incidents.length

  return {
    project: 'Wingcraft',
    generatedAt,
    summary: {
      seededIncidents: total,
      passed: incidents.filter((incident) => incident.passed).length,
      failed: incidents.filter((incident) => !incident.passed).length,
      passRate: ratio(incidents.filter((incident) => incident.passed).length, total),
      labelMatchRate: ratio(incidents.filter((incident) => incident.checks.label).length, total),
      priorityMatchRate: ratio(
        incidents.filter((incident) => incident.checks.priority).length,
        total
      ),
      escalationMatchRate: ratio(
        incidents.filter((incident) => incident.checks.escalate).length,
        total
      ),
      evidenceCaptureRate: ratio(
        incidents.filter((incident) => incident.actual.evidenceCount > 0).length,
        total
      ),
      confidence: {
        min: confidenceScores.length ? round(Math.min(...confidenceScores)) : null,
        max: confidenceScores.length ? round(Math.max(...confidenceScores)) : null,
        average: confidenceScores.length
          ? round(confidenceScores.reduce((sum, value) => sum + value, 0) / confidenceScores.length)
          : null
      }
    },
    incidents,
    failures
  }
}

const escapeMarkdown = (value: unknown): string => String(value).replace(/\|/g, '\\|')

export function renderParserValidationMarkdown(report: ParserValidationReport): string {
  const lines = [
    '# Parser Validation Metrics',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '| Metric | Result |',
    '| --- | ---: |',
    `| Seeded incidents | ${report.summary.seededIncidents} |`,
    `| Passed | ${report.summary.passed} |`,
    `| Failed | ${report.summary.failed} |`,
    `| Pass rate | ${Math.round(report.summary.passRate * 100)}% |`,
    `| Label match rate | ${Math.round(report.summary.labelMatchRate * 100)}% |`,
    `| Priority match rate | ${Math.round(report.summary.priorityMatchRate * 100)}% |`,
    `| Escalation match rate | ${Math.round(report.summary.escalationMatchRate * 100)}% |`,
    `| Evidence capture rate | ${Math.round(report.summary.evidenceCaptureRate * 100)}% |`,
    '',
    '| Incident | Label | Priority | Escalate | Evidence | Signature | Confidence | Result |',
    '| --- | --- | --- | --- | ---: | --- | ---: | --- |',
    ...report.incidents.map((incident) => {
      const confidence =
        typeof incident.actual.confidenceScore === 'number'
          ? `${Math.round(incident.actual.confidenceScore * 100)}%`
          : 'n/a'

      return [
        escapeMarkdown(incident.id),
        escapeMarkdown(`${incident.actual.label} (${incident.checks.label ? 'match' : 'mismatch'})`),
        escapeMarkdown(
          `${incident.actual.priority} (${incident.checks.priority ? 'match' : 'mismatch'})`
        ),
        escapeMarkdown(
          `${incident.actual.escalate} (${incident.checks.escalate ? 'match' : 'mismatch'})`
        ),
        incident.actual.evidenceCount,
        escapeMarkdown(incident.actual.signatureId ?? 'heuristic'),
        confidence,
        incident.passed ? 'pass' : 'fail'
      ].join(' | ')
    }).map((row) => `| ${row} |`)
  ]

  if (report.failures.length) {
    lines.push('', '## Failures', '', ...report.failures.map((failure) => `- ${failure}`))
  }

  return `${lines.join('\n')}\n`
}

export async function writeParserValidationReports(
  report: ParserValidationReport,
  outputs: { jsonPath?: string; markdownPath?: string }
): Promise<void> {
  const writes: Promise<unknown>[] = []

  if (outputs.jsonPath) {
    writes.push(
      mkdir(dirname(outputs.jsonPath), { recursive: true }).then(() =>
        writeFile(outputs.jsonPath!, `${JSON.stringify(report, null, 2)}\n`)
      )
    )
  }

  if (outputs.markdownPath) {
    writes.push(
      mkdir(dirname(outputs.markdownPath), { recursive: true }).then(() =>
        writeFile(outputs.markdownPath!, renderParserValidationMarkdown(report))
      )
    )
  }

  await Promise.all(writes)
}

const getArgValue = (args: string[], name: string): string | undefined => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

const runCli = async () => {
  const args = process.argv.slice(2)
  const report = runParserValidation()

  await writeParserValidationReports(report, {
    jsonPath: getArgValue(args, '--json'),
    markdownPath: getArgValue(args, '--markdown')
  })

  if (report.failures.length) {
    console.error('Parser validation failed:')
    report.failures.forEach((msg) => console.error(msg))
    process.exitCode = 1
    return
  }

  console.log(`Parser validation succeeded for ${report.summary.seededIncidents} seeded incidents.`)
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url)

if (isCli) {
  runCli().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
