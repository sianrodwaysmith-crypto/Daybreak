import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const calDavProxy = {
  target: 'https://caldav.icloud.com',
  changeOrigin: true,
  secure: true,
  rewrite: (path: string) => path.replace(/^\/caldav-proxy/, ''),
}

// Short build stamp injected into the bundle so we can tell which version is
// actually running on a phone PWA without opening DevTools.
const BUILD_STAMP = new Date().toISOString().replace('T', ' ').slice(0, 16)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define:  { __BUILD_STAMP__: JSON.stringify(BUILD_STAMP) },
  server:  { proxy: { '/caldav-proxy': calDavProxy } },
  preview: { proxy: { '/caldav-proxy': calDavProxy } },
})
