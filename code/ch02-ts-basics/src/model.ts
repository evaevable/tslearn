// CloudNote 的数据模型：前后端共用的"契约"
// 注意：这个文件里除了 NOTE_STATUSES，其它全是类型，运行时会被完全擦掉

// 用 as const 数组 + 索引访问类型，代替 enum（enum 不是可擦除语法，node 不能直接跑）
// 好处：既有运行时的值（可以遍历、做校验），又能推导出联合类型
export const NOTE_STATUSES = ['draft', 'published', 'archived'] as const
export type NoteStatus = (typeof NOTE_STATUSES)[number] // 'draft' | 'published' | 'archived'

export type Tag = {
  readonly id: number
  name: string
}

export interface Note {
  readonly id: number // 只读：创建后不允许改
  title: string
  content: string
  status: NoteStatus
  tags: Tag[]
  createdAt: string // ISO 时间字符串；JSON 里没有 Date 类型
  summary?: string // 可选：AI 摘要可能还没生成（第 16 章）
}
