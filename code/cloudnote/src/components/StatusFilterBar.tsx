// 筛选栏：不再调用 onChange 改 state，而是渲染成普通链接 /notes?status=draft
// 好处：刷新不丢、能复制分享、浏览器后退键可用。没有任何 hook，所以不需要 'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NOTE_STATUSES, STATUS_TEXT, type StatusFilter } from '@/types'

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  ...NOTE_STATUSES.map((s) => ({ value: s, label: STATUS_TEXT[s] })),
]

export function StatusFilterBar({ value }: { value: StatusFilter }) {
  return (
    <div className="flex gap-1" role="group" aria-label="按状态筛选" data-testid="filters">
      {OPTIONS.map((opt) => (
        // asChild：Button 不渲染自己的 <button>，而是把样式交给子元素 <a>（Radix Slot）
        <Button key={opt.value} asChild size="sm" variant={opt.value === value ? 'default' : 'ghost'}>
          <Link
            href={opt.value === 'all' ? '/notes' : { pathname: '/notes', query: { status: opt.value } }}
            aria-current={opt.value === value ? 'page' : undefined}
            scroll={false}
          >
            {opt.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
