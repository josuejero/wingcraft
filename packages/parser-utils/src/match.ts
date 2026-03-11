import type { IncidentRecord } from '@wingcraft/types'
import { normalizeLogText } from './normalize.js'

export interface SeededMatchArgs {
  logText: string
  label: IncidentRecord['label']
  seededIncidents: IncidentRecord[]
  normalizedLogText?: string
}

export const matchSeededIncident = ({
  logText,
  label,
  seededIncidents,
  normalizedLogText
}: SeededMatchArgs): IncidentRecord | undefined => {
  const normalizedLog = normalizedLogText ?? normalizeLogText(logText)

  return seededIncidents.find(
    (candidate: IncidentRecord) =>
      candidate.label === label &&
      candidate.evidenceLines.some((line: string) => normalizedLog.includes(line.toLowerCase()))
  )
}
