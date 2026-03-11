import { normalizeLogLines } from '@wingcraft/parser-utils'
import type { NormalizedLogLine } from '@wingcraft/parser-utils'

export type NormalizationResult = {
  normalizedLines: NormalizedLogLine[]
  normalizedText: string
}

export type NormalizerFn = (logText: string) => NormalizationResult

export const defaultNormalize: NormalizerFn = (logText) => {
  const normalizedLines = normalizeLogLines(logText)
  const normalizedText = normalizedLines.map((line) => line.normalized).join('\n')
  return { normalizedLines, normalizedText }
}
