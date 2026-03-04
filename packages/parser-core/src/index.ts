import { createClassifier, type ClassifierFn } from '@wingcraft/parser-classifier'
import { createBuilder, type BuilderInstance } from '@wingcraft/parser-builder'
import { labelHeuristics, type LabelHeuristics } from '@wingcraft/parser-heuristics'
import { priorityRules, seededIncidents, type PriorityRuleMap } from '@wingcraft/data'
import type { IncidentRecord, TriageResult } from '@wingcraft/types'

export interface ParserConfig {
  heuristics?: LabelHeuristics
  priorityRules?: PriorityRuleMap
  seededIncidents?: IncidentRecord[]
  classifier?: ClassifierFn
  builder?: BuilderInstance
}

export interface ParserInstance {
  classifyIncident: ClassifierFn
  buildTriageResult(logText: string): TriageResult
  seededIncidentRecords: IncidentRecord[]
}

export function createParserEngine(config: ParserConfig = {}): ParserInstance {
  const heuristics = config.heuristics ?? labelHeuristics
  const rules = config.priorityRules ?? priorityRules
  const incidents = config.seededIncidents ?? seededIncidents

  const classifier =
    config.classifier ??
    createClassifier({
      heuristics,
      priorityRules: rules
    })

  const builder =
    config.builder ??
    createBuilder({
      classifier,
      heuristics,
      seededIncidents: incidents
    })

  return {
    classifyIncident: classifier,
    buildTriageResult: builder.buildTriageResult,
    seededIncidentRecords: incidents
  }
}

export const defaultParser = createParserEngine()
export const classifyIncident = defaultParser.classifyIncident
export const buildTriageResult = defaultParser.buildTriageResult
export const seededIncidentRecords = defaultParser.seededIncidentRecords
