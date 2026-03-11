import type { SignatureSummary } from '@wingcraft/types'
import type { NormalizedLogLine } from '@wingcraft/parser-utils'
import { signatureLibrary } from './library.js'

const calculateConfidence = (baseConfidence: number, matchCount: number): number =>
  Math.min(1, baseConfidence + Math.min(0.3, matchCount * 0.1))

export const detectSignature = (
  normalizedLines: NormalizedLogLine[]
): SignatureSummary | undefined => {
  if (!normalizedLines.length) {
    return undefined
  }

  let bestMatch: SignatureSummary | undefined

  for (const pattern of signatureLibrary) {
    const matchedLines = normalizedLines.filter((line) =>
      pattern.matchers.some((matcher) => matcher.test(line.normalized))
    )

    if (!matchedLines.length) {
      continue
    }

    const candidate: SignatureSummary = {
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      label: pattern.label,
      severity: pattern.severity,
      hints: pattern.hints,
      confidenceScore: calculateConfidence(pattern.baseConfidence, matchedLines.length),
      matchedLines: matchedLines.map((line) => line.raw)
    }

    if (!bestMatch || candidate.confidenceScore > bestMatch.confidenceScore) {
      bestMatch = candidate
    }
  }

  return bestMatch
}
