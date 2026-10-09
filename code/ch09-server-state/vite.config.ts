import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  // 从本章起默认开启 React Compiler（第 6 章约定）
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    port: 5173,
    // 开发代理：浏览器请求 5173/api/*，由 Vite 转发给 3000 端口的后端
    // 浏览器眼里始终是同源请求，不触发 CORS（第 14 章细讲）。preview 默认沿用这份配置
    proxy: { '/api': 'http://localhost:3000' },
  },
})
