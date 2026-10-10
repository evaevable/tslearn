// Route Handler：app/api/notes/route.ts 对应 /api/notes。导出的函数名就是 HTTP 方法
// 逻辑是第 9 章 server/server.ts 的原样移植；第 13 章再细讲 Route Handler 与 Server Actions
import { z } from 'zod'
import { createNote, listNotes, sleep, titleExists } from '@/lib/db'
import { CreateNoteInputSchema, NoteStatusSchema } from '@/lib/schema'

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('status')
  const status = raw === null ? null : NoteStatusSchema.safeParse(raw)
  if (status && !status.success) return Response.json({ error: `非法的 status：${raw}` }, { status: 422 })
  await sleep(status ? 300 : 1200) // 沿用第 7 章的人为延迟
  const records = listNotes(status?.data)
  return Response.json({ records, total: records.length })
}

export async function POST(request: Request) {
  await sleep(800)
  if (request.headers.get('x-simulate-failure')) return Response.json({ error: '模拟服务端故障' }, { status: 503 })
  const parsed = CreateNoteInputSchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: z.flattenError(parsed.error).fieldErrors }, { status: 422 })
  if (titleExists(parsed.data.title)) return Response.json({ error: { title: ['已有同名笔记'] } }, { status: 422 })
  return Response.json(createNote(parsed.data), { status: 201 })
}
