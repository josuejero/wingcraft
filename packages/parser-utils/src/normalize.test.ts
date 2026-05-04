import { describe, expect, it } from 'vitest'
import { matchSeededIncident } from './match'
import { normalizeLogLines, normalizeLogText } from './normalize'
import { seededIncidents } from '@wingcraft/data'

describe('normalizeLogLines', () => {
  it('strips timestamps, normalizes whitespace, and preserves raw evidence', () => {
    const lines = normalizeLogLines('[12:04:11 ERROR]:   Failed   to bind to port 25565\r\n')

    expect(lines).toEqual([
      {
        raw: '[12:04:11 ERROR]:   Failed   to bind to port 25565',
        normalized: '[12:04:11 error]: failed to bind to port 25565'
      }
    ])
  })

  it('joins normalized nonblank lines for matching', () => {
    const normalized = normalizeLogText('2026-05-04 12:00:00 Loading plugin WorldGuard\n\n  Conflict detected  ')

    expect(normalized).toContain('loading plugin worldguard')
    expect(normalized).toContain('conflict detected')
  })
})

describe('matchSeededIncident', () => {
  it('matches a seeded incident by normalized evidence and expected label', () => {
    const incident = seededIncidents[0]
    const match = matchSeededIncident({
      logText: incident.evidenceLines.join('\n'),
      label: incident.label,
      seededIncidents
    })

    expect(match?.id).toBe(incident.id)
  })

  it('does not match a seeded incident when the label differs', () => {
    const incident = seededIncidents[0]
    const match = matchSeededIncident({
      logText: incident.evidenceLines.join('\n'),
      label: 'needs escalation',
      seededIncidents
    })

    expect(match).toBeUndefined()
  })
})
