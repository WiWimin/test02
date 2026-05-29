import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Briefcase, Wallet, User, ChevronLeft, Bell, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { api } from '../../utils/api'

const levels: Record<number, string> = { 1: '初级服务者', 2: '银牌服务者', 3: '金牌服务者' }

const tabs = [
  { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard, path: '/sitter/dashboard' },
  { key: 'orders', label: '订单', icon: ClipboardList, path: '/sitter/orders' },
  { key: 'services', label: '服务', icon: Briefcase, path: '/sitter/services' },
  { key: 'wallet', label: '收入', icon: Wallet, path: '/sitter/wallet' },
  { key: 'profile', label: '我的', icon: User, path: '/sitter/profile' },
]

export default function SitterLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    api.get<any>('/auth/me').then(setUser).catch(() => {})
    const tick = () => {
      const now = new Date()
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.key || 'dashboard'

  return (
    <div className="sl-page">
      <header className="sl-topbar">
        <div className="sl-topbar-inner">
          <button className="sl-top-back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div className="sl-top-user">
            <span className="sl-top-avatar" style={{ background: '#FFF0EB' }}>{user?.avatar || '👩'}</span>
            <div>
              <span className="sl-top-name">{user?.name || '加载中...'}</span>
              <span className="sl-top-level">{user?.sitter_profile?.level ? levels[user.sitter_profile.level] || `Lv.${user.sitter_profile.level}` : ''}</span>
            </div>
          </div>
          <div className="sl-top-time">{currentTime}</div>
          <div className="sl-top-actions">
            <button className="sl-top-btn" aria-label="通知"><Bell size={18} /><span className="sl-notif-dot" /></button>
            <button className="sl-top-btn" aria-label="设置" onClick={() => navigate('/sitter/settings')}><SettingsIcon size={18} /></button>
            <button className="sl-top-btn" aria-label="退出" onClick={() => navigate('/')}><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="sl-content">
        <Outlet />
      </main>

      <nav className="sl-bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button key={tab.key} className={`sl-bn-item ${isActive ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
              <Icon size={20} />
              <span className="sl-bn-label">{tab.label}</span>
              {tab.key === 'dashboard' && <span className="sl-bn-badge">2</span>}
            </button>
          )
        })}
      </nav>

      <style>{`
        .sl-page { min-height: 100vh; background: var(--color-bg); padding-top: 64px; padding-bottom: 56px; }
        .sl-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 64px; background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);
        }
        .sl-topbar-inner {
          display: flex; align-items: center; height: 100%; gap: 12px;
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
        }
        .sl-top-back {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-secondary); transition: all 0.25s;
        }
        .sl-top-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .sl-top-user { display: flex; align-items: center; gap: 10px; flex: 1; }
        .sl-top-avatar {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .sl-top-name { display: block; font-size: 14px; font-weight: 700; color: var(--color-text); line-height: 1.2; }
        .sl-top-level { display: block; font-size: 11px; color: var(--color-primary); font-weight: 600; }
        .sl-top-time {
          padding: 6px 14px; border-radius: 100px; font-size: 14px; font-weight: 700;
          background: var(--color-bg); color: var(--color-text);
          font-variant-numeric: tabular-nums; letter-spacing: 1px;
        }
        .sl-top-actions { display: flex; gap: 4px; }
        .sl-top-btn {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-secondary); transition: all 0.25s; position: relative;
        }
        .sl-top-btn:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .sl-notif-dot {
          position: absolute; top: 8px; right: 8px; width: 7px; height: 7px;
          border-radius: 50%; background: var(--color-error);
          border: 2px solid rgba(255,255,255,0.95);
        }
        .sl-content { max-width: 1200px; margin: 0 auto; padding: 20px 24px 24px; }
        .sl-bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          height: 56px; background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px); border-top: 1px solid var(--color-border);
          display: flex; align-items: stretch;
        }
        .sl-bn-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 2px; font-size: 10px; font-weight: 600; color: var(--color-text-muted);
          transition: all 0.25s; position: relative; cursor: pointer;
        }
        .sl-bn-item.active { color: var(--color-primary); }
        .sl-bn-item.active::before {
          content: ''; position: absolute; top: 0; left: 50%;
          transform: translateX(-50%); width: 20px; height: 2px;
          background: var(--color-primary); border-radius: 0 0 2px 2px;
        }
        .sl-bn-label { font-size: 10px; }
        .sl-bn-badge {
          position: absolute; top: 4px; right: 50%; margin-right: -18px;
          min-width: 16px; height: 16px; border-radius: 8px;
          background: var(--color-error); color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; padding: 0 4px;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .sl-top-time { display: none; }
          .sl-content { padding: 16px 16px 20px; }
        }
      `}</style>
    </div>
  )
}
