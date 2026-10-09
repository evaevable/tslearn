// 第 9 章：内部换成 TanStack Query。返回值的形状和第 8 章完全一样，所以调用方一行都不用改
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotes } from '../api'
import type { StatusFilter } from '../types'
import { noteKeys } from './queryKeys'

export function useNotes(filter: StatusFilter) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: noteKeys.list(filter), // 键变了 = 换一份缓存；键一样 = 共享同一份
    queryFn: ({ signal }) => fetchNotes(filter, signal), // signal：键变化或组件卸载时自动取消
  })

  return {
    notes: query.data ?? [],
    loading: query.isPending, // 还没有任何数据（首次加载）
    fetching: query.isFetching, // 正在请求（包括有缓存时的后台刷新）
    error: query.error?.message ?? '',
    refresh: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  }
}
