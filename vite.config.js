import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // User web app runs on 5174 (the admin panel uses 5173). The API allows both in CORS.
  server: { port: 5174, strictPort: true },
  preview: { port: 5174 },
})
