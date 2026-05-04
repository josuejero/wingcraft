import { runParserValidation, writeParserValidationReports } from '../../packages/parser/dist/validate.js'

const report = runParserValidation()

await writeParserValidationReports(report, {
  jsonPath: 'reports/metrics/parser-validation.json',
  markdownPath: 'reports/metrics/parser-validation.md'
})

if (report.failures.length) {
  console.error('Parser validation failed:')
  report.failures.forEach((failure) => console.error(failure))
  process.exitCode = 1
} else {
  console.log(
    `Parser validation metrics written: ${report.summary.passed}/${report.summary.seededIncidents} passed.`
  )
}
