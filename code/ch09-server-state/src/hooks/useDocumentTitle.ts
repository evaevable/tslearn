// 最小的自定义 Hook：同步浏览器标签页标题
import { useEffect } from 'react'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
