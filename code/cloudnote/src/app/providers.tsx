'use client'
// 第 9 章 main.tsx 里那两层 Provider 搬到这里。layout.tsx 是 Server Component，不能直接用 Context，
// 所以把需要浏览器能力的 Provider 包成一个 'use client' 组件，再在 layout 里使用（第 12 章细讲边界）
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { UserProvider } from '@/auth/UserContext'

export function Providers({ children }: { children: ReactNode }) {
  // 每个浏览器标签页一个 QueryClient；用 useState 保证重渲染时不会重新创建
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 0, retry: 1 } } }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  )
}
