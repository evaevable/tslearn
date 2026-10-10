// 数据访问层：函数签名和第 4~12 章完全一样，内部从内存数组换成了 PostgreSQL + Drizzle
// 上层（页面、Route Handler、Server Action）不需要知道换了数据库
import 'server-only'
import { and, asc, eq, sql } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import { db } from '@/db'
import { notes, type NoteRow } from '@/db/schema'
import type { Note, NoteStatus } from '@/lib/schema'

// 数据库行 -> 应用层模型：createdAt 是 Date，接口和前端要的是 ISO 字符串
function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    status: row.status,
    tags: [],
    createdAt: row.createdAt.toISOString(),
  }
}

// 人为延迟：沿用第 7 章，用来演示竞态与流式渲染
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 每次查询打一行日志，方便在服务端日志里数「这次请求查了几次库」（积木 13-5 的实证）
function logQuery(what: string) {
  console.log(`[db] ${what} @ ${new Date().toISOString().slice(11, 23)}`)
}

// ---------- 读：加缓存（Cache Components）----------
// 'use cache' 把返回值缓存起来：构建时或首次请求时执行一次，之后直接复用，不再查库
// cacheTag 给这份缓存打标签，写操作后可按标签失效；cacheLife 决定它能活多久
export async function listNotes(status?: NoteStatus): Promise<Note[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('notes')
  logQuery(`select notes${status ? ` where status=${status}` : ''}`)
  const rows = status
    ? await db.select().from(notes).where(eq(notes.status, status)).orderBy(asc(notes.id))
    : await db.select().from(notes).orderBy(asc(notes.id))
  return rows.map(toNote)
}

export async function getNote(id: number): Promise<Note | undefined> {
  'use cache'
  cacheLife('minutes')
  cacheTag('notes', `note-${id}`) // 两个标签：既能整表失效，也能只失效这一条
  logQuery(`select note id=${id}`)
  const [row] = await db.select().from(notes).where(eq(notes.id, id))
  return row ? toNote(row) : undefined
}

// ---------- 写：不加缓存，写完负责让缓存失效 ----------
export async function createNote(data: Pick<Note, 'title' | 'content' | 'status'>): Promise<Note> {
  logQuery('insert note')
  const [row] = await db.insert(notes).values(data).returning() // 相当于 SQL 的 RETURNING *
  if (!row) throw new Error('插入失败')
  return toNote(row)
}

export async function updateNote(
  id: number,
  patch: Partial<Pick<Note, 'title' | 'content' | 'status'>>,
): Promise<Note | undefined> {
  logQuery(`update note id=${id}`)
  const [row] = await db.update(notes).set(patch).where(eq(notes.id, id)).returning()
  return row ? toNote(row) : undefined
}

export async function deleteNote(id: number): Promise<boolean> {
  logQuery(`delete note id=${id}`)
  const rows = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id })
  return rows.length > 0
}

// 查询条件组合：and(...) 是类型安全的，参数会被转成占位符（防 SQL 注入）
export async function titleExists(title: string, exceptId?: number): Promise<boolean> {
  const where = exceptId ? and(eq(notes.title, title), sql`${notes.id} <> ${exceptId}`) : eq(notes.title, title)
  const rows = await db.select({ id: notes.id }).from(notes).where(where).limit(1)
  return rows.length > 0
}

export async function countNotes(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(notes)
  return row?.count ?? 0
}
