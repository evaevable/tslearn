// 全应用唯一的 QueryClient：所有服务端数据的缓存都放在它里面（组件树之外）
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 默认值：数据一拿到就算「过期」，下次用到时先显示缓存、再后台刷新（积木 9-3）
      retry: 1, // 默认是 3 次指数退避重试；教学项目改成 1 次，出错时更快看到错误
    },
  },
})
