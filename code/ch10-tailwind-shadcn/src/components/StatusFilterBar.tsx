// 筛选栏：逻辑和第 5 章完全一样，只是按钮换成 shadcn Button，用 variant 区分选中态
import { Button } from '@/components/ui/button'
import { NOTE_STATUSES, STATUS_TEXT, type StatusFilter } from '@/types'

type StatusFilterBarProps = {
  value: StatusFilter
  onChange: (next: StatusFilter) => void
}

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  ...NOTE_STATUSES.map((s) => ({ value: s, label: STATUS_TEXT[s] })),
]

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="按状态筛选" data-testid="filters">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          size="sm"
          variant={opt.value === value ? 'default' : 'ghost'}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
