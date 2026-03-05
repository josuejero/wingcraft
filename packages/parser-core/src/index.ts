import { createClassifier, type ClassifierFn } from '@wingcraft/parser-classifier'
import { createBuilder, type BuilderFn } from '@wingcraft/parser-builder'
import { labelHeuristics, type LabelHeuristics } from '@wingcraft/parser-heuristics'
import {
  normalizeLogLines,
  type NormalizedLogLine
} from '@wingcraft/parser-utils'
import { detectSignature } from '@wingcraft/parser-signatures'
import { priorityRules, seededIncidents, type PriorityRuleMap } from '@wingcraft/data'
import type {
  ClassificationSummary,
  IncidentRecord,
  SignatureSummary,
  TriageResult
} from '@wingcraft/types'

export type NormalizationResult = {
  normalizedLines: NormalizedLogLine[]
  normalizedText: string
}

export type NormalizerFn = (logText: string) => NormalizationResult

export type SignatureDetectorFn = (
  normalizedLines: NormalizedLogLine[]
) => SignatureSummary | undefined

export interface ParserPipelineStages {
  normalize: NormalizerFn
  detectSignature: SignatureDetectorFn
  classify: ClassifierFn
  build: BuilderFn
}

export interface ParserPipelineOutput {
  normalization: NormalizationResult
  signature?: SignatureSummary
  classification: ClassificationSummary
  triage: TriageResult
}

export function runParserPipeline(stages: ParserPipelineStages, logText: string): ParserPipelineOutput {
  const normalization = stages.normalize(logText)
  const signature = stages.detectSignature(normalization.normalizedLines)
  const classification = stages.classify({
    logText,
    normalizedText: normalization.normalizedText,
    normalizedLines: normalization.normalizedLines,
    signature
  })
  const triage = stages.build({
    logText,
    classification,
    normalizedLogText: normalization.normalizedText
  })

  return {
    normalization,
    signature,
    classification,
    triage
  }
}

const defaultNormalize: NormalizerFn = (logText) => {
  const normalizedLines = normalizeLogLines(logText)
  const normalizedText = normalizedLines.map((line) => line.normalized).join('\n')
  return { normalizedLines, normalizedText }
}

const defaultDetectSignature: SignatureDetectorFn = (normalizedLines) =>
  detectSignature(normalizedLines)

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

export function createParserEngine(config: ParserConfig = {}): ParserInstance {
  const heuristics = config.heuristics ?? labelHeuristics
  const rules = config.priorityRules ?? priorityRules
  const incidents = config.seededIncidents ?? seededIncidents

  const classifierStage =
    config.classify ??
    createClassifier({
      heuristics,
      priorityRules: rules
    })

  const builderStage =
    config.build ??
    createBuilder({
      heuristics,
      seededIncidents: incidents
    }).buildTriageResult

  const stages: ParserPipelineStages = {
    normalize: config.normalize ?? defaultNormalize,
    detectSignature: config.detectSignature ?? defaultDetectSignature,
    classify: classifierStage,
    build: builderStage
  }

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
