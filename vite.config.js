// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig( ({ mode }) => {
    return{
	base: mode === 'production' ? '/var/www/pubnostr.com/' : '/',
	plugins: [react()],
	server: {
	    port: 5173
	}
    }
})

