import { defineConfig } from 'vitest/config'
import path from 'node:path'

const alias = (packageName: string) =>
  path.resolve(__dirname, 'packages', packageName, 'src')

export default defineConfig({
  resolve: {
    alias: {
      '@wingcraft/data': alias('data'),
      '@wingcraft/parser': alias('parser'),
      '@wingcraft/parser-builder': alias('parser-builder'),
      '@wingcraft/parser-classifier': alias('parser-classifier'),
      '@wingcraft/parser-core': alias('parser-core'),
      '@wingcraft/parser-heuristics': alias('parser-heuristics'),
      '@wingcraft/parser-signatures': alias('parser-signatures'),
      '@wingcraft/parser-utils': alias('parser-utils'),
      '@wingcraft/types': alias('types')
    }
  },
  test: {
    include: ['packages/**/*.test.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json-summary', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/parser/src/validate.ts', 'packages/**/src/**/*.test.ts'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  }
})
