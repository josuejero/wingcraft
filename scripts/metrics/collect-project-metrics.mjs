import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outputJson = path.resolve('reports/metrics/latest.json')
const outputMd = path.resolve('reports/metrics/latest.md')

const readJson = (filePath, fallback = null) => {
  if (!existsSync(filePath)) return fallback
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

const git = (args, fallback) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch {
    return fallback
  }
}

const listDirectoryFiles = async (dir) => {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries.map((entry) => path.join(dir, entry.name))
  } catch {
    return []
  }
}

const countFiles = async (dir, predicate = () => true) => {
  const files = await listDirectoryFiles(dir)
  return files.filter((file) => predicate(path.basename(file))).length
}

const round = (value) => Math.round(value * 10000) / 10000

const trackedFiles = git(['ls-files', '--cached', '--others', '--exclude-standard'], '')
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const sourceDocConfigExtensions = new Set([
  '.css',
  '.env',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sh',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml'
])

const shouldCountFile = (file) => {
  if (file === 'package-lock.json' || file === 'frontend/package-lock.json') return false
  if (file === 'repomix-output.xml' || file.endsWith('.tsbuildinfo')) return false
  if (file.startsWith('reports/') || file.includes('/dist/')) return false
  return sourceDocConfigExtensions.has(path.extname(file))
}

let nonblankLines = 0
let sourceDocConfigFiles = 0

for (const file of trackedFiles.filter(shouldCountFile)) {
  try {
    const text = await readFile(file, 'utf8')
    sourceDocConfigFiles += 1
    nonblankLines += text.split(/\r?\n/).filter((line) => line.trim()).length
  } catch {
    // Binary or unreadable files are intentionally excluded from line counts.
  }
}

const workspacePackages = await countFiles('packages', (name) => existsSync(path.join('packages', name, 'package.json')))
const frontendApps = existsSync('frontend/package.json') ? 1 : 0
const incidents = readJson('packages/data/incidents.json', [])
const parserValidation = readJson('reports/metrics/parser-validation.json')
const frontendBuild = readJson('reports/metrics/frontend-build.json')
const coverage = readJson('coverage/coverage-summary.json')
const playwright = readJson('reports/test-results/playwright.json')
const lighthouseManifest = readJson('reports/lighthouse/manifest.json')
const signatureText = existsSync('packages/parser-signatures/src/library.ts')
  ? readFileSync('packages/parser-signatures/src/library.ts', 'utf8')
  : ''

const countBy = (items, key) =>
  items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] ?? 0) + 1
    return counts
  }, {})

const getCoveragePct = () => {
  const pct = coverage?.total?.lines?.pct
  return typeof pct === 'number' ? pct : null
}

const getPlaywrightStatus = () => {
  if (!playwright) return 'not recorded'
  const unexpected = playwright.stats?.unexpected ?? 0
  return unexpected === 0 ? 'passed' : 'failed'
}

const getLighthouseStatus = () => {
  if (!lighthouseManifest) return 'not recorded'
  const entries = Array.isArray(lighthouseManifest) ? lighthouseManifest : []
  return entries.length ? 'passed' : 'not recorded'
}

const labelCounts = countBy(incidents, 'label')
const priorityCounts = countBy(incidents, 'priority')
const confidence = parserValidation?.summary?.confidence ?? {
  min: null,
  max: null,
  average: null
}

