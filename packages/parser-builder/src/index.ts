import type {
  ClassificationSummary,
  FieldSource,
  IncidentRecord,
  TriageResult
} from '@wingcraft/types'
import type { LabelHeuristics } from '@wingcraft/parser-heuristics'

export type ClassifierFunction = (logText: string) => ClassificationSummary

export interface BuilderConfig {
  classifier: ClassifierFunction
  heuristics: LabelHeuristics
  seededIncidents: IncidentRecord[]
}

const normalize = (text: string): string => text.toLowerCase()

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

export function createBuilder(config: BuilderConfig) {
  const { classifier, heuristics, seededIncidents } = config

  return {
    buildTriageResult(logText: string): TriageResult {
      const classification = classifier(logText)
      const normalized = normalize(logText)

      const matchedIncident = seededIncidents.find(
        (candidate: IncidentRecord) =>
          candidate.label === classification.label &&
          candidate.evidenceLines.some((line: string) => normalized.includes(line.toLowerCase()))
      )

      if (matchedIncident) {
        const overrides: Partial<IncidentRecord> = {}
        return {
          ...matchedIncident,
          ...overrides,
          fieldSources: buildFieldSources(matchedIncident, overrides, classification.matchedKeywords),
          matchedIncidentId: matchedIncident.id
        }
      }

      const template = heuristics[classification.label] ?? heuristics['needs escalation']
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
  }
}
