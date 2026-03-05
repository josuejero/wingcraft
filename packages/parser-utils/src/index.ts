import type { FieldSource, IncidentRecord } from '@wingcraft/types'

export type FieldSourceMap = Partial<Record<keyof IncidentRecord, FieldSource>>

export interface SeededMatchArgs {
  logText: string
  label: IncidentRecord['label']
  seededIncidents: IncidentRecord[]
  normalizedLogText?: string
}

export type NormalizedLogLine = {
  raw: string
  normalized: string
}

const stripTimestamp = (line: string): string => {
  let result = line.replace(/\r/g, '')
  const timestampPatterns = [
    /^\[\d{1,2}:\d{2}:\d{2}(?:\.\d+)?\]\s*/,
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s*/,
    /^\d{1,2}:\d{2}:\d{2}\s*/
  ]
  for (const pattern of timestampPatterns) {
    result = result.replace(pattern, '')
  }
  return result
}

const normalizeWhitespace = (line: string): string => line.replace(/\s+/g, ' ').trim()

export const normalizeLogLines = (text: string): NormalizedLogLine[] => {
  const normalizedText = text.replace(/\r\n/g, '\n')
  return normalizedText
    .split('\n')
    .map((rawLine) => rawLine.trim())
    .filter((line) => line.length > 0)
    .map((rawLine) => {
      const cleaned = normalizeWhitespace(stripTimestamp(rawLine))
      return {
        raw: rawLine,
        normalized: cleaned.toLowerCase()
      }
    })
}

export const normalizeLogText = (text: string): string =>
  normalizeLogLines(text)
    .map((line) => line.normalized)
    .join('\n')

export const matchSeededIncident = ({
  logText,
  label,
  seededIncidents,
  normalizedLogText
}: SeededMatchArgs): IncidentRecord | undefined => {
  const normalizedLog = normalizedLogText ?? normalizeLogText(logText)

  return seededIncidents.find((candidate: IncidentRecord) =>
    candidate.label === label &&
    candidate.evidenceLines.some((line: string) => normalizedLog.includes(line.toLowerCase()))
  )
}

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
