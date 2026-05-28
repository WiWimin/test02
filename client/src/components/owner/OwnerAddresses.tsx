import { useState } from 'react'
import { MapPin, Phone, Plus, Edit3, Trash2, ChevronLeft, Star, Home, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Address {
  id: number
  name: string
  phone: string
  tag: 'home' | 'company' | 'other'
  address: string
  detail: string
  isDefault: boolean
  lat?: number
  lng?: number
}

const mockAddresses: Address[] = [
  { id: 1, name: '张三', phone: '138****5678', tag: 'home', address: '北京市朝阳区望京街道', detail: '融泽嘉园12号院3号楼1单元1808', isDefault: true, lat: 39.9042, lng: 116.4074 },
  { id: 2, name: '张三', phone: '138****5678', tag: 'company', address: '北京市海淀区中关村大街', detail: '银谷大厦 15F 1506', isDefault: false, lat: 39.9042, lng: 116.4074 },
]

const tagConfig = {
  home: { label: '家', icon: Home, color: '#FF7D5A', bg: '#FFF0EB' },
  company: { label: '公司', icon: Briefcase, color: '#45B7A0', bg: '#E8F8F4' },
  other: { label: '其他', icon: MapPin, color: '#A855F7', bg: '#F0E6FF' },
}

const emptyForm: Omit<Address, 'id'> = {
  name: '', phone: '', tag: 'home', address: '', detail: '', isDefault: false,
}

export default function OwnerAddresses() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Address, 'id'>>({ ...emptyForm })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyForm, isDefault: addresses.length === 0 })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (addr: Address) => {
    setEditingId(addr.id)
    setForm({ name: addr.name, phone: addr.phone, tag: addr.tag, address: addr.address, detail: addr.detail, isDefault: addr.isDefault })
    setErrors({})
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = '请填写联系人'
    if (!form.phone.trim()) errs.phone = '请填写电话'
    if (!form.address.trim()) errs.address = '请选择地址'
    if (!form.detail.trim()) errs.detail = '请填写详细地址'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editingId) {
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : form.isDefault ? { ...a, isDefault: false } : a))
    } else {
      const newId = Math.max(0, ...addresses.map(a => a.id)) + 1
      setAddresses(prev => [...prev.map(a => form.isDefault ? { ...a, isDefault: false } : a), { id: newId, ...form }])
    }
    setShowModal(false)
  }

  const setDefault = (id: number) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  }

  return (
    <div className="oa-page">
      <div className="oa-header">
        <button className="oa-back" onClick={() => navigate('/home/owner/profile')}><ChevronLeft size={20} /></button>
        <h2 className="oa-title">地址管理</h2>
        <button className="oa-add-btn" onClick={openAdd}><Plus size={18} /> 新增</button>
      </div>

      {addresses.length === 0 ? (
        <div className="oa-empty">
          <MapPin size={48} />
          <p>还没有保存的地址</p>
          <button className="oa-empty-btn" onClick={openAdd}>添加地址</button>
        </div>
      ) : (
        <div className="oa-list">
          {addresses.map(addr => {
            const tag = tagConfig[addr.tag]
            const TagIcon = tag.icon
            return (
              <div key={addr.id} className={`oa-card ${addr.isDefault ? 'default' : ''}`}>
                {addr.isDefault && <span className="oa-default-badge"><Star size={10} /> 默认</span>}
                <div className="oa-card-top">
                  <div className="oa-card-user">
                    <span className="oa-card-name">{addr.name}</span>
                    <span className="oa-card-phone">{addr.phone}</span>
                  </div>
                  <div className="oa-card-actions">
                    <button className="oa-action-btn" onClick={() => setDefault(addr.id)} title="设为默认"><Star size={16} /></button>
                    <button className="oa-action-btn" onClick={() => openEdit(addr)} title="编辑"><Edit3 size={16} /></button>
                    <button className="oa-action-btn danger" onClick={() => handleDelete(addr.id)} title="删除"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="oa-card-address">
                  <MapPin size={14} className="oa-addr-icon" />
                  <span>{addr.address}</span>
                </div>
                <div className="oa-card-detail">{addr.detail}</div>
                <div className="oa-card-tag" style={{ background: tag.bg, color: tag.color }}>
                  <TagIcon size={12} /> {tag.label}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="oa-overlay" onClick={() => setShowModal(false)}>
          <div className="oa-modal" onClick={e => e.stopPropagation()}>
            <h3 className="oa-modal-title">{editingId ? '编辑地址' : '新增地址'}</h3>

            <div className="oa-field">
              <label>联系人</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="姓名" />
              {errors.name && <span className="oa-err">{errors.name}</span>}
            </div>

            <div className="oa-field">
              <label>联系电话</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="手机号码" />
              {errors.phone && <span className="oa-err">{errors.phone}</span>}
            </div>

            <div className="oa-field">
              <label>标签</label>
              <div className="oa-tag-select">
                {(Object.keys(tagConfig) as Array<keyof typeof tagConfig>).map(key => {
                  const t = tagConfig[key]
                  const TI = t.icon
                  return (
                    <button key={key} className={`oa-tag-option ${form.tag === key ? 'active' : ''}`}
                      style={form.tag === key ? { background: t.bg, color: t.color, borderColor: t.color } : {}}
                      onClick={() => setForm(p => ({ ...p, tag: key }))}>
                      <TI size={14} /> {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="oa-field">
              <label>地址</label>
              <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="小区/街道/地标" />
              {errors.address && <span className="oa-err">{errors.address}</span>}
            </div>

            <div className="oa-field">
              <label>详细地址</label>
              <input value={form.detail} onChange={e => setForm(p => ({ ...p, detail: e.target.value }))} placeholder="门牌号/楼层/房间号" />
              {errors.detail && <span className="oa-err">{errors.detail}</span>}
            </div>

            <div className="oa-field">
              <label className="oa-checkbox-label">
                <input type="checkbox" checked={form.isDefault}
                  onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                设为默认地址
              </label>
            </div>

            <div className="oa-modal-actions">
              <button className="oa-cancel" onClick={() => setShowModal(false)}>取消</button>
              <button className="oa-save" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .oa-page { }
        .oa-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .oa-back { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text); transition: all 0.2s; }
        .oa-back:hover { background: var(--color-bg); }
        .oa-title { flex: 1; font-size: 18px; font-weight: 700; margin: 0; }
        .oa-add-btn { display: flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: var(--radius-md); background: var(--color-primary); color: #fff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.25s; }
        .oa-add-btn:hover { opacity: 0.9; }

        .oa-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--color-text-muted); }
        .oa-empty p { margin: 0; font-size: 14px; }
        .oa-empty-btn { padding: 10px 24px; border-radius: var(--radius-md); background: var(--color-primary); color: #fff; font-weight: 600; border: none; cursor: pointer; }

        .oa-list { display: flex; flex-direction: column; gap: 12px; }
        .oa-card { position: relative; padding: 16px; border-radius: var(--radius-md); background: #fff; border: 1px solid var(--color-border); transition: all 0.25s; }
        .oa-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .oa-card.default { border-color: var(--color-primary); background: linear-gradient(135deg, rgba(255,125,90,0.03), transparent); }
        .oa-default-badge { position: absolute; top: -1px; right: 16px; padding: 2px 10px; border-radius: 0 0 6px 6px; background: var(--color-primary); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 3px; }
        .oa-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .oa-card-user { display: flex; align-items: center; gap: 8px; }
        .oa-card-name { font-size: 15px; font-weight: 700; }
        .oa-card-phone { font-size: 13px; color: var(--color-text-muted); }
        .oa-card-actions { display: flex; gap: 4px; }
        .oa-action-btn { width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); transition: all 0.2s; }
        .oa-action-btn:hover { background: var(--color-bg); color: var(--color-primary); }
        .oa-action-btn.danger:hover { background: #FFF0F0; color: #FF6B6B; }
        .oa-card-address { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--color-text); margin-bottom: 4px; }
        .oa-addr-icon { flex-shrink: 0; color: var(--color-primary); }
        .oa-card-detail { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; padding-left: 20px; }
        .oa-card-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }

        .oa-overlay { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .oa-modal { width: 100%; max-width: 420px; background: #fff; border-radius: var(--radius-lg); padding: 24px; max-height: 90vh; overflow-y: auto; }
        .oa-modal-title { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
        .oa-field { margin-bottom: 16px; }
        .oa-field label { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px; }
        .oa-field input[type="text"], .oa-field input[type="tel"] { width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .oa-field input:focus { border-color: var(--color-primary); }
        .oa-err { display: block; font-size: 11px; color: var(--color-error); margin-top: 4px; }
        .oa-tag-select { display: flex; gap: 8px; }
        .oa-tag-option { display: flex; align-items: center; gap: 4px; padding: 8px 14px; border-radius: var(--radius-md); border: 1.5px solid var(--color-border); font-size: 13px; font-weight: 600; color: var(--color-text-muted); background: #fff; cursor: pointer; transition: all 0.2s; }
        .oa-tag-option:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .oa-checkbox-label { display: flex !important; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--color-text) !important; }
        .oa-checkbox-label input { width: 16px; height: 16px; }
        .oa-modal-actions { display: flex; gap: 12px; margin-top: 20px; }
        .oa-cancel, .oa-save { flex: 1; padding: 12px; border-radius: var(--radius-md); font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s; border: none; }
        .oa-cancel { background: var(--color-bg); color: var(--color-text-secondary); }
        .oa-cancel:hover { background: #e5e5e5; }
        .oa-save { background: var(--color-primary); color: #fff; }
        .oa-save:hover { opacity: 0.9; }
      `}</style>
    </div>
  )
}
