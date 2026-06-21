import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router')
          ) {
            return 'vendor-react'
          }
          if (id.includes('@tanstack/react-query')) return 'vendor-query'
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers')
          ) {
            return 'vendor-forms'
          }
          if (id.includes('/zod/')) return 'vendor-validation'
          if (id.includes('/zustand/')) return 'vendor-state'
          if (id.includes('/lucide-react/')) return 'vendor-icons'
          return 'vendor'
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
})
