import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@wingcraft/parser': path.resolve(__dirname, '..', 'packages', 'parser', 'src'),
      '@wingcraft/types': path.resolve(__dirname, '..', 'packages', 'types', 'src'),
      '@wingcraft/data': path.resolve(__dirname, '..', 'packages', 'data', 'src')
    }
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')]
    }
  }
})
