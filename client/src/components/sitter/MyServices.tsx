import { useState, useEffect } from 'react'
import { Plus, Edit3, Power, X } from 'lucide-react'
import { api } from '../../utils/api'

export default function MyServices() {
  const [services, setServices] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ name: '', price: 0, duration: 30, description: '', category: 'walk' })

  useEffect(() => { api.get<any[]>('/services').then(setServices).catch(() => {}) }, [])

  const handleSubmit = async () => {
    try {
      if (editItem) { await api.put('/services/' + editItem.id, form); setServices(prev => prev.map(s => s.id === editItem.id ? { ...s, ...form } : s)) }
      else { const r = await api.post<any>('/services', form); setServices(prev => [...prev, r]) }
      setShowModal(false); setEditItem(null)
    } catch {}
  }

  const toggleService = async (id: string) => {
    try { await api.put('/services/' + id + '/toggle'); setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s)) } catch {}
  }

  return (
    <div className="sms-page">
      <div className="sms-header"><h2>我的服务</h2><button className="sms-add-btn" onClick={() => { setEditItem(null); setForm({ name: '', price: 0, duration: 30, description: '', category: 'walk' }); setShowModal(true) }}><Plus size={16} /> 添加服务</button></div>
      {services.length === 0 ? <div className="sms-empty">暂无服务，点击上方添加</div> : services.map(s => (
        <div key={s.id} className="sms-card">
          <div className="sms-card-top"><span className="sms-name">{s.icon || '🐾'} {s.name}</span><span className={'sms-status ' + s.status}>{s.status === 'active' ? '上架' : '下架'}</span></div>
          <div className="sms-card-meta">¥{s.price} / {s.duration}分钟</div>
          {s.description && <div className="sms-desc">{s.description}</div>}
          <div className="sms-card-actions">
            <button className="sms-action-btn" onClick={() => { setEditItem(s); setForm({ name: s.name, price: s.price, duration: s.duration, description: s.description || '', category: s.category || 'walk' }); setShowModal(true) }}><Edit3 size={13} /> 编辑</button>
            <button className={'sms-action-btn ' + (s.status === 'active' ? 'off' : 'on')} onClick={() => toggleService(s.id)}><Power size={13} /> {s.status === 'active' ? '下架' : '上架'}</button>
          </div>
        </div>
      ))}

      {showModal && <div className="sms-modal-overlay" onClick={() => setShowModal(false)}><div className="sms-modal" onClick={e => e.stopPropagation()}><div className="sms-modal-header"><h3>{editItem ? '编辑服务' : '添加服务'}</h3><button onClick={() => setShowModal(false)}><X size={18} /></button></div>
        <div className="sms-modal-field"><label>服务名称</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="如：遛狗30分钟" /></div>
        <div className="sms-modal-row"><div className="sms-modal-field flex"><label>价格 (¥)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div><div className="sms-modal-field flex"><label>时长 (分钟)</label><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></div></div>
        <div className="sms-modal-field"><label>描述</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <button className="sms-submit-btn" onClick={handleSubmit}>保存</button>
      </div></div>}

      <style>{'.sms-page { display: flex; flex-direction: column; gap: 10px; } .sms-header { display: flex; justify-content: space-between; align-items: center; } .sms-header h2 { font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0; } .sms-add-btn { display: flex; align-items: center; gap: 4px; padding: 8px 14px; border-radius: 8px; background: #FF7D5A; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; } .sms-empty { text-align: center; padding: 40px; color: #8E8EA0; font-size: 13px; } .sms-card { background: #fff; border-radius: 14px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .sms-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; } .sms-name { font-size: 14px; font-weight: 600; color: #1A1A2E; } .sms-status { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px; } .sms-status.active { background: #E8F8F4; color: #45B7A0; } .sms-status.inactive { background: #F0F2F5; color: #8E8EA0; } .sms-card-meta { font-size: 15px; font-weight: 800; color: #FF7D5A; margin-bottom: 6px; } .sms-desc { font-size: 12px; color: #8E8EA0; margin-bottom: 8px; } .sms-card-actions { display: flex; gap: 8px; } .sms-action-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; background: #F5F6FA; color: #5A5A7A; cursor: pointer; } .sms-action-btn.on { background: #E8F8F4; color: #45B7A0; } .sms-action-btn.off { background: #FFF0F0; color: #FF6B6B; } .sms-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; } .sms-modal { background: #fff; border-radius: 16px; padding: 24px; width: 100%; max-width: 400px; } .sms-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; } .sms-modal-header h3 { font-size: 16px; font-weight: 700; color: #1A1A2E; margin: 0; } .sms-modal-field { margin-bottom: 14px; } .sms-modal-field label { display: block; font-size: 12px; color: #8E8EA0; margin-bottom: 4px; } .sms-modal-field input, .sms-modal-field textarea { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #EEEEF2; font-size: 13px; outline: none; box-sizing: border-box; } .sms-modal-field input:focus, .sms-modal-field textarea:focus { border-color: #FF7D5A; } .sms-modal-row { display: flex; gap: 10px; } .sms-modal-row .flex { flex: 1; } .sms-submit-btn { width: 100%; padding: 12px; border-radius: 8px; background: #FF7D5A; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }'}</style>
    </div>
  )
}
