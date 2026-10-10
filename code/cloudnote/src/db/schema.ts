// 数据库表结构：Drizzle 用 TS 代码定义表，并从表定义推导出类型（无需再手写类型）
// 对照 Go 的 sqlc：sqlc 是由 SQL 生成 Go 结构体，Drizzle 是由 TS 定义生成 SQL 和类型
import { pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// 数据库层面的枚举：只允许这三个值，写入别的值会被数据库拒绝（第 4 章讲的「最后一道校验」）
export const noteStatusEnum = pgEnum('note_status', ['draft', 'published', 'archived'])

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(), // 自增主键，对应 Go 的 bigserial/generated identity
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull().default(''),
  status: noteStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// 从表定义推导类型：$inferSelect 是查询结果的类型，$inferInsert 是插入时的类型
export type NoteRow = typeof notes.$inferSelect
export type NoteInsert = typeof notes.$inferInsert
