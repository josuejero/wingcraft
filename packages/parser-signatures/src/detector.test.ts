import { describe, expect, it } from 'vitest'
import { normalizeLogLines } from '@wingcraft/parser-utils'
import { detectSignature } from './detector'
import { signatureLibrary, signatureLibraryNames } from './library'

describe('detectSignature', () => {
  it('detects a port bind failure and preserves matched evidence', () => {
    const signature = detectSignature(
      normalizeLogLines('[12:00:00 ERROR]: Failed to bind to 0.0.0.0:25565: Address already in use')
    )

    expect(signature?.id).toBe('port-bind-failure')
    expect(signature?.label).toBe('likely infrastructure issue')
    expect(signature?.matchedLines[0]).toContain('Failed to bind')
    expect(signature?.confidenceScore).toBeCloseTo(0.8)
  })

  it('prefers the strongest signature when several matchers fire', () => {
    const signature = detectSignature(
      normalizeLogLines([
        'java.lang.OutOfMemoryError: Java heap space',
        'container cgroup memory limit reached',
        'Pterodactyl enforces headroom'
      ].join('\n'))
    )

    expect(signature?.id).toBe('memory-container-pressure')
    expect(signature?.confidenceScore).toBeCloseTo(0.9)
  })

  it('returns undefined when no signature matches', () => {
    expect(detectSignature(normalizeLogLines('routine player chat line'))).toBeUndefined()
  })

  it('exports the expected signature catalog shape', () => {
    expect(signatureLibrary).toHaveLength(6)
    expect(signatureLibraryNames).toContain('Java runtime mismatch')
  })
})
