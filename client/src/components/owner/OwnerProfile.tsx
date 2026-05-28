import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Phone, MapPin, Shield, ChevronRight, Bell, Lock,
  HelpCircle, FileText, LogOut, Camera, CheckCircle2, X,
  AlertCircle
} from 'lucide-react'
import { getCurrentUser, logout } from '../../utils/auth'

const menuGroups = [
  {
    title: '设置',
    items: [
      { icon: Bell, label: '消息通知', desc: '查看通知偏好', path: '#' },
      { icon: Lock, label: '账号安全', desc: '密码、设备管理', path: '#' },
      { icon: MapPin, label: '常用地址', desc: '管理服务地址', path: '/home/owner/addresses' },
    ],
  },
  {
    title: '其他',
    items: [
      { icon: FileText, label: '服务条款', desc: '用户协议', path: '#' },
      { icon: HelpCircle, label: '帮助中心', desc: '常见问题', path: '#' },
      { icon: Shield, label: '关于我们', desc: 'v2.0.1', path: '#' },
    ],
  },
]

export default function OwnerProfile() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [showLogout, setShowLogout] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const handleLogout = () => {
    logout()
    setToast({ msg: '已退出登录', type: 'success' })
    setTimeout(() => navigate('/'), 1000)
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="opro-page">
      {/* Profile Header */}
      <div className="opro-header">
        <div className="opro-avatar-wrap">
          <div className="opro-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <button className="opro-camera" onClick={() => showToast('头像功能开发中', 'success')}>
            <Camera size={14} />
          </button>
        </div>
        <h2 className="opro-name">{user?.name || '用户'}</h2>
        <p className="opro-phone">{user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定手机'}</p>
        <div className="opro-badge">宠物主人</div>
      </div>

      {/* Stats */}
      <div className="opro-stats">
        <div className="opro-stat">
          <span className="opro-stat-num">12</span>
          <span className="opro-stat-label">总订单</span>
        </div>
        <div className="opro-stat">
          <span className="opro-stat-num">4</span>
          <span className="opro-stat-label">收藏</span>
        </div>
        <div className="opro-stat">
          <span className="opro-stat-num">2</span>
          <span className="opro-stat-label">宠物</span>
        </div>
        <div className="opro-stat">
          <span className="opro-stat-num">5</span>
          <span className="opro-stat-label">评价</span>
        </div>
      </div>

      {/* Menu Groups */}
      {menuGroups.map(group => (
        <div key={group.title} className="opro-group">
          <h3 className="opro-group-title">{group.title}</h3>
          <div className="opro-menu">
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <button key={item.label} className="opro-menu-item" onClick={() => item.path !== '#' ? navigate(item.path) : showToast('功能开发中', 'success')}>
                  <div className="opro-mi-icon"><Icon size={18} /></div>
                  <div className="opro-mi-info">
                    <span className="opro-mi-label">{item.label}</span>
                    <span className="opro-mi-desc">{item.desc}</span>
                  </div>
                  <ChevronRight size={16} className="opro-mi-arrow" />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button className="opro-logout" onClick={() => setShowLogout(true)}>
        <LogOut size={18} /> 退出登录
      </button>

      {/* Logout Confirm */}
      {showLogout && (
        <div className="opro-overlay" onClick={() => setShowLogout(false)}>
          <div className="opro-confirm" onClick={e => e.stopPropagation()}>
            <AlertCircle size={32} />
            <h3>确认退出</h3>
            <p>退出后需要重新登录</p>
            <div className="opro-confirm-btns">
              <button className="opro-btn-cancel" onClick={() => setShowLogout(false)}>取消</button>
              <button className="opro-btn-confirm" onClick={handleLogout}>确认退出</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`opro-toast opro-toast-${toast.type}`}>{toast.msg}</div>}

      <style>{`
        .opro-page { }
        .opro-header {
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 20px; margin-bottom: 20px;
          background: linear-gradient(135deg, #FF7D5A 0%, #FF9F7A 100%);
          border-radius: var(--radius-lg); color: #fff;
        }
        .opro-avatar-wrap { position: relative; margin-bottom: 12px; }
        .opro-avatar {
          width: 72px; height: 72px; border-radius: var(--radius-full);
          background: rgba(255,255,255,0.3); display: flex;
          align-items: center; justify-content: center;
          font-size: 28px; font-weight: 700; color: #fff;
        }
        .opro-camera {
          position: absolute; bottom: 0; right: 0;
          width: 28px; height: 28px; border-radius: var(--radius-full);
          background: #fff; color: var(--color-text-secondary);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .opro-name { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
        .opro-phone { font-size: 13px; opacity: 0.8; margin: 0 0 10px; }
        .opro-badge { padding: 3px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.25); }
        .opro-stats {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
          margin-bottom: 20px;
        }
        .opro-stat {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; padding: 14px 8px; border-radius: var(--radius-md);
          background: #fff; border: 1px solid var(--color-border);
        }
        .opro-stat-num { font-size: 20px; font-weight: 800; color: var(--color-primary); }
        .opro-stat-label { font-size: 11px; color: var(--color-text-muted); }
        .opro-group { margin-bottom: 20px; }
        .opro-group-title { font-size: 13px; font-weight: 600; color: var(--color-text-muted); margin: 0 0 8px; padding: 0 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .opro-menu { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; }
        .opro-menu-item {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 14px 16px;
          border: none; border-bottom: 1px solid var(--color-border);
          background: none; text-align: left; cursor: pointer;
          transition: all 0.2s;
        }
        .opro-menu-item:last-child { border-bottom: none; }
        .opro-menu-item:hover { background: var(--color-bg); }
        .opro-mi-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); background: var(--color-bg); flex-shrink: 0; }
        .opro-mi-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .opro-mi-label { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .opro-mi-desc { font-size: 11px; color: var(--color-text-muted); }
        .opro-mi-arrow { color: var(--color-text-muted); }
        .opro-logout {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px; border-radius: var(--radius-md);
          border: 1px solid #FFD0D0; color: #FF6B6B; font-size: 14px; font-weight: 600;
          background: #fff; cursor: pointer; transition: all 0.25s;
        }
        .opro-logout:hover { background: #FFF0F0; }
        .opro-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: fadeIn 0.2s ease;
        }
        .opro-confirm {
          background: #fff; border-radius: var(--radius-lg);
          padding: 32px 28px 24px; text-align: center;
          max-width: 320px; width: 100%;
        }
        .opro-confirm h3 { font-size: 18px; font-weight: 700; margin: 12px 0 4px; }
        .opro-confirm p { font-size: 14px; color: var(--color-text-muted); margin: 0 0 20px; }
        .opro-confirm-btns { display: flex; gap: 10px; }
        .opro-btn-cancel { flex: 1; padding: 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--color-border); font-size: 14px; font-weight: 600; cursor: pointer; background: #fff; }
        .opro-btn-confirm { flex: 1; padding: 10px; border-radius: var(--radius-sm); border: none; font-size: 14px; font-weight: 600; cursor: pointer; background: #FF6B6B; color: #fff; }
        .opro-toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; padding: 12px 24px; border-radius: var(--radius-md);
          font-size: 14px; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: fadeInUp 0.35s ease;
        }
        .opro-toast-success { background: #E8F8F4; color: #3A9E89; border: 1px solid #45B7A0; }
        .opro-toast-error { background: #FFF0F0; color: #E86A4A; border: 1px solid #FF6B6B; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @media (max-width: 480px) { .opro-stat { padding: 12px 4px; } }
      `}</style>
    </div>
  )
}
