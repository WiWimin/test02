import { useState, useEffect } from 'react'
import { Search, Check, X, Eye, Star, Award, MapPin, Phone, BadgeCheck, AlertTriangle } from 'lucide-react'
import { api } from '../../utils/api'

const badgeColors: Record<string, string> = {
  '金牌服务者': 'linear-gradient(135deg, #FFD93D, #FFC107)',
  '五星服务者': 'linear-gradient(135deg, #FF8A65, #FF6D00)',
  '四星服务者': 'linear-gradient(135deg, #81C784, #4CAF50)',
}

function SitterDetailModal({ sitter, onClose }: { sitter: any; onClose: () => void }) {
  return (
    <div className="sm-modal-overlay" onClick={onClose}>
      <div className="sm-modal" onClick={e => e.stopPropagation()}>
        <div className="sm-modal-bg" />
        <button className="sm-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="sm-modal-body">
          <div className="sm-profile">
            <div className="sm-avatar-ring"><span className="sm-avatar">{sitter.avatar}</span></div>
            <div className="sm-profile-info">
              <h2>{sitter.name}</h2>
              <span className="sm-profile-id">{sitter.id}</span>
              {sitter.badge && <span className="sm-badge-tag" style={{ background: badgeColors[sitter.badge] || '#E8E8EC', color: '#fff' }}><Award size={12} /> {sitter.badge}</span>}
              {sitter.status === 'pending' && <span className="sm-profile-status pending">待审核</span>}
            </div>
          </div>
          <div className="sm-detail-grid">
            <div className="sm-detail-item"><Phone size={14} /><span><label>手机号</label><strong>{sitter.phone}</strong></span></div>
            <div className="sm-detail-item"><MapPin size={14} /><span><label>所在城市</label><strong>{sitter.city}</strong></span></div>
            <div className="sm-detail-item"><Star size={14} /><span><label>评分</label><strong>{sitter.rating > 0 ? `${sitter.rating} ⭐` : '暂无评分'}</strong></span></div>
            <div className="sm-detail-item"><Award size={14} /><span><label>等级</label><strong>Lv{sitter.level} {sitter.badge}</strong></span></div>
            <div className="sm-detail-item" style={{ gridColumn: '1 / -1' }}><BadgeCheck size={14} /><span><label>资质证书</label><strong>{sitter.certifications.length > 0 ? sitter.certifications.join('、') : '未上传'}</strong></span></div>
          </div>
          <div className="sm-intro-card">
            <p className="sm-intro-label">个人介绍</p>
            <p className="sm-intro-text">{sitter.intro}</p>
          </div>
          <div className="sm-stats-row">
            <div className="sm-stat-item"><span className="sm-stat-num">{sitter.orders}</span><span className="sm-stat-lbl">完成订单</span></div>
            <div className="sm-stat-divider" />
            <div className="sm-stat-item"><span className="sm-stat-num">{sitter.satisfaction}</span><span className="sm-stat-lbl">好评率</span></div>
            <div className="sm-stat-divider" />
            <div className="sm-stat-item"><span className="sm-stat-num">{sitter.joinDate}</span><span className="sm-stat-lbl">加入时间</span></div>
          </div>
          {sitter.pending && (
            <div className="sm-actions">
              <button className="sm-btn sm-btn-reject" onClick={async () => { await api.put('/admin/sitters/' + sitter.id + '/reject'); onClose() }}><X size={15} /> 驳回申请</button>
              <button className="sm-btn sm-btn-approve" onClick={async () => { await api.put('/admin/sitters/' + sitter.id + '/verify'); onClose() }}><Check size={15} /> 通过审核</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CertBadge({ cert }: { cert: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    '宠物护理证': { bg: '#E8F8F4', text: '#2D9B7A' },
    '无犯罪记录': { bg: '#EFF6FF', text: '#3B82F6' },
    '营养师证': { bg: '#F0EBFF', text: '#7C3AED' },
  }
  const c = colors[cert] || { bg: '#F5F5F7', text: '#5A5A7A' }
  return <span className="sm-cert-badge" style={{ background: c.bg, color: c.text }}><BadgeCheck size={11} /> {cert}</span>
}

export default function SitterManagement() {
  const [sitters, setSitters] = useState<any[]>([])
  useEffect(() => { api.get<any[]>('/admin/sitters').then(setSitters) }, [])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [page, setPage] = useState(1)

  const pending = sitters.filter(s => s.status === 'pending')
  const filtered = sitters.filter(s => {
    if (filter === 'pending' && s.status !== 'pending') return false
    if (filter === 'active' && s.status !== 'active') return false
    if (search && !s.name.includes(search) && !s.id.includes(search) && !s.phone.includes(search)) return false
    return true
  })

  const perPage = 5
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="sm-page">
      <div className="sm-page-hdr">
        <div><h1>服务者管理</h1><p className="sm-subtitle">共 {sitters.length} 位服务者 · 已通过 {sitters.filter(s => s.status === 'active').length} 位</p></div>
        <div className="sm-hdr-stats">
          <div className="sm-hdr-stat"><span className="sm-hdr-num">{sitters.length}</span><span>总计</span></div>
          <div className="sm-hdr-divider" />
          <div className="sm-hdr-stat"><span className="sm-hdr-num active">{sitters.filter(s => s.status === 'active').length}</span><span>已通过</span></div>
          <div className="sm-hdr-divider" />
          <div className="sm-hdr-stat"><span className="sm-hdr-num pending">{pending.length}</span><span>待审核</span></div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="sm-alert-card">
          <div className="sm-alert-header">
            <AlertTriangle size={18} />
            <span><strong>{pending.length} 位服务者</strong>等待审核</span>
            <span className="sm-alert-action">立即处理 →</span>
          </div>
          <div className="sm-alert-list">
            {pending.map(s => (
              <div key={s.id} className="sm-alert-item">
                <span className="sm-alert-avatar">{s.avatar}</span>
                <div className="sm-alert-info">
                  <span className="sm-alert-name">{s.name}</span>
                  <span className="sm-alert-meta">提交于 {s.joinDate} · {s.certifications.length > 0 ? s.certifications.map(c => <CertBadge key={c} cert={c} />) : <span className="sm-cert-none">未上传资质</span>}</span>
                </div>
                <button className="sm-alert-btn" onClick={() => setSelected(s)}><Eye size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sm-toolbar">
        <div className="sm-search"><Search size={16} /><input placeholder="搜索姓名、ID或手机号..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /></div>
        <div className="sm-tabs-mini">
          <button className={`sm-tab-mini ${filter === 'all' ? 'active' : ''}`} onClick={() => { setFilter('all'); setPage(1) }}>全部</button>
          <button className={`sm-tab-mini ${filter === 'active' ? 'active' : ''}`} onClick={() => { setFilter('active'); setPage(1) }}>已通过</button>
          <button className={`sm-tab-mini ${filter === 'pending' ? 'active' : ''}`} onClick={() => { setFilter('pending'); setPage(1) }}>待审核</button>
        </div>
      </div>

      <div className="sm-table-card">
        <table className="sm-table">
          <thead><tr><th>服务者</th><th>评分</th><th>完成订单</th><th>好评率</th><th>等级</th><th>资质</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={8}><div className="sm-empty"><Search size={32} /><p>未找到匹配的服务者</p></div></td></tr>
            ) : paged.map(s => (
              <tr key={s.id}>
                <td><div className="sm-td-user"><span className="sm-td-avatar">{s.avatar}</span><div><span className="sm-td-name">{s.name}</span><span className="sm-td-id">{s.id}</span></div></div></td>
                <td>{s.rating > 0 ? <span className="sm-rating"><Star size={12} fill="#FFD93D" color="#FFD93D" /> {s.rating}</span> : <span className="sm-na">暂无</span>}</td>
                <td><span className="sm-num">{s.orders}单</span></td>
                <td>{s.satisfaction}</td>
                <td><span className="sm-level-badge">Lv{s.level}</span></td>
                <td>{s.certifications.length > 0 ? <span className="sm-cert-count">{s.certifications.length}项</span> : <span className="sm-na">无</span>}</td>
                <td><span className={`sm-status-tag ${s.status}`}>{s.status === 'active' ? '正常' : '待审核'}</span></td>
                <td><div className="sm-td-actions"><button className="sm-action-btn" onClick={() => setSelected(s)} title="查看详情"><Eye size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm-pagination">
        <span className="sm-pg-info">第 {page}/{totalPages} 页 · 共 {filtered.length} 条</span>
        <div className="sm-pg-btns">
          <button className={`sm-pg-btn ${page <= 1 ? 'disabled' : ''}`} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`sm-pg-num ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className={`sm-pg-btn ${page >= totalPages ? 'disabled' : ''}`} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      </div>

      {selected && <SitterDetailModal sitter={selected} onClose={() => setSelected(null)} />}

      <style>{`
        .sm-page { font-size: 14px; }
        .sm-page-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .sm-page-hdr h1 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0; }
        .sm-subtitle { font-size: 13px; color: #9E9EB8; margin-top: 4px; }
        .sm-hdr-stats { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 10px; padding: 10px 20px; border: 1px solid #E8E8EC; }
        .sm-hdr-stat { display: flex; flex-direction: column; align-items: center; }
        .sm-hdr-num { font-size: 18px; font-weight: 800; line-height: 1.2; }
        .sm-hdr-num.active { color: #45B7A0; }
        .sm-hdr-num.pending { color: #D48806; }
        .sm-hdr-stat span:last-child { font-size: 11px; color: #9E9EB8; }
        .sm-hdr-divider { width: 1px; height: 28px; background: #E8E8EC; }

        .sm-alert-card { background: linear-gradient(135deg, #FFFBEB, #FFF8E0); border-radius: 14px; border: 1px solid #FFD93D; padding: 16px; margin-bottom: 16px; }
        .sm-alert-header { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #D48806; margin-bottom: 12px; }
        .sm-alert-action { margin-left: auto; font-size: 12px; font-weight: 600; opacity: 0.7; cursor: pointer; }
        .sm-alert-action:hover { opacity: 1; }
        .sm-alert-list { display: flex; flex-direction: column; gap: 6px; }
        .sm-alert-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.8); transition: background 0.2s; }
        .sm-alert-item:hover { background: #fff; }
        .sm-alert-avatar { font-size: 26px; line-height: 1; }
        .sm-alert-info { flex: 1; min-width: 0; }
        .sm-alert-name { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .sm-alert-meta { font-size: 11px; color: #9E9EB8; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 2px; }
        .sm-alert-btn { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #9E9EB8; transition: all 0.2s; cursor: pointer; }
        .sm-alert-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }

        .sm-cert-badge { display: inline-flex; align-items: center; gap: 3px; padding: 1px 7px; border-radius: 100px; font-size: 10px; font-weight: 600; }
        .sm-cert-none { color: #B0B0C0; font-size: 11px; }

        .sm-toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .sm-search { display: flex; align-items: center; gap: 8px; padding: 0 14px; background: #fff; border-radius: 10px; border: 1px solid #E8E8EC; flex: 1; min-width: 200px; height: 40px; color: #9E9EB8; transition: border-color 0.25s, box-shadow 0.25s; }
        .sm-search:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.08); }
        .sm-search input { border: none; outline: none; font-size: 13px; flex: 1; font-family: var(--font); background: transparent; }
        .sm-tabs-mini { display: flex; gap: 3px; background: #F5F5F7; border-radius: 8px; padding: 3px; }
        .sm-tab-mini { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #9E9EB8; transition: all 0.2s; cursor: pointer; }
        .sm-tab-mini.active { background: #fff; color: var(--color-text); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .sm-tab-mini:hover:not(.active) { color: #5A5A7A; }

        .sm-table-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
        .sm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sm-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9E9EB8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E8E8EC; background: #FAFBFC; white-space: nowrap; }
        .sm-table td { padding: 14px 16px; border-bottom: 1px solid #F3F4F6; color: var(--color-text); transition: background 0.2s; }
        .sm-table tr:last-child td { border-bottom: none; }
        .sm-table tbody tr:hover td { background: #FAFBFC; }

        .sm-td-user { display: flex; align-items: center; gap: 10px; }
        .sm-td-avatar { font-size: 28px; line-height: 1; }
        .sm-td-name { display: block; font-weight: 600; font-size: 13px; }
        .sm-td-id { font-size: 11px; color: #B0B0C0; }
        .sm-rating { display: inline-flex; align-items: center; gap: 3px; font-weight: 600; }
        .sm-na { color: #B0B0C0; font-size: 12px; }
        .sm-num { font-weight: 600; }
        .sm-level-badge { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 700; background: linear-gradient(135deg, #F0EBFF, #E4DBFF); color: #7C3AED; }
        .sm-cert-count { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; background: #E8F8F4; color: #45B7A0; }
        .sm-status-tag { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; display: inline-block; }
        .sm-status-tag.active { background: linear-gradient(135deg, #E8F8F4, #D4F5EC); color: #2D9B7A; }
        .sm-status-tag.pending { background: linear-gradient(135deg, #FFF8E0, #FFF3CC); color: #D48806; }
        .sm-td-actions { display: flex; gap: 4px; }
        .sm-action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #B0B0C0; transition: all 0.2s; cursor: pointer; }
        .sm-action-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .sm-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: #B0B0C0; gap: 8px; }
        .sm-empty p { font-size: 14px; margin: 0; }

        .sm-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 12px; }
        .sm-pg-info { font-size: 12px; color: #9E9EB8; }
        .sm-pg-btns { display: flex; gap: 4px; align-items: center; }
        .sm-pg-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #5A5A7A; border: 1px solid #E8E8EC; transition: all 0.2s; cursor: pointer; background: #fff; }
        .sm-pg-btn:hover:not(.disabled) { border-color: var(--color-primary); color: var(--color-primary); }
        .sm-pg-btn.disabled, .sm-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sm-pg-num { width: 32px; height: 32px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #5A5A7A; transition: all 0.2s; cursor: pointer; background: transparent; }
        .sm-pg-num.active { background: var(--color-primary); color: #fff; }
        .sm-pg-num:hover:not(.active) { background: #F5F5F7; }

        /* Modal */
        .sm-modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; padding: 16px; }
        .sm-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 25px 80px rgba(0,0,0,0.15); animation: expandIn 0.3s ease; position: relative; overflow: hidden; }
        .sm-modal-bg { position: absolute; top: 0; left: 0; right: 0; height: 100px; background: linear-gradient(135deg, #F0EBFF, #E4DBFF); }
        .sm-modal-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9E9EB8; background: rgba(255,255,255,0.9); z-index: 1; cursor: pointer; transition: all 0.2s; }
        .sm-modal-close:hover { background: #fff; color: var(--color-text); }
        .sm-modal-body { position: relative; padding: 24px; }
        .sm-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .sm-avatar-ring { width: 64px; height: 64px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); flex-shrink: 0; }
        .sm-avatar { font-size: 36px; line-height: 1; }
        .sm-profile-info h2 { font-size: 18px; font-weight: 700; margin: 0 0 2px; color: var(--color-text); }
        .sm-profile-id { font-size: 12px; color: #9E9EB8; display: block; margin-bottom: 4px; }
        .sm-badge-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
        .sm-profile-status.pending { display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: #FFF8E0; color: #D48806; }
        .sm-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .sm-detail-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F8F9FB; border-radius: 10px; }
        .sm-detail-item svg { color: #9E9EB8; flex-shrink: 0; }
        .sm-detail-item span { display: flex; flex-direction: column; gap: 1px; }
        .sm-detail-item label { font-size: 11px; color: #9E9EB8; }
        .sm-detail-item strong { font-size: 13px; color: var(--color-text); font-weight: 600; }
        .sm-intro-card { background: linear-gradient(135deg, #F8F9FB, #F3F4F6); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; }
        .sm-intro-label { font-size: 11px; color: #9E9EB8; margin: 0 0 4px; }
        .sm-intro-text { font-size: 13px; color: var(--color-text); margin: 0; line-height: 1.5; }
        .sm-stats-row { display: flex; align-items: center; justify-content: space-around; padding: 12px 0; background: #FAFBFC; border-radius: 10px; margin-bottom: 16px; }
        .sm-stat-item { display: flex; flex-direction: column; align-items: center; }
        .sm-stat-num { font-size: 14px; font-weight: 700; color: var(--color-text); }
        .sm-stat-lbl { font-size: 11px; color: #9E9EB8; }
        .sm-stat-divider { width: 1px; height: 30px; background: #E8E8EC; }
        .sm-actions { display: flex; gap: 10px; }
        .sm-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; flex: 1; cursor: pointer; transition: all 0.25s; }
        .sm-btn-approve { background: linear-gradient(135deg, #45B7A0, #3DA88F); color: #fff; }
        .sm-btn-approve:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(69,183,160,0.3); }
        .sm-btn-reject { border: 1px solid #FF6B6B; color: #FF6B6B; background: #fff; }
        .sm-btn-reject:hover { background: #FFF0F0; }

        @media (max-width: 768px) {
          .sm-page-hdr { flex-direction: column; }
          .sm-detail-grid { grid-template-columns: 1fr; }
          .sm-table th:nth-child(2), .sm-table td:nth-child(2),
          .sm-table th:nth-child(4), .sm-table td:nth-child(4) { display: none; }
          .sm-pagination { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 600px) {
          .sm-table th:nth-child(5), .sm-table td:nth-child(5),
          .sm-table th:nth-child(6), .sm-table td:nth-child(6) { display: none; }
        }
      `}</style>
    </div>
  )
}
