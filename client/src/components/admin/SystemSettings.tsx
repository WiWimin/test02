import { useState } from 'react'
import { Save, Plus, Trash2, Edit3, RefreshCw, ToggleLeft, Info, Users, Settings as SettingsIcon, Percent, Clock, MapPin, DollarSign } from 'lucide-react'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    commissionRate: '15', cancelFreeHours: '24', acceptTimeout: '15',
    maxDistance: '10', minPayout: '50', serviceStartRadius: '0.5',
    autoConfirm: true, smsNotify: true, newSitterOpen: true,
  })

  const [admins] = useState([
    { id: 'A-001', name: '超级管理员', account: 'admin@petcare.com', role: '超级管理员', lastLogin: '2026-05-28 09:30', avatar: '👤' },
    { id: 'A-002', name: '运营小张', account: 'zhang@petcare.com', role: '运营', lastLogin: '2026-05-28 08:15', avatar: '👩' },
    { id: 'A-003', name: '财务小李', account: 'li@petcare.com', role: '财务', lastLogin: '2026-05-27 18:00', avatar: '👨' },
  ])

  const handleChange = (key: string, value: string | boolean) => setSettings(prev => ({ ...prev, [key]: value }))

  const fields = [
    { key: 'commissionRate', label: '平台抽成比例', suffix: '%', desc: '从每笔订单中抽取的佣金比例', icon: Percent },
    { key: 'cancelFreeHours', label: '免费取消时限', suffix: '小时', desc: '服务开始前多少小时内取消需扣费', icon: Clock },
    { key: 'acceptTimeout', label: '接单超时时间', suffix: '分钟', desc: '超时未接单自动释放订单', icon: Clock },
    { key: 'maxDistance', label: '最大服务距离', suffix: '公里', desc: '服务者与用户之间的可服务距离', icon: MapPin },
    { key: 'minPayout', label: '最低提现金额', suffix: '元', desc: '服务者提现的最低金额限制', icon: DollarSign },
    { key: 'serviceStartRadius', label: '签到定位半径', suffix: '公里', desc: '开始服务时定位的允许偏差', icon: MapPin },
  ] as const

  const toggles = [
    { key: 'autoConfirm', label: '服务完成自动确认', desc: '标记完成后24小时系统自动确认' },
    { key: 'smsNotify', label: '短信通知开关', desc: '订单变更时短信通知相关方' },
    { key: 'newSitterOpen', label: '开放服务者注册', desc: '允许新服务者提交入驻申请' },
  ]

  return (
    <div className="ss-page">
      <div className="ss-page-hdr">
        <div><h1>系统设置</h1><p className="ss-subtitle">管理平台参数、权限和系统配置</p></div>
        <button className="ss-save-btn" onClick={() => alert('所有设置已保存！')}><Save size={16} /> 保存全部</button>
      </div>

      <div className="ss-card">
        <div className="ss-card-hdr"><div className="ss-ch-icon"><SettingsIcon size={18} /></div><div><h3>平台参数设置</h3><span className="ss-ch-desc">配置平台运营核心参数</span></div></div>
        <div className="ss-grid">
          {fields.map(f => { const Icon = f.icon; return (
            <div key={f.key} className="ss-field">
              <div className="ss-flbl"><Icon size={14} /><label>{f.label}</label></div>
              <div className="ss-finp"><input type="number" value={settings[f.key as keyof typeof settings] as string} onChange={e => handleChange(f.key, e.target.value)} /><span className="ss-fsuf">{f.suffix}</span></div>
              <p className="sfdesc">{f.desc}</p>
            </div>
          )})}
        </div>
      </div>

      <div className="ss-card">
        <div className="ss-card-hdr"><div className="ss-ch-icon" style={{ background: '#F0EBFF', color: '#9B59B6' }}><ToggleLeft size={18} /></div><div><h3>功能开关</h3><span className="ss-ch-desc">开启或关闭平台功能</span></div></div>
        <div className="ss-toggles">
          {toggles.map(t => (
            <div key={t.key} className="ss-toggle">
              <div className="ss-ti"><span className="ss-tlbl">{t.label}</span><span className="ss-tdesc">{t.desc}</span></div>
              <button className={`ss-tsw ${settings[t.key as keyof typeof settings] ? 'on' : ''}`} onClick={() => handleChange(t.key, !settings[t.key as keyof typeof settings])}><span className="ss-tknob" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="ss-card">
        <div className="ss-card-hdr"><div className="ss-ch-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}><Users size={18} /></div><div><h3>管理员账号</h3><span className="ss-ch-desc">管理后台操作员权限</span></div><button className="ss-add-btn" onClick={() => alert('添加管理员')}><Plus size={14} /> 添加</button></div>
        <div className="ss-admin-list">
          {admins.map(a => (
            <div key={a.id} className="ss-admin-item">
              <span className="ss-avatar">{a.avatar}</span>
              <div className="ss-ai"><span className="ss-aname">{a.name} <span className="ss-arole">{a.role}</span></span><span className="ss-account">{a.account} · 最近登录 {a.lastLogin}</span></div>
              <span className="ss-astatus">正常</span>
              <div className="ss-actions"><button className="ss-ibtn"><Edit3 size={14} /></button><button className="ss-ibtn danger"><Trash2 size={14} /></button></div>
            </div>
          ))}
        </div>
      </div>

      <div className="ss-card">
        <div className="ss-card-hdr"><div className="ss-ch-icon" style={{ background: '#F5F5F7', color: '#5A5A7A' }}><Info size={18} /></div><div><h3>系统信息</h3><span className="ss-ch-desc">运行环境和版本信息</span></div><button className="ss-refresh-btn" onClick={() => alert('已刷新')}><RefreshCw size={13} /> 刷新</button></div>
        <div className="ss-sys-grid">
          <div className="ss-sys-item"><span className="ss-sys-lbl">系统版本</span><span className="ss-sys-val">v2.1.0</span></div>
          <div className="ss-sys-item"><span className="ss-sys-lbl">运行环境</span><span className="ss-sys-val"><span className="ss-env-badge">Production</span></span></div>
          <div className="ss-sys-item"><span className="ss-sys-lbl">数据库</span><span className="ss-sys-val">PostgreSQL 15.2</span></div>
          <div className="ss-sys-item"><span className="ss-sys-lbl">缓存服务</span><span className="ss-sys-val">Redis 7.0</span></div>
          <div className="ss-sys-item"><span className="ss-sys-lbl">文件存储</span><span className="ss-sys-val">阿里云OSS</span></div>
          <div className="ss-sys-item"><span className="ss-sys-lbl">最近更新</span><span className="ss-sys-val">2026-05-28 15:30:22</span></div>
        </div>
      </div>

      <style>{`
        .ss-page { font-size: 14px; }
        .ss-page-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .ss-page-hdr h1 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0; }
        .ss-subtitle { font-size: 13px; color: #9E9EB8; margin-top: 4px; }
        .ss-save-btn { display: flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: 10px; background: linear-gradient(135deg, var(--color-primary), #FF6A40); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .ss-save-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,125,90,0.3); }

        .ss-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; padding: 20px; margin-bottom: 16px; }
        .ss-card-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .ss-card-hdr h3 { font-size: 15px; font-weight: 700; margin: 0; }
        .ss-ch-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-primary); background: var(--color-primary-light); }
        .ss-ch-desc { font-size: 11px; color: #9E9EB8; display: block; margin-top: 1px; }
        .ss-add-btn { margin-left: auto; display: flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: 8px; background: var(--color-primary); color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .ss-add-btn:hover { opacity: 0.9; }
        .ss-refresh-btn { margin-left: auto; display: flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 8px; border: 1px solid #E8E8EC; font-size: 12px; font-weight: 600; color: #5A5A7A; background: #fff; cursor: pointer; transition: all 0.25s; }
        .ss-refresh-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }

        .ss-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ss-field { padding: 12px 14px; background: #F8F9FB; border-radius: 10px; }
        .ss-flbl { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; color: #5A5A7A; }
        .ss-flbl label { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .ss-finp { display: flex; align-items: center; background: #fff; border-radius: 8px; border: 1px solid #E8E8EC; padding: 0 12px; }
        .ss-finp input { flex: 1; height: 38px; border: none; background: transparent; font-size: 14px; color: var(--color-text); outline: none; font-family: var(--font); }
        .ss-fsuf { font-size: 13px; color: #9E9EB8; }
        .sfdesc { font-size: 11px; color: #B0B0C0; margin: 6px 0 0; }

        .ss-toggles { display: flex; flex-direction: column; gap: 4px; }
        .ss-toggle { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; transition: background 0.2s; }
        .ss-toggle:hover { background: #F8F9FB; }
        .ss-ti { }
        .ss-tlbl { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .ss-tdesc { font-size: 11px; color: #9E9EB8; }
        .ss-tsw { width: 44px; height: 24px; border-radius: 12px; background: #D0D0D8; cursor: pointer; transition: all 0.3s; position: relative; flex-shrink: 0; }
        .ss-tsw.on { background: var(--color-primary); }
        .ss-tknob { width: 20px; height: 20px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: all 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .ss-tsw.on .ss-tknob { left: 22px; }

        .ss-admin-list { display: flex; flex-direction: column; gap: 3px; }
        .ss-admin-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: background 0.2s; }
        .ss-admin-item:hover { background: #F8F9FB; }
        .ss-avatar { font-size: 28px; line-height: 1; }
        .ss-ai { flex: 1; min-width: 0; }
        .ss-aname { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .ss-arole { font-size: 11px; font-weight: 500; color: #9E9EB8; margin-left: 6px; padding: 1px 7px; border-radius: 100px; background: #F0EBFF; color: #7C3AED; }
        .ss-account { display: block; font-size: 11px; color: #9E9EB8; margin-top: 1px; }
        .ss-astatus { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 100px; background: #E8F8F4; color: #2D9B7A; }
        .ss-actions { display: flex; gap: 2px; }
        .ss-ibtn { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #B0B0C0; transition: all 0.2s; cursor: pointer; }
        .ss-ibtn:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .ss-ibtn.danger:hover { background: #FFF0F0; color: #FF6B6B; }

        .ss-sys-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .ss-sys-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #F3F4F6; }
        .ss-sys-lbl { font-size: 13px; color: #9E9EB8; }
        .ss-sys-val { font-size: 13px; color: var(--color-text); font-weight: 500; }
        .ss-env-badge { padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; background: #E8F8F4; color: #2D9B7A; }

        @media (max-width: 768px) {
          .ss-grid { grid-template-columns: 1fr; }
          .ss-sys-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
