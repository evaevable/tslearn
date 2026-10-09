// CloudNote 数据模型（沿用第 2 章）+ 用工具类型派生出的接口参数类型
export const NOTE_STATUSES = ['draft', 'published', 'archived'] as const
export type NoteStatus = (typeof NOTE_STATUSES)[number]

export type Tag = { readonly id: number; name: string }

export type Note = {
  readonly id: number
  title: string
  content: string
  status: NoteStatus
  tags: Tag[]
  createdAt: string
  summary?: string
}

// ---------- 从 Note 派生，而不是重新手写 ----------
// 新增：title、content 必填，status 可选（默认 draft），其它字段由服务端生成
export type CreateNoteInput = Pick<Note, 'title' | 'content'> & Partial<Pick<Note, 'status'>>
// 更新：只能改这三个字段，而且每个都可选（PATCH 语义）
export type UpdateNoteInput = Partial<Pick<Note, 'title' | 'content' | 'status'>>
// 列表项：列表页不需要正文，去掉 content 减小响应体
export type NoteListItem = Omit<Note, 'content'>

// ---------- 泛型类型：一个分页结构，适配任何实体 ----------
export type Page<T> = {
  records: T[]
  total: number
  page: number
  pageSize: number
}

// ---------- 可辨识联合：一条笔记可能发生的事件 ----------
export type NoteEvent =
  | { type: 'created'; input: CreateNoteInput }
  | { type: 'updated'; id: number; patch: UpdateNoteInput }
  | { type: 'deleted'; id: number }
