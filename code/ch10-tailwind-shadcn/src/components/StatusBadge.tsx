// 业务组件包一层 shadcn 的 Badge：状态 -> 颜色的映射只在这里写一次
// 用 cva 声明变体，和 shadcn 自己的 buttonVariants 是同一种写法（积木 10-5）
import { cva } from 'class-variance-authority'
import { Badge } from '@/components/ui/badge'
import { STATUS_TEXT, type NoteStatus } from '@/types'

const statusBadge = cva('', {
  variants: {
    status: {
      draft: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
      published: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
      archived: 'bg-muted text-muted-foreground',
    },
  },
})

export function StatusBadge({ status }: { status: NoteStatus }) {
  return (
    <Badge variant="secondary" className={statusBadge({ status })} data-testid="badge">
      {STATUS_TEXT[status]}
    </Badge>
  )
}
