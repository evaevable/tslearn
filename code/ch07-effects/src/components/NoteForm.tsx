// 新增表单：自己管理输入框里的草稿（局部 state），提交时通过 onAdd 通知父组件
import { useState, type FormEvent } from 'react'

type NoteFormProps = {
  onAdd: (title: string) => void
}

export function NoteForm({ onAdd }: NoteFormProps) {
  const [title, setTitle] = useState('')
  const trimmed = title.trim()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // 阻止浏览器默认的整页提交
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('') // 清空输入框：改 state，React 会把 input 的值同步成 ''
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {/* 受控输入框：显示什么由 state 决定，用户每敲一个字都回写 state（第 8 章细讲） */}
      <input
        aria-label="笔记标题"
        placeholder="写一条笔记标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" disabled={!trimmed}>
        添加
      </button>
    </form>
  )
}
