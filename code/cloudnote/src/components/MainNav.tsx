'use client'
// 顶部导航：Link 做客户端跳转（不整页刷新），usePathname 高亮当前所在的区域
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'cn'

const LINKS = [
  { href: '/', label: '首页' },
  { href: '/notes', label: '笔记' },
  { href: '/lab/ssg', label: '渲染实验室' },
] as const

// 静态部分：不读 pathname，用作 <Suspense> 的 fallback（读 URL 的组件必须能有一个不读 URL 的替身）
export function MainNavFallback() {
  return (
    <nav className="flex items-center gap-4" aria-label="主导航">
      <span className="text-lg font-semibold tracking-tight">CloudNote</span>
    </nav>
  )
}

export function MainNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-4" aria-label="主导航">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        CloudNote
      </Link>
      {LINKS.map((link) => {
        const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.split('/').slice(0, 2).join('/'))
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn('text-sm text-muted-foreground hover:text-foreground', active && 'font-medium text-foreground')}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
