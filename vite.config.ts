import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * KaTeX's stylesheet lists woff2, woff and ttf sources for each of its 20 fonts. Every browser
 * we target supports woff2, so drop the fallbacks: 40 fewer files and ~1 MB less output.
 */
function katexWoff2Only(): Plugin {
  return {
    name: 'katex-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!/[\\/]katex[\\/]dist[\\/]katex(\.min)?\.css/.test(id)) return null
      return code.replace(/,\s*url\([^)]+\.(?:woff|ttf)\)\s*format\("(?:woff|truetype)"\)/g, '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative base: the build works under any sub-path (GitHub Pages, preview hosts).
  base: './',
  plugins: [katexWoff2Only(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2023',
    chunkSizeWarningLimit: 900,
  },
})
