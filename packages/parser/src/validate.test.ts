import { describe, expect, it } from 'vitest'
import { buildTriageResult, seededIncidentRecords } from './index'
import { renderParserValidationMarkdown, runParserValidation } from './validate'

describe('seeded parser behavior', () => {
  it('matches label, priority, and escalation for every seeded incident', () => {
    for (const incident of seededIncidentRecords) {
      const result = buildTriageResult(incident.evidenceLines.join('\n'))

      expect(result.label, incident.id).toBe(incident.label)
      expect(result.priority, incident.id).toBe(incident.priority)
      expect(result.escalate, incident.id).toBe(incident.escalate)
    }
  })

  it('routes unknown logs to safe escalation fallback behavior', () => {
    const result = buildTriageResult('unrecognized crash with no known parser tokens')

    expect(result.label).toBe('needs escalation')
    expect(result.priority).toBe('P1')
    expect(result.escalate).toBe(true)
    expect(result.evidenceLines[0]).toContain('No direct match')
  })
})

describe('runParserValidation', () => {
  it('summarizes seeded incident pass rates and confidence', () => {
    const report = runParserValidation('2026-05-04T00:00:00.000Z')

    expect(report.summary.seededIncidents).toBe(15)
    expect(report.summary.passed).toBe(15)
    expect(report.summary.failed).toBe(0)
    expect(report.summary.labelMatchRate).toBe(1)
    expect(report.summary.priorityMatchRate).toBe(1)
    expect(report.summary.escalationMatchRate).toBe(1)
    expect(report.summary.confidence.average).toBeGreaterThan(0)
  })

  it('renders a Markdown report for committed metrics', () => {
    const report = runParserValidation('2026-05-04T00:00:00.000Z')
    const markdown = renderParserValidationMarkdown(report)

    expect(markdown).toContain('# Parser Validation Metrics')
    expect(markdown).toContain('| Pass rate | 100% |')
    expect(markdown).toContain('| phase3-001')
  })
})
