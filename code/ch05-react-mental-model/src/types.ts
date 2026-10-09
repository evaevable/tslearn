// 本章只用到 Note 的一部分字段；第 9 章接真实 API 时换成第 4 章的 Zod schema
export const NOTE_STATUSES = ['draft', 'published', 'archived'] as const
export type NoteStatus = (typeof NOTE_STATUSES)[number]

export type Note = {
  readonly id: number
  title: string
  status: NoteStatus
}

export type StatusFilter = 'all' | NoteStatus

export const STATUS_TEXT: Record<NoteStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}
