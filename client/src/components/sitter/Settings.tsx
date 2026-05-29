import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, ChevronRight, HelpCircle, Info } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState({ new_order: true, status_change: true, system: true, income: true })

  const toggle = (k: string) => setNotifs(prev => ({ ...prev, [k]: !prev[k as keyof typeof prev] }))

  return (
    <div className="ss-page">
      <h2 className="ss-title">设置</h2>

      <div className="ss-section">
        <div className="ss-section-title">消息通知</div>
        <div className="ss-toggle-list">
          {[
            { key: 'new_order', label: '新订单通知' },
            { key: 'status_change', label: '订单状态变更' },
            { key: 'system', label: '系统通知' },
            { key: 'income', label: '收入通知' },
          ].map(item => (
            <div key={item.key} className="ss-toggle-item">
              <span>{item.label}</span>
              <button className={'ss-toggle ' + (notifs[item.key as keyof typeof notifs] ? 'on' : '')} onClick={() => toggle(item.key)}>
                <div className="ss-toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="ss-section">
        <div className="ss-section-title">其他</div>
        <button className="ss-nav-item" onClick={() => navigate('/sitter/profile')}><Bell size={16} /> 个人资料 <ChevronRight size={16} className="ss-nav-arrow" /></button>
        <button className="ss-nav-item"><HelpCircle size={16} /> 帮助中心 <ChevronRight size={16} className="ss-nav-arrow" /></button>
        <button className="ss-nav-item"><Info size={16} /> 关于我们 <ChevronRight size={16} className="ss-nav-arrow" /></button>
      </div>

      <button className="ss-logout" onClick={() => { localStorage.removeItem('petcare_token'); localStorage.removeItem('petcare_user'); navigate('/') }}>
        <LogOut size={16} /> 退出登录
      </button>

      <style>{'.ss-page { display: flex; flex-direction: column; gap: 12px; } .ss-title { font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0; } .ss-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .ss-section-title { font-size: 13px; font-weight: 600; color: #8E8EA0; margin-bottom: 12px; } .ss-toggle-list { display: flex; flex-direction: column; gap: 0; } .ss-toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F5F6FA; font-size: 14px; color: #1A1A2E; font-weight: 500; } .ss-toggle-item:last-child { border-bottom: none; } .ss-toggle { width: 44px; height: 24px; border-radius: 12px; background: #D0D0D8; position: relative; cursor: pointer; transition: background 0.2s; } .ss-toggle.on { background: #45B7A0; } .ss-toggle-knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); } .ss-toggle.on .ss-toggle-knob { transform: translateX(20px); } .ss-nav-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 0; border-bottom: 1px solid #F5F6FA; font-size: 14px; color: #1A1A2E; cursor: pointer; text-align: left; } .ss-nav-item:last-child { border-bottom: none; } .ss-nav-arrow { margin-left: auto; color: #D0D0D8; } .ss-logout { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 12px; border-radius: 12px; background: #FFF0F0; color: #FF6B6B; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px; }'}</style>
    </div>
  )
}
