// 筛选栏：没有任何 state，纯粹「拿到 props -> 返回界面」
import { NOTE_STATUSES, STATUS_TEXT, type StatusFilter } from '../types'

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
    <div className="filters" role="group" aria-label="按状态筛选">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={opt.value === value ? 'chip active' : 'chip'}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
