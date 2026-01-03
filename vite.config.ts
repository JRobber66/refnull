import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Tester/', // ✅ must match GitHub Pages branch/repo path
})
