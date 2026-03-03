// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'


// export default defineConfig({
//   plugins: [react()],
//   base: '/api-monitor/'

// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensures built assets use the correct sub-path
  base: '/dashboard/',
  server: {
    // This is optional for production, but harmless to keep
    allowedHosts: ['developer.agristack.gov.in'],
  },
  build: {
    // Optional but recommended for cleaner builds
    outDir: 'dist',
    sourcemap: false,
  },
})
