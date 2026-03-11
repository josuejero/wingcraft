import type { FieldSource, IncidentRecord } from '@wingcraft/types'

export type FieldSourceMap = Partial<Record<keyof IncidentRecord, FieldSource>>

export const createFieldSourceMap = (
  incident: IncidentRecord,
  overrides: Partial<IncidentRecord>,
  matchedKeywords: string[] = [],
  defaultSource: FieldSource = 'seeded'
): FieldSourceMap => {
  const sources: FieldSourceMap = {}

  ;(Object.keys(incident) as (keyof IncidentRecord)[]).forEach((key) => {
    sources[key] = defaultSource
  })

  ;(Object.keys(overrides) as (keyof IncidentRecord)[]).forEach((key) => {
    sources[key] = 'heuristic'
  })

  if (matchedKeywords.length) {
    sources.evidenceLines = 'heuristic'
  }

  return sources
}

export const createHeuristicEvidenceLines = (matchedKeywords: string[]): string[] => {
  if (matchedKeywords.length) {
    return matchedKeywords.map((keyword: string) => `Detected keyword: ${keyword}`)
  }

  return ['No direct match in seeded incidents; evidence gathered from heuristics.']
}
