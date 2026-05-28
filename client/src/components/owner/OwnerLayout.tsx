import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, ClipboardList, PawPrint, Heart, User, Bell } from 'lucide-react'

const tabs = [
  { key: 'home', label: '首页', icon: Home, path: '/home/owner' },
  { key: 'market', label: '服务', icon: Search, path: '/home/owner/market' },
  { key: 'orders', label: '订单', icon: ClipboardList, path: '/home/owner/orders' },
  { key: 'pets', label: '宠物', icon: PawPrint, path: '/home/owner/pets' },
  { key: 'favorites', label: '收藏', icon: Heart, path: '/home/owner/favorites' },
  { key: 'profile', label: '我的', icon: User, path: '/home/owner/profile' },
]

export default function OwnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  const activeTab = tabs.find(t => location.pathname === t.path)?.key || 'home'

  return (
    <div className="ol-page">
      <header className="ol-topbar">
        <div className="ol-topbar-inner">
          <div className="ol-top-brand">
            <span className="ol-top-logo">PetCare</span>
            <span className="ol-top-tag">宠物主人</span>
          </div>
          <div className="ol-top-time">{currentTime}</div>
          <button className="ol-top-btn" aria-label="通知">
            <Bell size={18} />
            <span className="ol-notif-dot" />
          </button>
        </div>
      </header>

      <main className="ol-content">
        <Outlet />
      </main>

      <nav className="ol-bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button key={tab.key} className={`ol-bn-item ${isActive ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
              <Icon size={20} weight={isActive ? 'fill' : undefined} />
              <span className="ol-bn-label">{tab.label}</span>
              {tab.key === 'orders' && <span className="ol-bn-badge">3</span>}
            </button>
          )
        })}
      </nav>

      <style>{`
        .ol-page { min-height: 100vh; background: var(--color-bg); padding-top: 64px; padding-bottom: 56px; }
        .ol-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 64px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border); }
        .ol-topbar-inner { display: flex; align-items: center; height: 100%; gap: 12px; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .ol-top-brand { display: flex; align-items: center; gap: 10px; flex: 1; }
        .ol-top-logo { font-size: 18px; font-weight: 800; color: var(--color-primary); letter-spacing: -0.5px; }
        .ol-top-tag { padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: rgba(255,125,90,0.12); color: var(--color-primary); }
        .ol-top-time { padding: 6px 14px; border-radius: 100px; font-size: 14px; font-weight: 700; background: var(--color-bg); color: var(--color-text); font-variant-numeric: tabular-nums; letter-spacing: 1px; }
        .ol-top-btn { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); transition: all 0.25s; position: relative; }
        .ol-top-btn:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .ol-notif-dot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--color-error); border: 2px solid rgba(255,255,255,0.95); }
        .ol-content { max-width: 1200px; margin: 0 auto; padding: 20px 24px 24px; }
        .ol-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; height: 56px; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-top: 1px solid var(--color-border); display: flex; align-items: stretch; }
        .ol-bn-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 10px; font-weight: 600; color: var(--color-text-muted); transition: all 0.25s; position: relative; cursor: pointer; }
        .ol-bn-item.active { color: var(--color-primary); }
        .ol-bn-item.active::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 2px; background: var(--color-primary); border-radius: 0 0 2px 2px; }
        .ol-bn-label { font-size: 10px; margin-top: 1px; }
        .ol-bn-badge { position: absolute; top: 4px; right: 50%; margin-right: -22px; min-width: 16px; height: 16px; border-radius: 8px; background: var(--color-error); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; line-height: 1; }
        @media (max-width: 768px) {
          .ol-top-time { display: none; }
          .ol-content { padding: 16px 16px 20px; }
        }
      `}</style>
    </div>
  )
}
