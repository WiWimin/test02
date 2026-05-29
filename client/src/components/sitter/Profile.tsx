import { useState, useEffect } from 'react'
import { Camera, CheckCircle, Clock, Upload } from 'lucide-react'
import { api } from '../../utils/api'

const certifications = [
  { name: '身份证实名认证', status: 'verified', date: '2025-03-15' },
  { name: '宠物护理培训证书', status: 'verified', date: '2025-06-20' },
  { name: '动物急救证', status: 'missing' },
  { name: '无犯罪记录证明', status: 'missing' },
]

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    api.get('/auth/me').then((data: any) => {
      setUser(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="pf-page">
      <div className="pf-avatar-section">
        <div className="pf-avatar-wrap">
          <span className="pf-avatar">👩</span>
          <button className="pf-avatar-edit"><Camera size={14} /></button>
        </div>
        <h2>张阿姨</h2>
        <div className="pf-badges">
          <span className="pf-badge">🏅 金牌服务者</span>
          <span className="pf-badge">⭐ 4.9</span>
          <span className="pf-badge">📦 287单</span>
        </div>
      </div>

      <div className="pf-card">
        <div className="pf-card-hdr">
          <h3>基本信息</h3>
          <button className="pf-edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? '保存' : '编辑'}
          </button>
        </div>
        <div className="pf-info-list">
          <div className="pf-info-row">
            <span className="pf-info-label">姓名</span>
            <span className="pf-info-value">张阿姨</span>
          </div>
          <div className="pf-info-row">
            <span className="pf-info-label">手机</span>
            <span className="pf-info-value">138****8888</span>
          </div>
          <div className="pf-info-row">
            <span className="pf-info-label">微信</span>
            <span className="pf-info-value">zhangayi_2025</span>
          </div>
          <div className="pf-info-row">
            <span className="pf-info-label">简介</span>
            <span className="pf-info-value">从事宠物服务3年，家里养了两只猫，有丰富的宠物护理经验</span>
          </div>
        </div>
      </div>

      <div className="pf-card">
        <div className="pf-card-hdr"><h3>资质认证</h3></div>
        <div className="pf-cert-list">
          {certifications.map(cert => (
            <div key={cert.name} className={`pf-cert-item ${cert.status}`}>
              <div className="pf-cert-left">
                {cert.status === 'verified' ? (
                  <CheckCircle size={18} color="#45B7A0" />
                ) : (
                  <Clock size={18} color="#D0D0D8" />
                )}
                <span className="pf-cert-name">{cert.name}</span>
              </div>
              {cert.status === 'verified' ? (
                <span className="pf-cert-date">{cert.date} ✓</span>
              ) : (
                <button className="pf-cert-upload" onClick={() => alert('上传文件')}>
                  <Upload size={12} /> 上传
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pf-card">
        <div className="pf-card-hdr"><h3>服务区域</h3></div>
        <div className="pf-card-body">
          <div className="pf-areas">
            {['望京', '三元桥', '亮马桥', '国贸'].map(area => (
              <span key={area} className="pf-area-tag">{area}</span>
            ))}
          </div>
          <div className="pf-area-info">
            <span>最大服务距离：5km</span>
            <button className="pf-edit-link" onClick={() => alert('编辑服务区域')}>✏️ 编辑</button>
          </div>
        </div>
      </div>

      <style>{`
        .pf-page { max-width: 600px; margin: 0 auto; }
        .pf-avatar-section { text-align: center; padding: 24px 0; }
        .pf-avatar-wrap { position: relative; display: inline-block; }
        .pf-avatar { font-size: 64px; display: block; }
        .pf-avatar-edit { position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; cursor: pointer; }
        .pf-avatar-section h2 { font-size: 20px; font-weight: 800; color: var(--color-text); margin: 12px 0 8px; }
        .pf-badges { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .pf-badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; background: var(--color-bg-alt); color: var(--color-text); }
        .pf-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; margin-bottom: 14px; }
        .pf-card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .pf-card-hdr h3 { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
        .pf-edit-btn { padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: var(--color-primary); border: 1px solid var(--color-primary); background: transparent; cursor: pointer; transition: all 0.25s; }
        .pf-edit-btn:hover { background: var(--color-primary-light); }
        .pf-info-list { display: flex; flex-direction: column; gap: 12px; }
        .pf-info-row { display: flex; align-items: flex-start; gap: 12px; }
        .pf-info-label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); min-width: 48px; flex-shrink: 0; }
        .pf-info-value { font-size: 13px; color: var(--color-text); line-height: 1.5; }
        .pf-cert-list { display: flex; flex-direction: column; gap: 10px; }
        .pf-cert-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
        .pf-cert-item:last-child { border-bottom: none; }
        .pf-cert-left { display: flex; align-items: center; gap: 10px; }
        .pf-cert-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .pf-cert-item.missing .pf-cert-name { color: var(--color-text-muted); }
        .pf-cert-date { font-size: 12px; color: var(--color-secondary); font-weight: 600; }
        .pf-cert-upload { display: flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: var(--color-primary); border: 1px dashed var(--color-primary); background: transparent; cursor: pointer; transition: all 0.25s; }
        .pf-cert-upload:hover { background: var(--color-primary-light); }
        .pf-areas { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
        .pf-area-tag { padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: var(--color-primary-light); color: var(--color-primary); }
        .pf-area-info { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--color-text-muted); }
        .pf-edit-link { font-size: 12px; color: var(--color-primary); font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  )
}
