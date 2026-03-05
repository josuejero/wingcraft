import type {
  ClassificationSummary,
  IncidentRecord,
  SignatureSummary
} from '@wingcraft/types'
import type { LabelHeuristics } from '@wingcraft/parser-heuristics'
import type { PriorityRuleMap } from '@wingcraft/data'
import type { NormalizedLogLine } from '@wingcraft/parser-utils'

export type ClassifierInput = {
  logText: string
  normalizedText: string
  normalizedLines: NormalizedLogLine[]
  signature?: SignatureSummary
}

export type ClassifierFn = (input: ClassifierInput) => ClassificationSummary

export interface ClassifierConfig {
  heuristics: LabelHeuristics
  priorityRules: PriorityRuleMap
}

export function createClassifier(config: ClassifierConfig): ClassifierFn {
  const { heuristics, priorityRules } = config

  return function classifyIncident({
    normalizedText,
    signature
  }: ClassifierInput): ClassificationSummary {
    if (signature) {
      const severity = signature.severity
      const priority = priorityRules[severity]?.priority ?? 'P1'
      return {
        label: signature.label,
        severity,
        priority,
        matchedKeywords: signature.matchedLines,
        confidenceScore: signature.confidenceScore,
        signature
      }
    }

    let best:
      | {
          label: IncidentRecord['label']
          score: number
          matched: string[]
          severity: IncidentRecord['severity']
        }
      | null = null

    for (const [label, rule] of Object.entries(heuristics) as [
      IncidentRecord['label'],
      LabelHeuristics[IncidentRecord['label']]
    ][]) {
      const matched = rule.keywords.filter((keyword: string) => normalizedText.includes(keyword))
      const score = matched.length
      if (!best || score > best.score) {
        best = { label, score, matched, severity: rule.defaultSeverity }
      }
    }

    if (!best || best.score === 0) {
      const fallback = heuristics['needs escalation']
      const priority = priorityRules[fallback.defaultSeverity]?.priority ?? 'P1'
      return {
        label: 'needs escalation',
        severity: fallback.defaultSeverity,
        priority,
        matchedKeywords: [],
        confidenceScore: 0.2
      }
    }

    const severity = best.severity
    const priority = priorityRules[severity]?.priority ?? 'P2'
    const heuristicConfidence = Math.min(0.75, 0.3 + best.score * 0.15)

    return {
      label: best.label,
      severity,
      priority,
      matchedKeywords: best.matched,
      confidenceScore: heuristicConfidence
    }
  }
}
