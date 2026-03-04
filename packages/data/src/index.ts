import incidentSchemaJson from '../incident-schema.json' with { type: 'json' }
import seededIncidentsJson from '../incidents.json' with { type: 'json' }
import priorityRulesJson from '../priority-rules.json' with { type: 'json' }

import type { IncidentRecord } from '@wingcraft/types'

export type PriorityRuleEntry = {
  priority: IncidentRecord['priority']
  response: string
}

export type PriorityRuleMap = Record<IncidentRecord['severity'], PriorityRuleEntry>

export const incidentSchema = incidentSchemaJson as Record<string, unknown>
export const seededIncidents = seededIncidentsJson as IncidentRecord[]
export const priorityRules = priorityRulesJson as PriorityRuleMap
