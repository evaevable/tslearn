// 执行迁移：node --env-file=.env scripts/migrate.ts
// 用 drizzle-orm 自带的 migrator 跑 drizzle/ 目录下的 SQL，并把已执行记录写进 __drizzle_migrations 表
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) throw new Error('缺少 DATABASE_URL')
const client = postgres(url, { max: 1 })
await migrate(drizzle(client), { migrationsFolder: './drizzle' })
console.log('迁移完成')
await client.end()
