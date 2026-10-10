// 写操作：useMutation。成功后「让相关缓存失效」，而不是手动改 version 计数器
import { useMutation } from '@tanstack/react-query'
import { createNote, deleteNote, updateNote } from '../api'
import type { CreateNoteData } from '@/lib/schema'
import type { Note } from '../types'
import { noteKeys } from './queryKeys'

// 普通写法：请求成功 -> 失效所有笔记缓存 -> 正在显示的列表自动重新拉取
export function useCreateNote() {
  return useMutation({
    mutationFn: (data: CreateNoteData) => createNote(data),
    // 第 2 个参数 context.client 就是 QueryClient（TanStack Query v5.8x 起的写法）
    onSuccess: (_note, _data, _result, context) => context.client.invalidateQueries({ queryKey: noteKeys.all }),
  })
}

export function useDeleteNote() {
  return useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: (_r, _id, _result, context) => context.client.invalidateQueries({ queryKey: noteKeys.all }),
  })
}

export function useRenameNote() {
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => updateNote(id, { title }),
    onSuccess: (_note, _vars, _result, context) => context.client.invalidateQueries({ queryKey: noteKeys.all }),
  })
}

// 乐观更新：先改界面，再发请求；失败就回滚（积木 9-6）
const nextStatus = (note: Note) => (note.status === 'published' ? 'draft' : 'published')

export function useToggleNote() {
  return useMutation({
    mutationFn: (note: Note) => updateNote(note.id, { status: nextStatus(note) }),

    // ① 请求发出之前：改缓存，界面立刻变化
    onMutate: async (note, context) => {
      // 先取消正在进行的列表请求，免得它晚点返回把我们的乐观值覆盖掉（第 7 章的竞态）
      await context.client.cancelQueries({ queryKey: noteKeys.all })
      // 拍快照：所有以 ['notes'] 开头的缓存
      const snapshot = context.client.getQueriesData<Note[]>({ queryKey: noteKeys.all })
      context.client.setQueriesData<Note[]>({ queryKey: noteKeys.all }, (old) =>
        old?.map((n) => (n.id === note.id ? { ...n, status: nextStatus(note) } : n)),
      )
      return { snapshot } // 返回值会作为 onMutateResult 传给 onError / onSettled
    },

    // ② 失败：用快照恢复
    onError: (_error, _note, onMutateResult, context) => {
      onMutateResult?.snapshot.forEach(([key, data]) => context.client.setQueryData(key, data))
    },

    // ③ 无论成功失败：重新拉一次，以服务端为准（比如状态变了之后，它该不该还留在「草稿」列表里）
    onSettled: (_data, _error, _note, _result, context) => context.client.invalidateQueries({ queryKey: noteKeys.all }),
  })
}
