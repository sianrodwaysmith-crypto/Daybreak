import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const calDavProxy = {
  target: 'https://caldav.icloud.com',
  changeOrigin: true,
  secure: true,
  rewrite: (path: string) => path.replace(/^\/caldav-proxy/, ''),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:  { proxy: { '/caldav-proxy': calDavProxy } },
  preview: { proxy: { '/caldav-proxy': calDavProxy } },
})
