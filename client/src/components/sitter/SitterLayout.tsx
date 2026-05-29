import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Briefcase, Wallet, User, Bell, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { api } from '../../utils/api'
import ErrorBoundary from '../ErrorBoundary'

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
    api.get<any>('/auth/me').then(u => setUser(u)).catch(() => {})
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
    <div className="sp-page">
      <header className="sp-topbar">
        <div className="sp-top-left">
          <div className="sp-avatar" style={{ background: '#FFF0EB' }}>
            {user?.avatar || '🐾'}
          </div>
          <div className="sp-user-info">
            <span className="sp-name">{user?.name || '加载中...'}</span>
            <span className="sp-level">{user?.sitter_profile?.level ? levels[user.sitter_profile.level] || `Lv.${user.sitter_profile.level}` : '服务商'}</span>
          </div>
        </div>
        <div className="sp-top-right">
          <span className="sp-time">{currentTime}</span>
          <button className="sp-icon-btn" onClick={() => navigate('/sitter/settings')}><SettingsIcon size={18} /></button>
          <button className="sp-icon-btn" onClick={() => { localStorage.removeItem('petcare_token'); localStorage.removeItem('petcare_user'); navigate('/') }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="sp-content">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <nav className="sp-bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button key={tab.key} className={`sp-bn-item ${isActive ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
              <div className="sp-bn-icon-wrap">
                <Icon size={20} />
                {isActive && <div className="sp-bn-active-dot" />}
              </div>
              <span className="sp-bn-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <style>{`
        .sp-page {
          min-height: 100vh; background: #F5F6FA; padding-top: 60px; padding-bottom: 64px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .sp-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 60px;
          background: #fff; border-bottom: 1px solid #EEEEF2;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px;
        }
        .sp-top-left { display: flex; align-items: center; gap: 10px; }
        .sp-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .sp-user-info { display: flex; flex-direction: column; gap: 1px; }
        .sp-name { font-size: 14px; font-weight: 700; color: #1A1A2E; line-height: 1.2; }
        .sp-level { font-size: 11px; color: #FF7D5A; font-weight: 600; }
        .sp-top-right { display: flex; align-items: center; gap: 6px; }
        .sp-time {
          padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700;
          background: #F5F6FA; color: #1A1A2E; font-variant-numeric: tabular-nums;
          letter-spacing: 0.5px; margin-right: 4px;
        }
        .sp-icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #8E8EA0; transition: all 0.2s; cursor: pointer;
        }
        .sp-icon-btn:hover { background: #F5F6FA; color: #1A1A2E; }
        .sp-content { max-width: 800px; margin: 0 auto; padding: 16px 16px 24px; }
        .sp-bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          height: 64px; background: #fff; border-top: 1px solid #EEEEF2;
          display: flex; align-items: stretch; padding-bottom: env(safe-area-inset-bottom, 0);
        }
        .sp-bn-item {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 3px; cursor: pointer;
          color: #8E8EA0; transition: all 0.2s; position: relative;
        }
        .sp-bn-item.active { color: #FF7D5A; }
        .sp-bn-icon-wrap { position: relative; }
        .sp-bn-active-dot {
          position: absolute; top: -2px; right: -6px;
          width: 6px; height: 6px; border-radius: 50%; background: #FF7D5A;
        }
        .sp-bn-label { font-size: 10px; font-weight: 600; }
        @media (max-width: 768px) {
          .sp-time { display: none; }
          .sp-content { padding: 12px 12px 20px; }
        }
      `}</style>
    </div>
  )
}
