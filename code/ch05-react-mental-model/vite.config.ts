import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite：开发时提供秒级热更新的 dev server，构建时把 TS/JSX 打包成浏览器能直接加载的 JS
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})
