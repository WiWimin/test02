import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Info, LogOut, ChevronRight } from 'lucide-react'
import { api } from '../../utils/api'

export default function Settings() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    newOrder: true,
    statusChange: true,
    system: false,
    income: true,
  })

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="st-page">
      <h1 className="st-title">系统设置</h1>

      <div className="st-section">
        <div className="st-section-hdr"><Bell size={16} /> 通知设置</div>
        <div className="st-card">
          <div className="st-toggle-row">
            <span className="st-toggle-label">新订单通知</span>
            <button className={`st-toggle ${notifications.newOrder ? 'on' : ''}`} onClick={() => toggle('newOrder')}>
              <span className="st-toggle-knob" />
            </button>
          </div>
          <div className="st-toggle-row">
            <span className="st-toggle-label">订单状态变更</span>
            <button className={`st-toggle ${notifications.statusChange ? 'on' : ''}`} onClick={() => toggle('statusChange')}>
              <span className="st-toggle-knob" />
            </button>
          </div>
          <div className="st-toggle-row">
            <span className="st-toggle-label">系统公告</span>
            <button className={`st-toggle ${notifications.system ? 'on' : ''}`} onClick={() => toggle('system')}>
              <span className="st-toggle-knob" />
            </button>
          </div>
          <div className="st-toggle-row">
            <span className="st-toggle-label">收入到账通知</span>
            <button className={`st-toggle ${notifications.income ? 'on' : ''}`} onClick={() => toggle('income')}>
              <span className="st-toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <div className="st-section">
        <div className="st-section-hdr"><Info size={16} /> 账户信息</div>
        <div className="st-card">
          <div className="st-info-row">
            <span className="st-info-label">账户版本</span>
            <span className="st-info-value">金牌服务者 <span className="st-badge">年费会员</span></span>
          </div>
          <div className="st-info-row">
            <span className="st-info-label">会员到期</span>
            <span className="st-info-value">2026-12-31</span>
          </div>
          <div className="st-info-row">
            <span className="st-info-label">绑定微信</span>
            <span className="st-info-value verified">已绑定 ✓</span>
          </div>
          <div className="st-info-row">
            <span className="st-info-label">绑定支付宝</span>
            <span className="st-info-value verified">已绑定 ✓</span>
          </div>
        </div>
      </div>

      <div className="st-section">
        <div className="st-card">
          <div className="st-nav-row" onClick={() => alert('关于 PetCare v1.0')}>
            <span className="st-nav-label">关于 PetCare</span>
            <span className="st-nav-right">v1.0 <ChevronRight size={14} /></span>
          </div>
          <div className="st-nav-row" onClick={() => alert('帮助中心')}>
            <span className="st-nav-label">帮助中心</span>
            <ChevronRight size={14} color="#D0D0D8" />
          </div>
        </div>
      </div>

      <button className="st-logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/login') }}>
        <LogOut size={16} /> 退出登录
      </button>

      <style>{`
        .st-page { max-width: 600px; margin: 0 auto; }
        .st-title { font-size: 20px; font-weight: 800; color: var(--color-text); margin: 0 0 24px; }
        .st-section { margin-bottom: 20px; }
        .st-section-hdr { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--color-text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .st-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; }
        .st-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--color-border); }
        .st-toggle-row:last-child { border-bottom: none; }
        .st-toggle-label { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .st-toggle { width: 44px; height: 24px; border-radius: 12px; background: #D0D0D8; cursor: pointer; transition: all 0.3s ease; position: relative; }
        .st-toggle.on { background: var(--color-secondary); }
        .st-toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1); transition: all 0.3s ease; }
        .st-toggle.on .st-toggle-knob { left: 22px; }
        .st-info-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--color-border); }
        .st-info-row:last-child { border-bottom: none; }
        .st-info-label { font-size: 13px; color: var(--color-text-muted); }
        .st-info-value { font-size: 13px; font-weight: 600; color: var(--color-text); display: flex; align-items: center; gap: 6px; }
        .st-info-value.verified { color: var(--color-secondary); }
        .st-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #FFF8E0; color: #D48806; font-weight: 700; }
        .st-nav-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--color-border); cursor: pointer; transition: all 0.2s; }
        .st-nav-row:last-child { border-bottom: none; }
        .st-nav-row:hover { background: var(--color-bg-alt); }
        .st-nav-label { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .st-nav-right { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-muted); }
        .st-logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; color: var(--color-error); border: 1px solid var(--color-border); background: #fff; cursor: pointer; transition: all 0.25s; margin-top: 8px; }
        .st-logout-btn:hover { background: #FFF0F0; border-color: var(--color-error); }
      `}</style>
    </div>
  )
}
