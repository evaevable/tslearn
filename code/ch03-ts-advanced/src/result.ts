// Result：用可辨识联合表达"要么成功、要么失败"，对应 Go 的 (value, err)
// 区别：Go 里你可以忘了检查 err；这里不先检查 ok，根本拿不到 value
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
