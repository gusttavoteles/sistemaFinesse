import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src',
  envDir: '..',
  base: './',
  plugins: [react()],
  server: { port: 3000, strictPort: true },
  build: { outDir: '../dist', emptyOutDir: true, sourcemap: false },
})
