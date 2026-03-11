import { createClassifier, type ClassifierFn } from '@wingcraft/parser-classifier'
import { createBuilder, type BuilderFn } from '@wingcraft/parser-builder'
import { labelHeuristics, type LabelHeuristics } from '@wingcraft/parser-heuristics'
import { priorityRules, seededIncidents, type PriorityRuleMap } from '@wingcraft/data'
import type {
  ClassificationSummary,
  IncidentRecord,
  TriageResult
} from '@wingcraft/types'

import {
  defaultDetectSignature,
  defaultNormalize
} from './stages/index.js'
import type { SignatureDetectorFn, NormalizerFn } from './stages/index.js'
import { runParserPipeline } from './pipeline.js'
import type { ParserPipelineOutput, ParserPipelineStages } from './pipeline.js'

export interface ParserConfig {
  heuristics?: LabelHeuristics
  priorityRules?: PriorityRuleMap
  seededIncidents?: IncidentRecord[]
  normalize?: NormalizerFn
  detectSignature?: SignatureDetectorFn
  classify?: ClassifierFn
  build?: BuilderFn
}

export interface ParserInstance {
  classifyIncident(logText: string): ClassificationSummary
  buildTriageResult(logText: string): TriageResult
  seededIncidentRecords: IncidentRecord[]
  stages: ParserPipelineStages
  runPipeline(logText: string): ParserPipelineOutput
}

function buildPipelineStages(
  config: ParserConfig,
  heuristics: LabelHeuristics,
  priorityRules: PriorityRuleMap,
  incidents: IncidentRecord[]
): ParserPipelineStages {
  const classifierStage =
    config.classify ??
    createClassifier({
      heuristics,
      priorityRules
    })

  const builderStage =
    config.build ??
    createBuilder({
      heuristics,
      seededIncidents: incidents
    }).buildTriageResult

  return {
    normalize: config.normalize ?? defaultNormalize,
    detectSignature: config.detectSignature ?? defaultDetectSignature,
    classify: classifierStage,
    build: builderStage
  }
}

export function createParserEngine(config: ParserConfig = {}): ParserInstance {
  const heuristics = config.heuristics ?? labelHeuristics
  const rules = config.priorityRules ?? priorityRules
  const incidents = config.seededIncidents ?? seededIncidents

  const stages = buildPipelineStages(config, heuristics, rules, incidents)

  return {
    classifyIncident(logText: string) {
      return runParserPipeline(stages, logText).classification
    },
    buildTriageResult(logText: string) {
      return runParserPipeline(stages, logText).triage
    },
    seededIncidentRecords: incidents,
    stages,
    runPipeline(logText: string) {
      return runParserPipeline(stages, logText)
    }
  }
}

export const defaultParser = createParserEngine()
export const classifyIncident = defaultParser.classifyIncident
export const buildTriageResult = defaultParser.buildTriageResult
export const seededIncidentRecords = defaultParser.seededIncidentRecords

export * from './stages/index.js'
export * from './pipeline.js'
