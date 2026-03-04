import type { ClassificationSummary, IncidentRecord } from '@wingcraft/types'
import type { LabelHeuristics } from '@wingcraft/parser-heuristics'
import type { PriorityRuleMap } from '@wingcraft/data'

export type ClassifierFn = (logText: string) => ClassificationSummary

export interface ClassifierConfig {
  heuristics: LabelHeuristics
  priorityRules: PriorityRuleMap
}

const normalize = (text: string): string => text.toLowerCase()

export function createClassifier(config: ClassifierConfig): ClassifierFn {
  const { heuristics, priorityRules } = config

  return function classifyIncident(logText: string): ClassificationSummary {
    const normalized = normalize(logText)
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
      const matched = rule.keywords.filter((keyword: string) => normalized.includes(keyword))
      const score = matched.length
      if (!best || score > best.score) {
        best = { label, score, matched, severity: rule.defaultSeverity }
      }
    }

    if (!best || best.score === 0) {
      const fallback = heuristics['needs escalation']
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
}
