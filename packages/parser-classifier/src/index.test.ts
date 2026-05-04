import { describe, expect, it } from 'vitest'
import { priorityRules } from '@wingcraft/data'
import { labelHeuristics } from '@wingcraft/parser-heuristics'
import { createClassifier } from './index'
import type { SignatureSummary } from '@wingcraft/types'

const classifyIncident = createClassifier({
  heuristics: labelHeuristics,
  priorityRules
})

describe('createClassifier', () => {
  it('uses signature label, severity, priority, evidence, and confidence first', () => {
    const signature: SignatureSummary = {
      id: 'port-bind-failure',
      name: 'Port bind failure',
      description: 'Port binding failed.',
      label: 'likely infrastructure issue',
      severity: 'CRITICAL',
      hints: ['Check bound ports.'],
      matchedLines: ['Failed to bind to port 25565'],
      confidenceScore: 0.8
    }

    const result = classifyIncident({
      logText: signature.matchedLines[0],
      normalizedText: signature.matchedLines[0].toLowerCase(),
      normalizedLines: [],
      signature
    })

    expect(result).toMatchObject({
      label: 'likely infrastructure issue',
      severity: 'CRITICAL',
      priority: 'P0',
      matchedKeywords: signature.matchedLines,
      confidenceScore: 0.8
    })
  })

  it('falls back to needs escalation for unknown input', () => {
    const result = classifyIncident({
      logText: 'unclear line without known tokens',
      normalizedText: 'unclear line without known tokens',
      normalizedLines: []
    })

    expect(result).toMatchObject({
      label: 'needs escalation',
      priority: 'P1',
      matchedKeywords: [],
      confidenceScore: 0.2
    })
  })

  it('uses heuristics when keywords match without a signature', () => {
    const result = classifyIncident({
      logText: 'plugin conflict and classnotfoundexception',
      normalizedText: 'plugin conflict and classnotfoundexception',
      normalizedLines: []
    })

    expect(result.label).toBe('plugin/config conflict')
    expect(result.priority).toBe('P1')
    expect(result.confidenceScore).toBeGreaterThan(0.3)
  })
})
