// 泛型仓储：一份代码，服务任何"有 id 的实体"
// 对照 Go：type MemoryRepo[T interface{ GetID() int }] struct { items []T }
import { ok, err, type Result } from './result.ts'
import type { Page } from './model.ts'

export class MemoryRepo<T extends { readonly id: number }> {
  // # 开头是 JS 原生私有字段，运行时也访问不到（比 TS 的 private 更彻底）
  #items: T[] = []
  #nextId = 1

  create(input: Omit<T, 'id'>): T {
    // TS 无法自动证明「Omit<T, 'id'> 加上 id」就等于 T（T 可能对 id 有更窄的约束），
    // 所以这里需要一次类型断言 as T。断言 = 你替编译器担保，要尽量少用、用就写清理由。
    const item = { ...input, id: this.#nextId++ } as unknown as T
    this.#items.push(item)
    return item
  }

  get(id: number): T | undefined {
    return this.#items.find((x) => x.id === id)
  }

  list(page = 1, pageSize = 10): Page<T> {
    const start = (page - 1) * pageSize
    return { records: this.#items.slice(start, start + pageSize), total: this.#items.length, page, pageSize }
  }

  update(id: number, patch: Partial<Omit<T, 'id'>>): Result<T, 'NOT_FOUND'> {
    const index = this.#items.findIndex((x) => x.id === id)
    if (index === -1) return err('NOT_FOUND')
    const updated = { ...this.#items[index]!, ...patch }
    this.#items[index] = updated
    return ok(updated)
  }

  delete(id: number): boolean {
    const before = this.#items.length
    this.#items = this.#items.filter((x) => x.id !== id)
    return this.#items.length < before
  }
}
