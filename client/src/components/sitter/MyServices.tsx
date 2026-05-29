import { useState, useEffect } from 'react'
import { Plus, Edit3, Power, Eye, X, Check } from 'lucide-react'
import { api } from '../../utils/api'

interface ServiceItem {
  id: string; icon: string; name: string; price: number; duration: number;
  description: string; status: 'active' | 'inactive'; completedOrders: number;
}

const defaultWorkHours = [
  { day: '周一~周五', range: '09:00 - 20:00' },
  { day: '周六~周日', range: '10:00 - 18:00' },
]

export default function MyServices() {
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    api.get('/services').then((data: any) => setServices(data || []))
  }, [])
  const [showEdit, setShowEdit] = useState(false)
  const [editing, setEditing] = useState<ServiceItem | null>(null)

  const toggleStatus = (id: string) => {
    const svc = services.find(s => s.id === id)
    if (!svc) return
    const newStatus = svc.status === 'active' ? 'inactive' : 'active'
    api.put('/services/' + id, { status: newStatus }).then(() => {
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    })
  }

  const openNew = () => { setEditing(null); setShowEdit(true) }
  const openEdit = (svc: ServiceItem) => { setEditing(svc); setShowEdit(true) }

  return (
    <div className="ms-page">
      <div className="ms-header">
        <h1>我的服务</h1>
        <button className="ms-add-btn" onClick={openNew}><Plus size={16} /> 新增服务</button>
      </div>

      <div className="ms-card">
        <div className="ms-card-hdr"><h3>出勤设置</h3></div>
        <div className="ms-card-body">
          {defaultWorkHours.map(w => (
            <div key={w.day} className="ms-hour-row">
              <span className="ms-hour-day">{w.day}</span>
              <span className="ms-hour-range">{w.range}</span>
            </div>
          ))}
          <div className="ms-hour-row">
            <span className="ms-hour-day">服务区域</span>
            <span className="ms-hour-range">望京 · 三元桥 · 亮马桥</span>
          </div>
          <button className="ms-edit-link" onClick={() => alert('编辑出勤设置')}>✏️ 编辑</button>
        </div>
      </div>

      <div className="ms-list">
        {services.map(svc => (
          <div key={svc.id} className={`ms-service-card ${svc.status === 'inactive' ? 'inactive' : ''}`}>
            <div className="ms-svc-left">
              <span className="ms-svc-icon">{svc.icon}</span>
            </div>
            <div className="ms-svc-body">
              <div className="ms-svc-top">
                <span className="ms-svc-name">{svc.name}</span>
                <span className={`ms-svc-status ${svc.status}`}>
                  {svc.status === 'active' ? '🟢 已上架' : '🔴 已下架'}
                </span>
              </div>
              <p className="ms-svc-desc">{svc.description}</p>
              <div className="ms-svc-footer">
                <span className="ms-svc-price">¥{svc.price}<span className="ms-svc-unit">/{svc.duration}分钟</span></span>
                <span className="ms-svc-orders"><Eye size={12} /> {svc.completedOrders}单</span>
              </div>
            </div>
            <div className="ms-svc-actions">
              <button className="ms-svc-btn" onClick={() => openEdit(svc)} title="编辑"><Edit3 size={15} /></button>
              <button className={`ms-svc-btn ${svc.status === 'active' ? 'warn' : 'ok'}`} onClick={() => toggleStatus(svc.id)} title={svc.status === 'active' ? '下架' : '上架'}>
                {svc.status === 'active' ? <X size={15} /> : <Check size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showEdit && (
        <div className="ms-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="ms-modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? '编辑服务' : '新增服务'}</h2>
            <div className="ms-form">
              <label>服务名称</label>
              <input defaultValue={editing?.name || ''} placeholder="如：遛狗 30分钟" />
              <label>服务价格 (¥)</label>
              <input defaultValue={editing?.price || ''} type="number" placeholder="49" />
              <label>时长 (分钟)</label>
              <input defaultValue={editing?.duration || ''} type="number" placeholder="30" />
              <label>服务描述</label>
              <textarea defaultValue={editing?.description || ''} placeholder="简要描述服务内容" rows={3} />
              <div className="ms-form-actions">
                <button className="ms-form-btn cancel" onClick={() => setShowEdit(false)}>取消</button>
                <button className="ms-form-btn save" onClick={() => {
                  const el = document.querySelectorAll('.ms-form input, .ms-form textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
                  const body = { name: el[0].value, price: Number(el[1].value), duration: Number(el[2].value), description: el[3].value }
                  const req = editing ? api.put('/services/' + editing.id, body) : api.post('/services', body)
                  req.then(() => { setShowEdit(false); api.get('/services').then((d: any) => setServices(d || [])) })
                }}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ms-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ms-header h1 { font-size: 20px; font-weight: 800; color: var(--color-text); margin: 0; }
        .ms-add-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: var(--radius-sm); background: var(--color-primary-gradient); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .ms-add-btn:hover { box-shadow: 0 4px 14px rgba(255,125,90,0.3); transform: translateY(-1px); }
        .ms-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; margin-bottom: 16px; }
        .ms-card-hdr { margin-bottom: 12px; }
        .ms-card-hdr h3 { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
        .ms-card-body { display: flex; flex-direction: column; gap: 8px; }
        .ms-hour-row { display: flex; align-items: center; gap: 12px; }
        .ms-hour-day { font-size: 13px; font-weight: 600; color: var(--color-text); min-width: 80px; }
        .ms-hour-range { font-size: 13px; color: var(--color-text-secondary); }
        .ms-edit-link { font-size: 12px; color: var(--color-primary); font-weight: 600; align-self: flex-start; cursor: pointer; }
        .ms-list { display: flex; flex-direction: column; gap: 10px; }
        .ms-service-card { display: flex; gap: 14px; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; transition: all 0.25s; }
        .ms-service-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.03); }
        .ms-service-card.inactive { opacity: 0.65; }
        .ms-svc-left { flex-shrink: 0; }
        .ms-svc-icon { font-size: 32px; }
        .ms-svc-body { flex: 1; min-width: 0; }
        .ms-svc-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .ms-svc-name { font-size: 15px; font-weight: 700; color: var(--color-text); }
        .ms-svc-status { font-size: 11px; font-weight: 600; }
        .ms-svc-status.active { color: #2D9B7A; }
        .ms-svc-status.inactive { color: var(--color-text-muted); }
        .ms-svc-desc { font-size: 13px; color: var(--color-text-secondary); margin: 4px 0; line-height: 1.4; }
        .ms-svc-footer { display: flex; align-items: center; gap: 16px; margin-top: 6px; }
        .ms-svc-price { font-size: 18px; font-weight: 800; color: var(--color-primary); }
        .ms-svc-unit { font-size: 12px; font-weight: 500; color: var(--color-text-muted); }
        .ms-svc-orders { display: flex; align-items: center; gap: 3px; font-size: 12px; color: var(--color-text-muted); }
        .ms-svc-actions { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
        .ms-svc-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); transition: all 0.2s; cursor: pointer; }
        .ms-svc-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .ms-svc-btn.warn:hover { background: #FFF0F0; color: var(--color-error); }
        .ms-svc-btn.ok:hover { background: #E8F8F4; color: #2D9B7A; }
        .ms-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
        .ms-modal { background: #fff; border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 420px; box-shadow: 0 25px 80px rgba(0,0,0,0.15); animation: expandIn 0.3s ease; }
        .ms-modal h2 { font-size: 18px; font-weight: 800; color: var(--color-text); margin: 0 0 20px; }
        .ms-form { display: flex; flex-direction: column; gap: 12px; }
        .ms-form label { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .ms-form input, .ms-form textarea { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; outline: none; font-family: inherit; }
        .ms-form input:focus, .ms-form textarea:focus { border-color: var(--color-primary); }
        .ms-form textarea { resize: vertical; }
        .ms-form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .ms-form-btn { flex: 1; padding: 10px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .ms-form-btn.cancel { border: 1px solid var(--color-border); color: var(--color-text-secondary); background: #fff; }
        .ms-form-btn.save { background: var(--color-primary-gradient); color: #fff; border: none; box-shadow: 0 3px 10px rgba(255,125,90,0.2); }
        @media (max-width: 768px) { .ms-service-card { flex-wrap: wrap; } .ms-svc-actions { flex-direction: row; width: 100%; justify-content: flex-end; } }
      `}</style>
    </div>
  )
}
