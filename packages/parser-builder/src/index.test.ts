import { describe, expect, it, vi } from 'vitest'
import { seededIncidents } from '@wingcraft/data'
import { labelHeuristics } from '@wingcraft/parser-heuristics'
import { createBuilder } from './index'
import type { ClassificationSummary } from '@wingcraft/types'

const builder = createBuilder({
  heuristics: labelHeuristics,
  seededIncidents
})

describe('createBuilder', () => {
  it('returns seeded incident metadata when evidence matches', () => {
    const incident = seededIncidents[0]
    const classification: ClassificationSummary = {
      label: incident.label,
      severity: incident.severity,
      priority: incident.priority,
      matchedKeywords: incident.evidenceLines,
      confidenceScore: 0.75
    }

    const result = builder.buildTriageResult({
      logText: incident.evidenceLines.join('\n'),
      classification
    })

    expect(result.matchedIncidentId).toBe(incident.id)
    expect(result.label).toBe(incident.label)
    expect(result.confidenceScore).toBe(0.75)
    expect(result.fieldSources?.confidenceScore).toBe('heuristic')
  })

  it('builds a deterministic safe fallback shape from heuristics', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)

    const result = builder.buildTriageResult({
      logText: 'unknown crash',
      classification: {
        label: 'needs escalation',
        severity: 'HIGH',
        priority: 'P1',
        matchedKeywords: [],
        confidenceScore: 0.2
      }
    })

    expect(result).toMatchObject({
      id: 'auto-123',
      label: 'needs escalation',
      priority: 'P1',
      escalate: true,
      affectedComponent: 'External ops partner'
    })
    expect(result.evidenceLines).toEqual([
      'No direct match in seeded incidents; evidence gathered from heuristics.'
    ])

    vi.restoreAllMocks()
  })
})
