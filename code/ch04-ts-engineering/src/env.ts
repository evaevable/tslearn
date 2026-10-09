// 启动时校验环境变量：配错了立刻退出，而不是跑到一半才炸
// 对照 Go：类似用 envconfig 把环境变量解析进 struct
import { z } from 'zod'

const EnvSchema = z.object({
  // 环境变量永远是字符串，coerce 先转成 number 再校验
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('环境变量配置错误：\n' + z.prettifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data // 类型：{ PORT: number; NODE_ENV: 'development' | 'production' | 'test' }
