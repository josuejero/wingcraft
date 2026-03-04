import { buildTriageResult, seededIncidentRecords } from './index.js';

const failures: string[] = [];

for (const incident of seededIncidentRecords) {
  const logText = incident.evidenceLines.join(' ');
  const result = buildTriageResult(logText);

  if (result.label !== incident.label) {
    failures.push(`${incident.id}: expected label ${incident.label} but got ${result.label}`);
  }
  if (result.priority !== incident.priority) {
    failures.push(`${incident.id}: expected priority ${incident.priority} but got ${result.priority}`);
  }
  if (result.escalate !== incident.escalate) {
    failures.push(`${incident.id}: expected escalate ${incident.escalate} but got ${result.escalate}`);
  }
}

if (failures.length) {
  console.error('Parser validation failed:');
  failures.forEach((msg) => console.error(msg));
  process.exit(1);
}

console.log(`Parser validation succeeded for ${seededIncidentRecords.length} seeded incidents.`);
