import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Phone, MapPin, Shield, ChevronRight, Bell, Lock,
  HelpCircle, FileText, LogOut, Camera, CheckCircle2, X,
  AlertCircle
} from 'lucide-react'
import { api } from '../../utils/api'
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
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogout, setShowLogout] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editName, setEditName] = useState('')
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<any>('/auth/me')
        setProfile(data)
        setEditName(data.name || '')
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    logout()
    setToast({ msg: '已退出登录', type: 'success' })
    setTimeout(() => navigate('/'), 1000)
  }

  const handleSaveProfile = async () => {
    try {
      const data = await api.put<any>('/auth/profile', { name: editName })
      setProfile((prev: any) => ({ ...prev, name: data.name }))
      setShowEdit(false)
      setToast({ msg: '修改成功', type: 'success' })
    } catch (err: any) {
      setToast({ msg: err.message || '修改失败', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setToast({ msg: '两次密码不一致', type: 'error' })
      setTimeout(() => setToast(null), 2500)
      return
    }
    if (pwForm.newPassword.length < 6) {
      setToast({ msg: '新密码至少6位', type: 'error' })
      setTimeout(() => setToast(null), 2500)
      return
    }
    try {
      await api.put('/auth/password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      setShowPassword(false)
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setToast({ msg: '密码修改成功', type: 'success' })
    } catch (err: any) {
      setToast({ msg: err.message || '密码修改失败', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const displayName = profile?.name || user?.name || '用户'
  const displayPhone = profile?.phone || user?.phone || ''

  if (loading) {
    return <div className="opro-page" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>加载中...</div>
  }

  return (
    <div className="opro-page">
      {/* Profile Header */}
      <div className="opro-header">
        <div className="opro-avatar-wrap">
          <div className="opro-avatar">{displayName?.charAt(0) || 'U'}</div>
          <button className="opro-camera" onClick={() => setShowEdit(true)}>
            <Camera size={14} />
          </button>
        </div>
        <h2 className="opro-name">{displayName}</h2>
        <p className="opro-phone">{displayPhone ? displayPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定手机'}</p>
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
                <button key={item.label} className="opro-menu-item"
                  onClick={() => {
                    if (item.path !== '#') navigate(item.path)
                    else if (item.label === '账号安全') setShowPassword(true)
                    else showToast('功能开发中', 'success')
                  }}>
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

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="opro-overlay" onClick={() => setShowEdit(false)}>
          <div className="opro-confirm" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h3>编辑资料</h3>
            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>昵称</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div className="opro-confirm-btns">
              <button className="opro-btn-cancel" onClick={() => setShowEdit(false)}>取消</button>
              <button className="opro-btn-confirm" style={{ background: 'var(--color-primary)' }} onClick={handleSaveProfile}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPassword && (
        <div className="opro-overlay" onClick={() => setShowPassword(false)}>
          <div className="opro-confirm" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: 360 }}>
            <h3>修改密码</h3>
            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>原密码</label>
                <input type="password" value={pwForm.oldPassword} onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>新密码</label>
                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>确认新密码</label>
                <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div className="opro-confirm-btns">
              <button className="opro-btn-cancel" onClick={() => setShowPassword(false)}>取消</button>
              <button className="opro-btn-confirm" style={{ background: 'var(--color-primary)' }} onClick={handleChangePassword}>确认修改</button>
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
