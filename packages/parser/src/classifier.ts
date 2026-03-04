import type { IncidentRecord, TriageResult, ClassificationSummary, FieldSource } from './types.js'
import { seededIncidentRecords, priorityMapping } from './data.js'
import { labelHeuristics } from './heuristics.js'

const priorityRules = priorityMapping

function normalize(text: string): string {
  return text.toLowerCase()
}

export function classifyIncident(logText: string): ClassificationSummary {
  const normalized = normalize(logText)
  let best: {
    label: IncidentRecord['label']
    score: number
    matched: string[]
    severity: IncidentRecord['severity']
  } | null = null

  for (const [label, rule] of Object.entries(labelHeuristics) as [
    IncidentRecord['label'],
    typeof labelHeuristics[IncidentRecord['label']]
  ][]) {
    const matched = rule.keywords.filter((keyword: string) => normalized.includes(keyword))
    const score = matched.length
    if (!best || score > best.score) {
      best = { label, score, matched, severity: rule.defaultSeverity }
    }
  }

  if (!best || best.score === 0) {
    const fallback = labelHeuristics['needs escalation']
    return {
      label: 'needs escalation',
      severity: fallback.defaultSeverity,
      priority: priorityRules[fallback.defaultSeverity]?.priority ?? 'P1',
      matchedKeywords: []
    }
  }

  const severity = best.severity
  const priority = priorityRules[severity]?.priority ?? 'P2'
  return {
    label: best.label,
    severity,
    priority,
    matchedKeywords: best.matched
  }
}

function buildFieldSources(
  incident: IncidentRecord,
  overrides: Partial<IncidentRecord>,
  matched: string[] | null
): Partial<Record<keyof IncidentRecord, FieldSource>> {
  const sources: Partial<Record<keyof IncidentRecord, FieldSource>> = {}
  ;(Object.keys(incident) as (keyof IncidentRecord)[]).forEach((key) => {
    sources[key] = 'seeded'
  })
  ;(Object.keys(overrides) as (keyof IncidentRecord)[]).forEach((key) => {
    sources[key] = 'heuristic'
  })
  if (matched && matched.length) {
    sources.evidenceLines = 'heuristic'
  }
  return sources
}

export function buildTriageResult(logText: string): TriageResult {
  const classification = classifyIncident(logText)
  const normalized = normalize(logText)

  const matchedIncident = seededIncidentRecords.find(
    (candidate: IncidentRecord) =>
      candidate.label === classification.label &&
      candidate.evidenceLines.some((line: string) => normalized.includes(line.toLowerCase()))
  )

  if (matchedIncident) {
    const overrides: Partial<IncidentRecord> = {}
    const resolved: TriageResult = {
      ...matchedIncident,
      ...overrides,
      fieldSources: buildFieldSources(matchedIncident, overrides, classification.matchedKeywords),
      matchedIncidentId: matchedIncident.id
    }
    return resolved
  }

  const template = labelHeuristics[classification.label]
  const defaultId = `auto-${Date.now()}`
  const evidenceLines = classification.matchedKeywords.length
    ? classification.matchedKeywords.map((keyword: string) => `Detected keyword: ${keyword}`)
    : ['No direct match in seeded incidents; evidence gathered from heuristics.']

  const resultBase: IncidentRecord = {
    id: defaultId,
    category: template.defaultCategory,
    label: classification.label,
    severity: classification.severity,
    priority: classification.priority,
    affectedComponent: template.affectedComponent,
    evidenceLines,
    safeFirstStep: template.safeFirstStep,
    likelyCause: template.likelyCause,
    customerMessage: template.customerMessage,
    evidenceToCollect: template.evidenceToCollect,
    escalate: template.escalate,
    resolutionNotes: template.resolutionNotes
  }

  const heuristicsSources = buildFieldSources(resultBase, {}, classification.matchedKeywords)
  ;(Object.keys(resultBase) as (keyof IncidentRecord)[]).forEach((key) => {
    if (!heuristicsSources[key]) {
      heuristicsSources[key] = 'heuristic'
    }
  })

  return {
    ...resultBase,
    fieldSources: heuristicsSources
  }
}
