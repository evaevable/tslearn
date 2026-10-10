// 数据库客户端：一个进程只建一个连接池（和 Go 里 sql.DB 一样，不要每次查询都 New）
// 注意：这里不能写 import 'server-only'，否则种子脚本（普通 Node 进程）无法导入
// 保护放在上层 src/lib/db.ts 里
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.ts'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('缺少环境变量 DATABASE_URL（参考 .env.example）')

// 开发模式下热更新会反复执行模块，用 globalThis 缓存连接，避免连接数暴涨
const globalForDb = globalThis as unknown as { __cloudnoteDb?: ReturnType<typeof drizzle<typeof schema>> }
const client = postgres(connectionString, { max: 5 })

export const db = globalForDb.__cloudnoteDb ?? drizzle(client, { schema })
globalForDb.__cloudnoteDb = db
