// 自定义 Hook：把第 7 章 App 里「拉列表」的 3 个 state + 1 个 Effect 原样搬过来
// Hook 就是一个以 use 开头、内部调用了其它 Hook 的普通函数。它复用的是「逻辑」，不是「数据」
import { useEffect, useState } from 'react'
import { fetchNotes } from '../api'
import type { Note, StatusFilter } from '../types'

export function useNotes(filter: StatusFilter) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetchNotes(filter, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setNotes(data)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      })
    return () => controller.abort()
  }, [filter, version])

  // 返回值就是这个 Hook 的「接口」：调用方只看到数据和一个 refresh，看不到 version 和 AbortController
  return { notes, loading, error, refresh: () => setVersion((v) => v + 1) }
}
