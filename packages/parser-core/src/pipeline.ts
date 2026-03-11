import type { BuilderFn } from '@wingcraft/parser-builder'
import type { ClassifierFn } from '@wingcraft/parser-classifier'
import type {
  ClassificationSummary,
  SignatureSummary,
  TriageResult
} from '@wingcraft/types'
import type {
  NormalizerFn,
  NormalizationResult,
  SignatureDetectorFn
} from './stages/index.js'

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

export function runParserPipeline(
  stages: ParserPipelineStages,
  logText: string
): ParserPipelineOutput {
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
