import { useState } from 'react'
import { Plus, PawPrint, PenLine, Trash2, X, ChevronRight, AlertCircle } from 'lucide-react'

interface Pet {
  id: number
  name: string
  type: 'cat' | 'dog' | 'other'
  breed: string
  age: string
  weight: string
  gender: 'male' | 'female'
  avatar: string
  color: string
}

const defaultPets: Pet[] = [
  { id: 1, name: '咪咪', type: 'cat', breed: '英短蓝猫', age: '2岁3个月', weight: '4.5kg', gender: 'female', avatar: '🐱', color: '#FFE0D5' },
  { id: 2, name: '旺财', type: 'dog', breed: '柯基', age: '1岁', weight: '12kg', gender: 'male', avatar: '🐶', color: '#D5F0EB' },
]

const petTypeIcons = { cat: '🐱', dog: '🐶', other: '🐰' }
const petTypeLabels = { cat: '猫咪', dog: '狗狗', other: '其他' }

export default function OwnerPets() {
  const [pets, setPets] = useState<Pet[]>(defaultPets)
  const [showForm, setShowForm] = useState(false)
  const [editPet, setEditPet] = useState<Pet | null>(null)
  const [form, setForm] = useState({ name: '', type: 'cat' as Pet['type'], breed: '', age: '', weight: '', gender: 'male' as Pet['gender'] })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const openAdd = () => {
    setEditPet(null)
    setForm({ name: '', type: 'cat', breed: '', age: '', weight: '', gender: 'male' })
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (pet: Pet) => {
    setEditPet(pet)
    setForm({ name: pet.name, type: pet.type, breed: pet.breed, age: pet.age, weight: pet.weight, gender: pet.gender })
    setErrors({})
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditPet(null); setErrors({}) }

  const handleSave = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = '请输入宠物昵称'
    if (!form.breed.trim()) errs.breed = '请输入品种'
    if (!form.age.trim()) errs.age = '请输入年龄'
    if (!form.weight.trim()) errs.weight = '请输入体重'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (editPet) {
      setPets(prev => prev.map(p => p.id === editPet.id ? { ...p, ...form, avatar: petTypeIcons[form.type], color: form.type === 'cat' ? '#FFE0D5' : '#D5F0EB' } : p))
      showToast('修改成功', 'success')
    } else {
      const newPet: Pet = { id: Date.now(), ...form, avatar: petTypeIcons[form.type], color: form.type === 'cat' ? '#FFE0D5' : '#D5F0EB' }
      setPets(prev => [...prev, newPet])
      showToast('添加成功', 'success')
    }
    closeForm()
  }

  const handleDelete = (id: number) => {
    setPets(prev => prev.filter(p => p.id !== id))
    showToast('已删除宠物', 'success')
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="op-page">
      <div className="op-header">
        <h2>我的宠物</h2>
        <button className="op-add-btn" onClick={openAdd}>
          <Plus size={16} /> 添加宠物
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="op-empty">
          <PawPrint size={48} />
          <p>还没有添加宠物</p>
          <button className="op-add-btn" onClick={openAdd}>立即添加</button>
        </div>
      ) : (
        <div className="op-list">
          {pets.map(pet => (
            <div key={pet.id} className="op-card">
              <div className="op-card-avatar" style={{ background: pet.color }}>{pet.avatar}</div>
              <div className="op-card-info">
                <div className="op-card-top">
                  <span className="op-card-name">{pet.name}</span>
                  <span className="op-card-type">{petTypeLabels[pet.type]}</span>
                  <span className={`op-card-gender ${pet.gender}`}>{pet.gender === 'male' ? '♂' : '♀'}</span>
                </div>
                <div className="op-card-details">
                  <span>{pet.breed}</span>
                  <span>·</span>
                  <span>{pet.age}</span>
                  <span>·</span>
                  <span>{pet.weight}</span>
                </div>
              </div>
              <div className="op-card-actions">
                <button className="op-card-btn" onClick={() => openEdit(pet)}><PenLine size={15} /></button>
                <button className="op-card-btn danger" onClick={() => handleDelete(pet.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="op-overlay" onClick={closeForm}>
          <div className="op-modal" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h3>{editPet ? '编辑宠物' : '添加宠物'}</h3>
              <button className="op-modal-close" onClick={closeForm}><X size={20} /></button>
            </div>
            <div className="op-modal-body">
              <div className="op-field">
                <label>宠物昵称</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="如：咪咪" />
                {errors.name && <span className="op-field-error"><AlertCircle size={12} /> {errors.name}</span>}
              </div>
              <div className="op-field">
                <label>宠物类型</label>
                <div className="op-type-select">
                  {(['cat', 'dog', 'other'] as const).map(t => (
                    <button key={t} className={`op-type-btn ${form.type === t ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, type: t }))}>
                      {petTypeIcons[t]} {petTypeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="op-row">
                <div className="op-field">
                  <label>品种</label>
                  <input value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="如：英短" />
                  {errors.breed && <span className="op-field-error"><AlertCircle size={12} /> {errors.breed}</span>}
                </div>
                <div className="op-field">
                  <label>性别</label>
                  <div className="op-gender-select">
                    <button className={`op-gender-btn ${form.gender === 'male' ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, gender: 'male' }))}>♂ 男孩</button>
                    <button className={`op-gender-btn ${form.gender === 'female' ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, gender: 'female' }))}>♀ 女孩</button>
                  </div>
                </div>
              </div>
              <div className="op-row">
                <div className="op-field">
                  <label>年龄</label>
                  <input value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="如：2岁" />
                  {errors.age && <span className="op-field-error"><AlertCircle size={12} /> {errors.age}</span>}
                </div>
                <div className="op-field">
                  <label>体重</label>
                  <input value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="如：4.5kg" />
                  {errors.weight && <span className="op-field-error"><AlertCircle size={12} /> {errors.weight}</span>}
                </div>
              </div>
            </div>
            <div className="op-modal-footer">
              <button className="op-btn-cancel" onClick={closeForm}>取消</button>
              <button className="op-btn-save" onClick={handleSave}>{editPet ? '保存修改' : '添加宠物'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`op-toast op-toast-${toast.type}`}>{toast.msg}</div>}

      <style>{`
        .op-page { }
        .op-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .op-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
        .op-add-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 18px;
          border-radius: 100px; font-size: 13px; font-weight: 600;
          background: var(--color-primary); color: #fff; border: none; cursor: pointer;
          transition: all 0.25s;
        }
        .op-add-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        /* Empty */
        .op-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--color-text-muted); }
        .op-empty p { margin: 0; font-size: 14px; }

        /* List */
        .op-list { display: flex; flex-direction: column; gap: 12px; }
        .op-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px; border-radius: var(--radius-md);
          background: #fff; border: 1px solid var(--color-border);
          transition: all 0.25s;
        }
        .op-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .op-card-avatar { width: 48px; height: 48px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .op-card-info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .op-card-top { display: flex; align-items: center; gap: 8px; }
        .op-card-name { font-size: 15px; font-weight: 700; color: var(--color-text); }
        .op-card-type { font-size: 11px; padding: 1px 8px; border-radius: 100px; background: var(--color-bg); color: var(--color-text-secondary); }
        .op-card-gender { font-size: 13px; }
        .op-card-gender.male { color: #3B82F6; }
        .op-card-gender.female { color: #EC4899; }
        .op-card-details { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); }
        .op-card-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .op-card-btn {
          width: 32px; height: 32px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-muted); transition: all 0.2s;
        }
        .op-card-btn:hover { background: var(--color-bg); color: var(--color-text); }
        .op-card-btn.danger:hover { background: #FFF0F0; color: #FF6B6B; }

        /* Modal */
        .op-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: fadeIn 0.2s ease;
        }
        .op-modal {
          background: #fff; border-radius: var(--radius-lg);
          width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        .op-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .op-modal-header h3 { font-size: 18px; font-weight: 700; margin: 0; }
        .op-modal-close { width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .op-modal-close:hover { background: var(--color-bg); }
        .op-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .op-modal-footer { display: flex; gap: 10px; padding: 0 24px 20px; }
        .op-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .op-field label { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .op-field input {
          padding: 10px 14px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--color-border); font-size: 14px;
          outline: none; transition: border-color 0.2s;
        }
        .op-field input:focus { border-color: var(--color-primary); }
        .op-field-error { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-error); }
        .op-row { display: flex; gap: 12px; }
        .op-type-select, .op-gender-select { display: flex; gap: 8px; }
        .op-type-btn, .op-gender-btn {
          flex: 1; padding: 8px 12px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--color-border); font-size: 13px; font-weight: 500;
          text-align: center; cursor: pointer; transition: all 0.2s;
        }
        .op-type-btn.active, .op-gender-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,125,90,0.06); }
        .op-btn-cancel {
          flex: 1; padding: 10px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--color-border); font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .op-btn-save {
          flex: 2; padding: 10px; border-radius: var(--radius-sm);
          border: none; font-size: 14px; font-weight: 600;
          background: var(--color-primary); color: #fff; cursor: pointer;
          transition: all 0.2s;
        }
        .op-btn-save:hover { opacity: 0.9; }

        /* Toast */
        .op-toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; padding: 12px 24px; border-radius: var(--radius-md);
          font-size: 14px; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: fadeInUp 0.35s ease;
        }
        .op-toast-success { background: #E8F8F4; color: #3A9E89; border: 1px solid #45B7A0; }
        .op-toast-error { background: #FFF0F0; color: #E86A4A; border: 1px solid #FF6B6B; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }

        @media (max-width: 480px) {
          .op-row { flex-direction: column; }
          .op-modal { max-width: 100%; border-radius: var(--radius-md); margin: 0 12px; }
        }
      `}</style>
    </div>
  )
}
