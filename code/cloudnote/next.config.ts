import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true, // 第 6 章的 React Compiler：Next.js 里一行开启
  typedRoutes: true, // <Link href> 拼错路由会编译报错（积木 11-6）
}

export default nextConfig
