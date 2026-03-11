export type NormalizedLogLine = {
  raw: string
  normalized: string
}

const stripTimestamp = (line: string): string => {
  let result = line.replace(/\r/g, '')
  const timestampPatterns = [
    /^\[\d{1,2}:\d{2}:\d{2}(?:\.\d+)?\]\s*/,
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s*/,
    /^\d{1,2}:\d{2}:\d{2}\s*/
  ]
  for (const pattern of timestampPatterns) {
    result = result.replace(pattern, '')
  }
  return result
}

const normalizeWhitespace = (line: string): string => line.replace(/\s+/g, ' ').trim()

export const normalizeLogLines = (text: string): NormalizedLogLine[] => {
  const normalizedText = text.replace(/\r\n/g, '\n')
  return normalizedText
    .split('\n')
    .map((rawLine) => rawLine.trim())
    .filter((line) => line.length > 0)
    .map((rawLine) => {
      const cleaned = normalizeWhitespace(stripTimestamp(rawLine))
      return {
        raw: rawLine,
        normalized: cleaned.toLowerCase()
      }
    })
}

export const normalizeLogText = (text: string): string =>
  normalizeLogLines(text)
    .map((line) => line.normalized)
    .join('\n')
