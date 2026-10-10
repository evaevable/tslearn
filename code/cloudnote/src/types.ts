// 前端类型直接复用后端的 schema（只导入类型和常量，不会把服务端代码打进前端包）
import { NOTE_STATUSES, type NoteStatus } from '@/lib/schema'

export { NOTE_STATUSES }
export type { Note, NoteStatus } from '@/lib/schema'

export type StatusFilter = 'all' | NoteStatus

export const STATUS_TEXT: Record<NoteStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}
