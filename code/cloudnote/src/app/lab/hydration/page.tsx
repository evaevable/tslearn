// Hydration 实验：?bug=1 时渲染「服务端和浏览器结果不一样」的组件，制造 hydration 错误
import { RenderInfo } from '@/components/lab/RenderInfo'
import { BuggyEnv, FixedEnv } from '@/components/lab/EnvBadge'

export const metadata = { title: 'Hydration' }

export default async function HydrationPage(props: PageProps<'/lab/hydration'>) {
  const { bug } = await props.searchParams
  return (
    <RenderInfo
      mode={bug ? 'Hydration：错误示范' : 'Hydration：正确写法'}
      description="同一个客户端组件，先在服务端渲染成 HTML，再在浏览器里重新执行并「接管」那份 HTML。两次结果必须一致。"
    >
      {bug ? <BuggyEnv /> : <FixedEnv />}
    </RenderInfo>
  )
}
