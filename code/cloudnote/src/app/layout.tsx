// 根布局：所有页面共用的外壳（<html>、<body>、顶栏）。切换页面时它不会重新挂载
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { MainNav, MainNavFallback } from '@/components/MainNav'
import { UserBadge } from '@/components/UserBadge'
import { Providers } from './providers'
import './globals.css'

// metadata：生成 <title> 和 <meta name="description">，替代第 7 章的 document.title
export const metadata: Metadata = {
  title: { default: 'CloudNote', template: '%s · CloudNote' },
  description: 'TypeScript 全栈课程的贯穿案例',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <div className="min-h-svh bg-muted/40">
            <header className="border-b bg-background">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
                {/* usePathname 属于「URL 数据」：在 Cache Components 下必须包在 <Suspense> 里 */}
                <Suspense fallback={<MainNavFallback />}>
                  <MainNav />
                </Suspense>
                <UserBadge />
              </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
