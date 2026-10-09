import { useUser } from '../auth/UserContext'

export function UserBadge() {
  const { user, switchUser } = useUser()
  console.log('[render] UserBadge')
  return (
    <div className="user" data-testid="user">
      <span>
        {user.name}（{user.role === 'admin' ? '管理员' : '只读'}）
      </span>
      <button type="button" className="ghost" onClick={switchUser}>
        切换用户
      </button>
    </div>
  )
}
