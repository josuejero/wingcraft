import { describe, expect, it } from 'vitest'
import { createParserEngine, runParserPipeline } from './index'
import type { ParserPipelineStages } from './pipeline'

describe('runParserPipeline', () => {
  it('passes normalized text through signature, classifier, and builder stages', () => {
    const stages: ParserPipelineStages = {
      normalize: (logText) => ({
        normalizedText: logText.toLowerCase(),
        normalizedLines: [{ raw: logText, normalized: logText.toLowerCase() }]
      }),
      detectSignature: (normalizedLines) => ({
        id: 'custom',
        name: 'Custom',
        description: 'Custom test signature',
        label: 'startup error',
        severity: 'HIGH',
        hints: [],
        matchedLines: normalizedLines.map((line) => line.raw),
        confidenceScore: 0.7
      }),
      classify: ({ signature }) => ({
        label: signature!.label,
        severity: signature!.severity,
        priority: 'P1',
        matchedKeywords: signature!.matchedLines,
        confidenceScore: signature!.confidenceScore,
        signature
      }),
      build: ({ classification }) => ({
        id: 'custom-result',
        category: 'startup',
        label: classification.label,
        severity: classification.severity,
        priority: classification.priority,
        affectedComponent: 'test',
        evidenceLines: classification.matchedKeywords,
        safeFirstStep: 'stop',
        likelyCause: 'test',
        customerMessage: 'test',
        evidenceToCollect: [],
        escalate: false,
        resolutionNotes: 'test',
        confidenceScore: classification.confidenceScore
      })
    }

    const output = runParserPipeline(stages, 'Failed to start server')

    expect(output.normalization.normalizedText).toBe('failed to start server')
    expect(output.signature?.id).toBe('custom')
    expect(output.classification.priority).toBe('P1')
    expect(output.triage.id).toBe('custom-result')
  })
})

describe('createParserEngine', () => {
  it('allows individual stages to be overridden', () => {
    const parser = createParserEngine({
      classify: () => ({
        label: 'needs escalation',
        severity: 'HIGH',
        priority: 'P1',
        matchedKeywords: [],
        confidenceScore: 0.2
      })
    })

    const result = parser.buildTriageResult('plain unknown log')

    expect(result.label).toBe('needs escalation')
    expect(result.escalate).toBe(true)
  })
})
