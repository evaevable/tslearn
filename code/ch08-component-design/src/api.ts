// API 层（沿用第 7 章）：新增 ApiError.fieldErrors，把服务端 422 的字段级错误交给表单
import { z } from 'zod'
import { NoteSchema, type CreateNoteInput, type UpdateNoteInput } from '../server/schema.ts'
import type { Note, StatusFilter } from './types'

const NoteListSchema = z.object({ records: z.array(NoteSchema), total: z.number() })
const FieldErrorsSchema = z.record(z.string(), z.array(z.string()))

// Partial：表单里某个字段的错误可以被清掉（值为 undefined）
export type FieldErrors = Partial<z.infer<typeof FieldErrorsSchema>>

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors | undefined
  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (res.status === 204) return null
  const body: unknown = await res.json()
  if (!res.ok) {
    const error = typeof body === 'object' && body !== null && 'error' in body ? body.error : body
    if (typeof error === 'string') throw new ApiError(res.status, error)
    // 错误体是 { 字段: [消息] } 结构时，当作字段级错误
    const fields = FieldErrorsSchema.safeParse(error)
    throw new ApiError(res.status, '提交的数据有误', fields.success ? fields.data : undefined)
  }
  return body
}

export async function fetchNotes(status: StatusFilter, signal?: AbortSignal): Promise<Note[]> {
  const query = status === 'all' ? '' : `?status=${status}`
  const data = await request(`/api/notes${query}`, { signal })
  return NoteListSchema.parse(data).records
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  return NoteSchema.parse(await request('/api/notes', { method: 'POST', body: JSON.stringify(input) }))
}

export async function updateNote(id: number, patch: UpdateNoteInput): Promise<Note> {
  return NoteSchema.parse(await request(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }))
}

export async function deleteNote(id: number): Promise<void> {
  await request(`/api/notes/${id}`, { method: 'DELETE' })
}
