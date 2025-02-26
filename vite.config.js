// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig( ({ mode }) => {
    return{
	plugins: [react()],
	server: {
	    port: 5173
	}
    }
})

