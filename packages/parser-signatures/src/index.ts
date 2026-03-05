import type { Label, Severity, SignatureSummary } from '@wingcraft/types'
import type { NormalizedLogLine } from '@wingcraft/parser-utils'

type SignaturePattern = {
  id: string
  name: string
  description: string
  label: Label
  severity: Severity
  hints: string[]
  matchers: RegExp[]
  baseConfidence: number
}

const signatureLibrary: SignaturePattern[] = [
  {
    id: 'port-bind-failure',
    name: 'Port bind failure',
    description: 'Port binding failed because another process owns the requested endpoint.',
    label: 'likely infrastructure issue',
    severity: 'CRITICAL',
    hints: [
      'Check `ss -tulpn`, firewall rules, and Docker port allocations before restarting.'
    ],
    matchers: [
      /failed to bind to port/,
      /failed to bind/,
      /address already in use/,
      /port .* already in use/,
      /port .* is occupied/,
      /failed to bind to 0\.0\.0\.0/
    ],
    baseConfidence: 0.7
  },
  {
    id: 'server-ip-binding',
    name: 'Server IP binding failure',
    description: 'Paper cannot bind the requested `server-ip` inside the container.',
    label: 'startup error',
    severity: 'HIGH',
    hints: ['Clear `server-ip` or use `0.0.0.0` before restarting.'],
    matchers: [
      /cannot assign requested address/,
      /server-ip/,
      /defaulting to offline mode/,
      /bindexception: cannot assign requested address/
    ],
    baseConfidence: 0.6
  },
  {
    id: 'plugin-stack-trace',
    name: 'Plugin stack trace',
    description: 'Stack trace or loader log lines reference a plugin name or class paths.',
    label: 'plugin/config conflict',
    severity: 'HIGH',
    hints: ['Identify the named plugin and refer to compatibility notes before restarting.'],
    matchers: [
      /loading plugin /,
      /in plugin /,
      /plugin .* throws /,
      /failed to load plugin /,
      /java\.lang\.(?:IllegalArgumentException|NoClassDefFoundError|NoSuchMethodError|Exception)/
    ],
    baseConfidence: 0.5
  },
  {
    id: 'java-runtime-mismatch',
    name: 'Java runtime mismatch',
    description: 'The runtime is too old or too new for the Paper build.',
    label: 'startup error',
    severity: 'HIGH',
    hints: ['Verify that Java 17 (or the version required by the jar) is installed and referenced.'],
    matchers: [
      /unsupportedclassversionerror/, 
      /unsupported major\.minor version/, 
      /java runtime \(class file version/, 
      /has been compiled by a more recent version of the java runtime/, 
      /requires java 17/
    ],
    baseConfidence: 0.65
  },
  {
    id: 'world-version-mismatch',
    name: 'World version mismatch',
    description: 'The world files require a newer Minecraft release than the server supports.',
    label: 'version mismatch',
    severity: 'HIGH',
    hints: ['Align the world files and Paper build before loading to avoid corruption.'],
    matchers: [
      /this world was saved with minecraft/,
      /this server supports up to/,
      /saved with version/,
      /supports up to 1\.\d+(?:\.\d+)?/
    ],
    baseConfidence: 0.6
  },
  {
    id: 'memory-container-pressure',
    name: 'Memory/container limit pressure',
    description: 'Java heap or container limits have been reached, leading to an OOM.',
    label: 'likely infrastructure issue',
    severity: 'HIGH',
    hints: ['Collect container stats and adjust MAX_MEMORY vs host limits before restarting.'],
    matchers: [
      /java\.lang\.outofmemoryerror/, 
      /container .* memory limit reached/, 
      /heap space/, 
      /gc overhead limit exceeded/, 
      /-xmx/, 
      /max_memory/,
      /memory limit reached \(.* enforce/,
      /pterodactyl enforces headroom/
    ],
    baseConfidence: 0.6
  }
]

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

export const signatureLibraryNames = signatureLibrary.map((entry) => entry.name)
