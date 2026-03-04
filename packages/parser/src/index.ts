export * from '@wingcraft/types'
export * from '@wingcraft/data'
export { priorityRules as priorityMapping } from '@wingcraft/data'
export * from '@wingcraft/parser-heuristics'
export * from '@wingcraft/parser-classifier'
export * from '@wingcraft/parser-builder'

import { labelHeuristics } from '@wingcraft/parser-heuristics'
import { createClassifier } from '@wingcraft/parser-classifier'
import { createBuilder } from '@wingcraft/parser-builder'
import { priorityRules, seededIncidents } from '@wingcraft/data'

export const classifyIncident = createClassifier({
  heuristics: labelHeuristics,
  priorityRules
})

const builder = createBuilder({
  heuristics: labelHeuristics,
  seededIncidents,
  classifier: classifyIncident
})

export const buildTriageResult = builder.buildTriageResult
export const seededIncidentRecords = seededIncidents
