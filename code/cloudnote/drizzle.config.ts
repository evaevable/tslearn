// Drizzle Kit 的配置：迁移文件放 drizzle/，连接串从环境变量读
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://cloudnote:cloudnote@127.0.0.1:5432/cloudnote' },
})
