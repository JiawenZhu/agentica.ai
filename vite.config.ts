import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Enable network access
    open: true, // Automatically open browser
    proxy: {
      '/api/retell': {
        target: 'https://api.retellai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/retell/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Authorization', `Bearer ${env.VITE_RETELL_API_KEY}`);
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/contexts": path.resolve(__dirname, "./contexts"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@/styles": path.resolve(__dirname, "./styles"),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}
})