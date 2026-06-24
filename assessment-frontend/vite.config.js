import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Ensure a single React instance (recharts pulls its own otherwise → invalid
  // hook call / "Cannot read properties of null (reading 'useContext')").
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