const report = {
  project: 'Wingcraft',
  generatedAt: new Date().toISOString(),
  git: {
    sha: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown')
  },
  scope: {
    workspacePackages,
    frontendApps,
    sourceDocConfigFiles,
    nonblankLines
  },
  parserValidation: parserValidation
    ? {
        seededIncidents: parserValidation.summary.seededIncidents,
        passed: parserValidation.summary.passed,
        failed: parserValidation.summary.failed,
        passRate: parserValidation.summary.passRate,
        labelMatchRate: parserValidation.summary.labelMatchRate,
        priorityMatchRate: parserValidation.summary.priorityMatchRate,
        escalationMatchRate: parserValidation.summary.escalationMatchRate,
        evidenceCaptureRate: parserValidation.summary.evidenceCaptureRate,
        confidence
      }
    : {
        status: 'not recorded'
      },
  incidentDataset: {
    seededIncidents: incidents.length,
    labels: labelCounts,
    priorities: priorityCounts,
    escalationCases: incidents.filter((incident) => incident.escalate).length
  },
  signatureLibrary: {
    patterns: (signatureText.match(/^\s*id:\s*'/gm) ?? []).length,
    regexMatchers: (signatureText.match(/^\s*\/.*\/[, ]*$/gm) ?? []).length
  },
  opsLab: {
    envFiles: await countFiles('ops-lab/env', (name) => name.endsWith('.env')),
    incidentManifests: await countFiles('ops-lab/incidents', (name) => name.endsWith('.yml')),
    resetScripts: await countFiles('ops-lab/scripts', (name) => name.startsWith('reset-') && name.endsWith('.sh')),
    faultInjectionScripts: await countFiles('ops-lab/scripts/fault-injector', (name) => name.endsWith('.sh'))
  },
  frontendBuild: frontendBuild
    ? {
        status: frontendBuild.status,
        jsKb: frontendBuild.javascript.kb,
        jsGzipKb: frontendBuild.javascript.gzipKb,
        cssKb: frontendBuild.css.kb,
        cssGzipKb: frontendBuild.css.gzipKb,
        totalKb: frontendBuild.total.kb,
        totalGzipKb: frontendBuild.total.gzipKb
      }
    : {
        status: 'not recorded'
      },
  qualityGates: {
    lint: 'recorded in CI',
    unitCoverage: getCoveragePct() === null ? 'not recorded' : `${round(getCoveragePct())}% lines`,
    playwright: getPlaywrightStatus(),
    lighthouse: getLighthouseStatus(),
    dependencyAudit: 'high severity gate configured',
    openssfScorecard: 'recorded in GitHub Actions'
  }
}

await mkdir(path.dirname(outputJson), { recursive: true })
await writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`)

const metricsRows = [
  ['Parser seeded incident validation', parserValidation ? `${report.parserValidation.passed}/${report.parserValidation.seededIncidents} passed` : 'not recorded'],
  ['Diagnosis labels covered', Object.keys(labelCounts).length],
  ['Priority tiers covered', Object.keys(priorityCounts).sort().join(', ')],
  ['Escalation cases', report.incidentDataset.escalationCases],
  ['TypeScript workspace packages', workspacePackages],
  ['Source/doc/config files', sourceDocConfigFiles],
  ['Nonblank source/doc/config lines', nonblankLines],
  ['Signature patterns', report.signatureLibrary.patterns],
  ['Regex matchers', report.signatureLibrary.regexMatchers],
  ['Ops-lab incident manifests', report.opsLab.incidentManifests],
  ['Frontend JS gzip', frontendBuild ? `${report.frontendBuild.jsGzipKb} kB` : 'not recorded'],
  ['Frontend CSS gzip', frontendBuild ? `${report.frontendBuild.cssGzipKb} kB` : 'not recorded']
]

const markdown = [
  '# Wingcraft Metrics',
  '',
  `Generated: ${report.generatedAt}`,
  `Git: ${report.git.branch} @ ${report.git.sha}`,
  '',
  '> Seeded parser validation is a regression metric for the fixtures in this repo, not an independent accuracy claim.',
  '',
  '| Metric | Current result |',
  '| --- | ---: |',
  ...metricsRows.map(([metric, value]) => `| ${metric} | ${value} |`),
  '',
  '## Quality Gates',
  '',
  '| Gate | Status |',
  '| --- | --- |',
  ...Object.entries(report.qualityGates).map(([gate, status]) => `| ${gate} | ${status} |`),
  ''
].join('\n')

await writeFile(outputMd, markdown)
console.log(`Project metrics written: ${path.relative(process.cwd(), outputJson)}`)
