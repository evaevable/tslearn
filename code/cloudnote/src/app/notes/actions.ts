'use server'
// Server Action：在服务端执行的函数，客户端可以直接调用它（表单 action={...} 或直接调用）
// 和第 4~9 章的 Route Handler 相比：不用手写 URL、不用 fetch、不用处理 JSON 序列化，
// 参数和返回值由 React 直接传递（可序列化的值或 FormData）
import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { createNote, deleteNote, titleExists, updateNote } from '@/lib/db'
import { CreateNoteInputSchema } from '@/lib/schema'

export type FormState = { ok: boolean; fieldErrors?: Record<string, string[] | undefined>; message?: string }

// 表单提交：useActionState 会把「上一次的返回值」和 FormData 一起传进来
export async function createNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = CreateNoteInputSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content') ?? '',
    status: formData.get('status') ?? 'draft',
  })
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }
  if (await titleExists(parsed.data.title)) return { ok: false, fieldErrors: { title: ['已有同名笔记'] } }

  await createNote(parsed.data)
  // 让缓存失效：updateTag 是「立即失效」，用户自己的修改马上能看到（read-your-own-writes）
  // 对比 revalidateTag：后者是 stale-while-revalidate，先返回旧内容、后台再更新
  updateTag('notes')
  revalidatePath('/notes') // 让页面重新渲染（清掉 Router Cache 里的这段路径）
  return { ok: true }
}

// 发布 / 撤回：直接用 <form action={toggleNoteAction}>，不需要 useActionState
export async function toggleNoteAction(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'))
  const nextStatus = formData.get('nextStatus') === 'published' ? 'draft' : 'published'
  await updateNote(id, { status: nextStatus })
  updateTag('notes')
  revalidatePath('/notes')
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'))
  await deleteNote(id)
  updateTag('notes')
  revalidatePath('/notes')
}
