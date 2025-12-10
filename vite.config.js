import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/face-ui-static/',   // repo name on GitHub
  build: {
    outDir: 'docs',           // GitHub Pages will serve from /docs
  },
})
