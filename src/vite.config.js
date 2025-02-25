// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) {
    plugins: [react()],
    server: {
    port: 5173
    },
    // Base configuration
    base: mode === 'production' ? '/var/www/pubnostr/' : '/',
    // Other config options
})
