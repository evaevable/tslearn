import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true, // 第 6 章的 React Compiler：Next.js 里一行开启
  typedRoutes: true, // <Link href> 拼错路由会编译报错（积木 11-6）
  // 第 13 章开启：组件级缓存 + 静态外壳 + 流式动态洞（第 12 章积木 12-8）
  cacheComponents: true,
  partialPrefetching: true,
}

export default nextConfig
