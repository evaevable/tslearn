// 查询键：缓存的「主键」。用工厂函数集中定义，避免各处手写数组拼错
import type { StatusFilter } from '../types'

export const noteKeys = {
  all: ['notes'] as const, // 前缀：失效它 = 失效所有笔记相关缓存
  list: (filter: StatusFilter) => ['notes', 'list', filter] as const,
}
