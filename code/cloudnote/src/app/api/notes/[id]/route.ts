// 动态段 [id]：/api/notes/2 -> params.id === '2'（永远是字符串）
import { z } from 'zod'
import { deleteNote, sleep, updateNote } from '@/lib/db'
import { UpdateNoteInputSchema } from '@/lib/schema'

type Ctx = RouteContext<'/api/notes/[id]'> // Next 生成的全局类型：params 是 Promise<{ id: string }>

async function guard(request: Request) {
  await sleep(800)
  if (request.headers.get('x-simulate-failure')) return Response.json({ error: '模拟服务端故障' }, { status: 503 })
  return null
}

export async function PATCH(request: Request, ctx: Ctx) {
  const failed = await guard(request)
  if (failed) return failed
  const { id } = await ctx.params
  const parsed = UpdateNoteInputSchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: z.flattenError(parsed.error).formErrors.join('；') }, { status: 422 })
  const note = await updateNote(Number(id), parsed.data)
  return note ? Response.json(note) : Response.json({ error: 'NOT_FOUND' }, { status: 404 })
}

export async function DELETE(request: Request, ctx: Ctx) {
  const failed = await guard(request)
  if (failed) return failed
  const { id } = await ctx.params
  return (await deleteNote(Number(id))) ? new Response(null, { status: 204 }) : Response.json({ error: 'NOT_FOUND' }, { status: 404 })
}
