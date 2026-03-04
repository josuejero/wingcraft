import type { IncidentRecord } from './types.js'

export type LabelHeuristic = {
  keywords: string[]
  defaultCategory: string
  safeFirstStep: string
  likelyCause: string
  customerMessage: string
  evidenceToCollect: string[]
  escalate: boolean
  affectedComponent: string
  resolutionNotes: string
  defaultSeverity: IncidentRecord['severity']
}

export type LabelHeuristics = Record<IncidentRecord['label'], LabelHeuristic>

export const labelHeuristics: LabelHeuristics = {
  'startup error': {
    keywords: [
      'unable to start',
      'missing jar',
      'unable to access jarfile',
      'failed to start server',
      'starting papermc',
      'defaulting to offline mode',
      'startup aborted',
      'could not find main class'
    ],
    defaultCategory: 'startup',
    safeFirstStep: 'Stop the service, archive logs, and confirm the jar and JVM permissions before retrying.',
    likelyCause: 'Missing or corrupt startup artifact or JVM dependency.',
    customerMessage: 'Startup failed because the runtime can\'t reach the server binary; I\'m verifying the jar and JVM.',
    evidenceToCollect: ['Startup log tail', 'Jar checksum', 'java -version'],
    escalate: true,
    affectedComponent: 'PaperMC JVM',
    resolutionNotes: 'Validated jar integrity and restarted with the clipped startup script.',
    defaultSeverity: 'CRITICAL'
  },
  'plugin/config conflict': {
    keywords: [
      'classnotfoundexception',
      'illegalargumentexception',
      'conflict',
      'failed to load plugin',
      'out of bounds',
      'plugin conflict',
      'plugin loader',
      'worldguard',
      'dynmap',
      'authme'
    ],
    defaultCategory: 'plugin',
    safeFirstStep: 'Stop the server, snapshot plugin/config, and disable the recently touched plugin or setting.',
    likelyCause: 'Plugin is incompatible with current Paper version or config overrides are invalid.',
    customerMessage: 'A plugin is trying to load incompatible settings; I\'m stopping the server and rolling back the change.',
    evidenceToCollect: ['Plugin config', 'paper.yml chunk settings', 'plugin loader stack trace'],
    escalate: false,
    affectedComponent: 'Plugin loader',
    resolutionNotes: 'Restored working plugin build and verified configuration.',
    defaultSeverity: 'HIGH'
  },
  'version mismatch': {
    keywords: [
      'version 1.16',
      'protocol',
      'schema',
      'refresh handshake',
      'protocol version',
      'jdbc',
      'driver version',
      'sqlstate 08s01',
      'communication link failure'
    ],
    defaultCategory: 'configuration',
    safeFirstStep: 'Stop related services, compare declared versions, and back up the configs.',
    likelyCause: 'Client/proxy is speaking a different protocol or schema version than the server.',
    customerMessage: 'The service versions are misaligned; I\'m halting traffic while I reconcile the versions.',
    evidenceToCollect: ['server.properties version', 'proxy handshake logs', 'deployment manifest'],
    escalate: true,
    affectedComponent: 'Configuration bridge',
    resolutionNotes: 'Aligned the proxy and server builds, then restarted the routing layer.',
    defaultSeverity: 'MEDIUM'
  },
  'likely infrastructure issue': {
    keywords: ['oom killer', 'failed to bind', 'connection refused', 'iostat', 'out of memory'],
    defaultCategory: 'infrastructure',
    safeFirstStep: 'Quiesce traffic, capture host metrics (network, sockets, disk), and take a snapshot before changing anything.',
    likelyCause: 'Excepted resource exhaustion or host-level conflict; not the application itself.',
    customerMessage: 'The host infrastructure is having trouble (network/disk/memory) so I\'m collecting evidence before rehoming workloads.',
    evidenceToCollect: ['ss -tulpn', 'top -b -n1', 'smartctl/dmesg'],
    escalate: true,
    affectedComponent: 'Host infrastructure',
    resolutionNotes: 'Partnered with infra to clear the resource pressure and resumed operations.',
    defaultSeverity: 'HIGH'
  },
  'needs escalation': {
    keywords: ['service unavailable', 'escalate', 'facility', 'power', 'provider'],
    defaultCategory: 'operations',
    safeFirstStep: 'Stop services, gather facility/provider logs, and notify the appropriate escalation path.',
    likelyCause: 'External provider or facility outage requiring a higher-level team.',
    customerMessage: 'This is beyond the application layer, so I\'m escalating to the platform/facilities team with the collected evidence.',
    evidenceToCollect: ['Provider status page', 'UPS/PDU logs', 'external API health'],
    escalate: true,
    affectedComponent: 'External ops partner',
    resolutionNotes: 'Escalated per runbook and reconciled status once partner confirmed resolution.',
    defaultSeverity: 'HIGH'
  }
}
