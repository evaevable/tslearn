import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// 两种模式对比渲染行为（积木 6-6）：
//   pnpm dev            普通模式：父组件渲染，子组件全部跟着渲染
//   pnpm dev:compiler   开启 React Compiler：编译期自动加记忆化，没变的子树直接跳过
export default defineConfig(({ mode }) => ({
  plugins: mode === 'compiler' ? [react(), babel({ presets: [reactCompilerPreset()] })] : [react()],
  server: { port: 5173 },
}))
