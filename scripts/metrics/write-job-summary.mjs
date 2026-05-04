import { appendFile, readFile } from 'node:fs/promises'

const metrics = JSON.parse(await readFile('reports/metrics/latest.json', 'utf8'))

const line = (label, value) => `- ${label}: ${value}`

const summary = [
  '### Wingcraft quality summary',
  '',
  line(
    'Parser validation',
    metrics.parserValidation.seededIncidents
      ? `${metrics.parserValidation.passed}/${metrics.parserValidation.seededIncidents} passed`
      : 'not recorded'
  ),
  line('Unit coverage', metrics.qualityGates.unitCoverage),
  line('Playwright', metrics.qualityGates.playwright),
  line('Lighthouse', metrics.qualityGates.lighthouse),
  line('Frontend JS gzip', metrics.frontendBuild.jsGzipKb ? `${metrics.frontendBuild.jsGzipKb} kB` : 'not recorded'),
  line('Dependency audit', metrics.qualityGates.dependencyAudit),
  ''
].join('\n')

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
} else {
  console.log(summary)
}
