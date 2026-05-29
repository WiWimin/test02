import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Phone, MapPin, Star, Award, Shield, Upload, Edit3, Check } from 'lucide-react'
import { api } from '../../utils/api'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', wechat: '' })

  useEffect(() => {
    api.get<any>('/auth/me').then(u => { setUser(u); setForm({ name: u.name || '', bio: u.sitter_profile?.bio || '', wechat: u.sitter_profile?.wechat || '' }) }).catch(() => {})
  }, [])

  const handleSave = async () => {
    try { await api.put('/sitter/profile', form); setUser({ ...user, name: form.name, sitter_profile: { ...user?.sitter_profile, bio: form.bio, wechat: form.wechat } }); setEditing(false) } catch {}
  }

  if (!user) return <div className="sp-page" />
  const profile = user.sitter_profile || {}
  const level = profile.level || 1
  const levelLabel = { 1: '初级服务者', 2: '银牌服务者', 3: '金牌服务者' }[level as keyof typeof levelLabel] || '初级服务者'

  return (
    <div className="spf-page">
      <div className="spf-header">
        <div className="spf-avatar-section">
          <div className="spf-avatar">{user.avatar || '🐾'}</div>
          <h2>{user.name}</h2>
          <span className="spf-level-badge"><Award size={12} /> {levelLabel}</span>
        </div>
        <div className="spf-stats">
          <div className="spf-stat"><Star size={14} fill="#FFD93D" color="#FFD93D" /> {profile.rating || 0}</div>
          <div className="spf-stat"><Shield size={14} /> {profile.total_orders || 0}单</div>
        </div>
      </div>

      <div className="spf-section">
        <div className="spf-section-title">基本信息</div>
        <div className="spf-info-list">
          <div className="spf-info-item"><span className="spf-info-label">手机号</span><span className="spf-info-value">{user.phone?.replace(/(\d{3})\d{4}(\d{4})/, '****') || ''}</span></div>
          <div className="spf-info-item"><span className="spf-info-label">微信号</span><span className="spf-info-value">{profile.wechat || '未绑定'}</span></div>
          <div className="spf-info-item"><span className="spf-info-label">个人简介</span><span className="spf-info-value">{profile.bio || '暂无简介'}</span></div>
        </div>
        <button className="spf-edit-btn" onClick={() => setEditing(true)}><Edit3 size={14} /> 编辑资料</button>
      </div>

      <div className="spf-section">
        <div className="spf-section-title">资质认证</div>
        <div className="spf-cert-list">
          <div className="spf-cert-item verified"><Shield size={14} /> <span>身份证认证</span><Check size={14} /></div>
          <div className="spf-cert-item verified"><Shield size={14} /> <span>宠物护理培训</span><Check size={14} /></div>
          <div className="spf-cert-item"><Shield size={14} /> <span>急救证书</span><button className="spf-cert-upload"><Upload size={12} /> 上传</button></div>
        </div>
      </div>

      <div className="spf-section">
        <div className="spf-section-title">服务信息</div>
        <div className="spf-info-item"><span className="spf-info-label">服务区域</span><span className="spf-info-value">{(profile.areas || []).length > 0 ? profile.areas.map((a: any) => a.area).join('、') : '未设置'}</span></div>
        <div className="spf-info-item"><span className="spf-info-label">最大距离</span><span className="spf-info-value">{profile.max_distance || 5}km</span></div>
        <div className="spf-info-item"><span className="spf-info-label">工作时间</span><span className="spf-info-value">{profile.workday_start || '09:00'}-{profile.workday_end || '20:00'}</span></div>
      </div>

      {editing && (
        <div className="spf-modal-overlay" onClick={() => setEditing(false)}>
          <div className="spf-modal" onClick={e => e.stopPropagation()}>
            <h3>编辑资料</h3>
            <div className="spf-modal-field"><label>姓名</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="spf-modal-field"><label>个人简介</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            <div className="spf-modal-field"><label>微信号</label><input value={form.wechat} onChange={e => setForm({ ...form, wechat: e.target.value })} /></div>
            <div className="spf-modal-actions"><button className="spf-btn spf-btn-cancel" onClick={() => setEditing(false)}>取消</button><button className="spf-btn spf-btn-save" onClick={handleSave}>保存</button></div>
          </div>
        </div>
      )}

      <style>{'.spf-page { display: flex; flex-direction: column; gap: 12px; } .spf-header { background: linear-gradient(135deg, #FF7D5A, #FF9F7A); border-radius: 16px; padding: 24px 20px; color: #fff; text-align: center; } .spf-avatar-section { display: flex; flex-direction: column; align-items: center; gap: 8px; } .spf-avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 28px; } .spf-avatar-section h2 { font-size: 18px; font-weight: 700; margin: 0; } .spf-level-badge { display: flex; align-items: center; gap: 4px; padding: 3px 12px; border-radius: 100px; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 600; } .spf-stats { display: flex; justify-content: center; gap: 20px; margin-top: 12px; } .spf-stat { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; } .spf-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .spf-section-title { font-size: 14px; font-weight: 700; color: #1A1A2E; margin-bottom: 12px; } .spf-info-list { display: flex; flex-direction: column; gap: 10px; } .spf-info-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; } .spf-info-label { color: #8E8EA0; } .spf-info-value { color: #1A1A2E; font-weight: 500; } .spf-edit-btn { display: flex; align-items: center; gap: 4px; margin-top: 12px; font-size: 12px; color: #FF7D5A; cursor: pointer; font-weight: 600; } .spf-cert-list { display: flex; flex-direction: column; gap: 8px; } .spf-cert-item { display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 10px; background: #F8F9FB; font-size: 13px; color: #5A5A7A; } .spf-cert-item.verified { color: #45B7A0; } .spf-cert-upload { margin-left: auto; display: flex; align-items: center; gap: 4px; font-size: 11px; color: #4A90D9; cursor: pointer; } .spf-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; } .spf-modal { background: #fff; border-radius: 16px; padding: 24px; width: 100%; max-width: 400px; } .spf-modal h3 { font-size: 17px; font-weight: 700; color: #1A1A2E; margin: 0 0 16px; } .spf-modal-field { margin-bottom: 14px; } .spf-modal-field label { display: block; font-size: 12px; color: #8E8EA0; margin-bottom: 4px; } .spf-modal-field input, .spf-modal-field textarea { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #EEEEF2; font-size: 13px; outline: none; box-sizing: border-box; } .spf-modal-field input:focus, .spf-modal-field textarea:focus { border-color: #FF7D5A; } .spf-modal-actions { display: flex; gap: 10px; margin-top: 20px; } .spf-btn { flex: 1; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; cursor: pointer; } .spf-btn-cancel { background: #F5F6FA; color: #8E8EA0; } .spf-btn-save { background: #FF7D5A; color: #fff; }'}</style>
    </div>
  )
}
