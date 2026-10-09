// 一份 schema，两种产物：运行时校验 + 编译期类型
// 对照第 2 章 model.ts：那里只有类型；这里类型是从 schema「推导」出来的
import { z } from 'zod'

export const NOTE_STATUSES = ['draft', 'published', 'archived'] as const
export const NoteStatusSchema = z.enum(NOTE_STATUSES)

export const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(20),
})

// 字段规则只在这里写一次
const title = z.string().trim().min(1, { error: '标题不能为空' }).max(100, { error: '标题最多 100 个字' })
const content = z.string().max(10_000, { error: '正文最多 1 万字' })

export const NoteSchema = z.object({
  id: z.number().int().positive(),
  title,
  content,
  status: NoteStatusSchema,
  tags: z.array(TagSchema),
  createdAt: z.iso.datetime(),
  summary: z.string().optional(),
})

// 新增：客户端可以不传 content / status，由 default 补上
export const CreateNoteInputSchema = z.object({
  title,
  content: content.default(''),
  status: NoteStatusSchema.default('draft'),
})

// 更新（PATCH）：每个字段都可选，而且【不能带 default】—— 见积木 4-6 的高频误解
export const UpdateNoteInputSchema = z
  .object({ title, content, status: NoteStatusSchema })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { error: '至少要修改一个字段' })

// ---------- 从 schema 推导类型，不再手写 ----------
export type Note = z.infer<typeof NoteSchema>
export type NoteStatus = z.infer<typeof NoteStatusSchema>
// input = 客户端「可以发」什么（default 字段可省略）；output = 校验后「一定有」什么
export type CreateNoteInput = z.input<typeof CreateNoteInputSchema>
export type CreateNoteData = z.output<typeof CreateNoteInputSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>
