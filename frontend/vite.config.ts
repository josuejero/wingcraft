import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@wingcraft/parser': path.resolve(__dirname, '..', 'packages', 'parser', 'src'),
      '@wingcraft/types': path.resolve(__dirname, '..', 'packages', 'types', 'src'),
      '@wingcraft/data': path.resolve(__dirname, '..', 'packages', 'data', 'src'),
      '@wingcraft/parser-heuristics': path.resolve(__dirname, '..', 'packages', 'parser-heuristics', 'src'),
      '@wingcraft/parser-classifier': path.resolve(__dirname, '..', 'packages', 'parser-classifier', 'src'),
      '@wingcraft/parser-builder': path.resolve(__dirname, '..', 'packages', 'parser-builder', 'src'),
      '@wingcraft/parser-core': path.resolve(__dirname, '..', 'packages', 'parser-core', 'src'),
      '@wingcraft/parser-utils': path.resolve(__dirname, '..', 'packages', 'parser-utils', 'src'),
      '@wingcraft/parser-signatures': path.resolve(__dirname, '..', 'packages', 'parser-signatures', 'src')
    }
  }
})