import { detectSignature } from '@wingcraft/parser-signatures'
import type { NormalizedLogLine } from '@wingcraft/parser-utils'
import type { SignatureSummary } from '@wingcraft/types'

export type SignatureDetectorFn = (
  normalizedLines: NormalizedLogLine[]
) => SignatureSummary | undefined

export const defaultDetectSignature: SignatureDetectorFn = (normalizedLines) =>
  detectSignature(normalizedLines)
