'use client'
// 用 Server Action 重写的表单：和第 8 章那份相比，少掉了 fetch、少掉了手写 loading 与错误状态
import { useActionState, useEffect, useRef } from 'react'
import { createNoteAction, type FormState } from '@/app/notes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const INITIAL: FormState = { ok: false }

export function NoteFormAction() {
  // useActionState：把 action 的返回值、pending 状态交给我们；表单提交时浏览器会自动带上 FormData
  const [state, formAction, pending] = useActionState(createNoteAction, INITIAL)
  const formRef = useRef<HTMLFormElement>(null)

  // 提交成功后清空输入框（action 本身不能操作 DOM，这是客户端组件该做的事）
  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="grid gap-4" data-testid="action-form">
      <div className="grid gap-2">
        <Label htmlFor="action-title">标题</Label>
        <Input id="action-title" name="title" placeholder="写一条笔记标题" aria-invalid={Boolean(state.fieldErrors?.title)} />
        {state.fieldErrors?.title?.[0] && (
          <p className="text-sm text-destructive" role="alert" data-testid="action-field-error">
            {state.fieldErrors.title[0]}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="action-content">正文</Label>
        <Textarea id="action-content" name="content" rows={2} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} data-testid="action-submit">
          {pending ? '提交中...' : '添加'}
        </Button>
        {state.ok && <span className="text-sm text-muted-foreground">已添加</span>}
      </div>
    </form>
  )
}
