// 渲染实验室：同一份数据，五种渲染方式。每个页面顶部显示「这段 HTML 是什么时候、在哪里生成的」
import Link from 'next/link'
import type { ReactNode } from 'react'

const LABS = [
  { href: '/lab/ssg', label: 'SSG 静态' },
  { href: '/lab/ssg/2', label: 'SSG 动态段' },
  { href: '/lab/ssr', label: 'SSR 动态' },
  { href: '/lab/csr', label: 'CSR 客户端' },
  { href: '/lab/streaming', label: '流式 Suspense' },
  { href: '/lab/hydration', label: 'Hydration' },
] as const

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4">
      <nav className="flex flex-wrap gap-2 text-sm" aria-label="渲染实验室">
        {LABS.map((lab) => (
          <Link key={lab.href} href={lab.href} className="rounded-md border bg-background px-2.5 py-1 hover:bg-muted">
            {lab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
