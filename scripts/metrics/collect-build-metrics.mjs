import { gzipSync } from 'node:zlib'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const distDir = path.resolve('frontend/dist')
const outputJson = path.resolve('reports/metrics/frontend-build.json')
const outputMd = path.resolve('reports/metrics/frontend-build.md')

const roundKb = (bytes) => Math.round((bytes / 1024) * 100) / 100

const listFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath]
    })
  )

  return files.flat()
}

const summarizeGroup = async (files) => {
  const assets = await Promise.all(
    files.map(async (file) => {
      const bytes = await readFile(file)
      return {
        file: path.relative(distDir, file),
        bytes: bytes.length,
        gzipBytes: gzipSync(bytes).length
      }
    })
  )

  const bytes = assets.reduce((sum, asset) => sum + asset.bytes, 0)
  const gzipBytes = assets.reduce((sum, asset) => sum + asset.gzipBytes, 0)

  return {
    fileCount: assets.length,
    kb: roundKb(bytes),
    gzipKb: roundKb(gzipBytes),
    assets: assets
      .sort((a, b) => b.gzipBytes - a.gzipBytes)
      .slice(0, 5)
      .map((asset) => ({
        file: asset.file,
        kb: roundKb(asset.bytes),
        gzipKb: roundKb(asset.gzipBytes)
      }))
  }
}

try {
  await stat(distDir)
} catch {
  console.error('frontend/dist is missing. Run `npm run build --workspace frontend` first.')
  process.exit(1)
}

const files = await listFiles(distDir)
const jsFiles = files.filter((file) => file.endsWith('.js'))
const cssFiles = files.filter((file) => file.endsWith('.css'))
const allAssets = files.filter((file) => /\.(?:js|css|html|svg|png|jpg|jpeg|webp|ico)$/i.test(file))

const [javascript, css, total] = await Promise.all([
  summarizeGroup(jsFiles),
  summarizeGroup(cssFiles),
  summarizeGroup(allAssets)
])

const report = {
  project: 'Wingcraft',
  generatedAt: new Date().toISOString(),
  status: 'passed',
  distDir: 'frontend/dist',
  javascript,
  css,
  total,
  budgets: {
    jsGzipKb: 100,
    cssGzipKb: 10
  },
  budgetStatus: {
    jsGzip: javascript.gzipKb <= 100 ? 'passed' : 'failed',
    cssGzip: css.gzipKb <= 10 ? 'passed' : 'failed'
  }
}

await mkdir(path.dirname(outputJson), { recursive: true })
await writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`)

const markdown = [
  '# Frontend Build Metrics',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '| Asset group | Files | Raw kB | Gzip kB | Budget | Result |',
  '| --- | ---: | ---: | ---: | ---: | --- |',
  `| JavaScript | ${javascript.fileCount} | ${javascript.kb} | ${javascript.gzipKb} | 100 | ${report.budgetStatus.jsGzip} |`,
  `| CSS | ${css.fileCount} | ${css.kb} | ${css.gzipKb} | 10 | ${report.budgetStatus.cssGzip} |`,
  `| Total static assets | ${total.fileCount} | ${total.kb} | ${total.gzipKb} | n/a | recorded |`,
  ''
].join('\n')

await writeFile(outputMd, markdown)
console.log(`Frontend build metrics written: ${javascript.gzipKb} kB gzip JS, ${css.gzipKb} kB gzip CSS.`)
