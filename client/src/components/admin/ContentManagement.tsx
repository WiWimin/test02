import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Eye, Image as ImageIcon, FileText, HelpCircle, Clock } from 'lucide-react'
import { api } from '../../utils/api'


const categoryColors: Record<string, string> = {
  '预约': '#3B82F6',
  '退款': '#FF6B6B',
  '结算': '#45B7A0',
  '保障': '#9B59B6',
  '客服': '#FF7D5A',
}

export default function ContentManagement() {
  const [tab, setTab] = useState<'banners' | 'announcements' | 'faq'>('banners')
  const [banners, setBanners] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  useEffect(() => {
    api.get<any[]>('/admin/banners').then(d => setBanners(d || [])).catch(() => {})
    api.get<any[]>('/admin/announcements').then(d => setAnnouncements(d || [])).catch(() => {})
    api.get<any[]>('/admin/faqs').then(d => setFaqs(d || [])).catch(() => {})
  }, [])

  const tabs = [
    { key: 'banners', label: 'Banner管理', icon: ImageIcon, count: banners.length },
    { key: 'announcements', label: '公告管理', icon: FileText, count: announcements.length },
    { key: 'faq', label: '帮助中心', icon: HelpCircle, count: faqs.length },
  ] as const

  return (
    <div className="cm-page">
      <div className="cm-page-hdr">
        <div><h1>内容管理</h1><p className="cm-subtitle">管理首页Banner、系统公告和帮助中心FAQ</p></div>
        <button className="cm-add-btn" onClick={() => alert(`新建${tab === 'banners' ? 'Banner' : tab === 'announcements' ? '公告' : 'FAQ'}`)}>
          <Plus size={16} /> 新建{tab === 'banners' ? 'Banner' : tab === 'announcements' ? '公告' : 'FAQ'}
        </button>
      </div>

      <div className="cm-tabs">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} className={`cm-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <Icon size={16} />
              <span>{t.label}</span>
              <span className="cm-tab-count">{t.count}</span>
            </button>
          )
        })}
      </div>

      {tab === 'banners' && (
        <div className="cm-section">
          <div className="cm-banner-grid">
            {banners.map(b => (
              <div key={b.id} className={`cm-banner-card ${b.status === 'inactive' ? 'inactive' : ''}`}>
                <div className="cm-banner-preview"><span className="cm-banner-emoji">{b.image}</span></div>
                <div className="cm-banner-body">
                  <h4>{b.title}</h4>
                  <div className="cm-banner-meta">
                    <span className="cm-banner-link">{b.link}</span>
                    <span className={`cm-status-tag ${b.status}`}>{b.status === 'active' ? '启用' : '停用'}</span>
                  </div>
                  <div className="cm-banner-stats">
                    <span><Eye size={12} /> 点击 {b.clicks}</span>
                    <span><Clock size={12} /> 排序 {b.sort}</span>
                  </div>
                </div>
                <div className="cm-banner-actions">
                  <button className="cm-icon-btn"><Edit3 size={14} /></button>
                  <button className="cm-icon-btn" onClick={async () => { await api.delete('/admin/banners/' + b.id); setBanners(prev => prev.filter(x => x.id !== b.id)) }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="cm-section">
          {announcements.map(a => (
            <div key={a.id} className={`cm-announce-card ${a.status === 'draft' ? 'draft' : ''}`}>
              <div className="cm-ann-left">
                {a.pinned && <span className="cm-pin-badge">📌 置顶</span>}
                <div className="cm-ann-body">
                  <h4 className="cm-ann-title">{a.title}</h4>
                  <div className="cm-ann-meta">
                    <span>作者: {a.author}</span>
                    <span className="cm-meta-dot" />
                    <span>发布: {a.date}</span>
                    <span className="cm-meta-dot" />
                    <span><Eye size={12} /> {a.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="cm-ann-right">
                <span className={`cm-status-tag ${a.status}`}>{a.status === 'published' ? '已发布' : '草稿'}</span>
                <div className="cm-ann-actions">
                  <button className="cm-icon-btn"><Edit3 size={14} /></button>
                  <button className="cm-icon-btn"><Eye size={14} /></button>
                  <button className="cm-icon-btn"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'faq' && (
        <div className="cm-section">
          <div className="cm-faq-grid">
            {faqs.map(f => (
              <div key={f.id} className={`cm-faq-card ${f.status === 'draft' ? 'draft' : ''}`}>
                <div className="cm-faq-cat" style={{ background: `${categoryColors[f.category]}15`, color: categoryColors[f.category] }}>
                  <HelpCircle size={13} /> {f.category}
                </div>
                <h4 className="cm-faq-q">{f.question}</h4>
                <div className="cm-faq-footer">
                  <span className="cm-sort-badge">排序 {f.sort}</span>
                  <span className={`cm-status-tag ${f.status}`}>{f.status === 'published' ? '已发布' : '草稿'}</span>
                </div>
                <div className="cm-faq-actions">
                  <button className="cm-icon-btn"><Edit3 size={13} /></button>
                  <button className="cm-icon-btn"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .cm-page { font-size: 14px; }
        .cm-page-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .cm-page-hdr h1 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0; }
        .cm-subtitle { font-size: 13px; color: #9E9EB8; margin-top: 4px; }
        .cm-add-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; background: var(--color-primary); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .cm-add-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .cm-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .cm-tab { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #5A5A7A; background: #F5F5F7; transition: all 0.25s; cursor: pointer; }
        .cm-tab.active { background: var(--color-primary); color: #fff; box-shadow: 0 4px 12px rgba(255,125,90,0.2); }
        .cm-tab:hover:not(.active) { background: #EEEFF2; }
        .cm-tab-count { padding: 0 7px; border-radius: 100px; font-size: 11px; background: rgba(0,0,0,0.08); line-height: 18px; font-weight: 700; }
        .cm-tab.active .cm-tab-count { background: rgba(255,255,255,0.2); }

        .cm-section { }

        /* Banners */
        .cm-banner-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
        .cm-banner-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; padding: 16px; display: flex; gap: 14px; transition: all 0.3s ease; }
        .cm-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.04); transform: translateY(-1px); }
        .cm-banner-card.inactive { opacity: 0.7; background: #FAFBFC; }
        .cm-banner-preview { width: 80px; height: 56px; border-radius: 10px; background: linear-gradient(135deg, #F8F9FB, #EEEFF2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 28px; }
        .cm-banner-emoji { line-height: 1; }
        .cm-banner-body { flex: 1; min-width: 0; }
        .cm-banner-body h4 { font-size: 14px; font-weight: 700; margin: 0 0 6px; color: var(--color-text); }
        .cm-banner-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
        .cm-banner-link { font-size: 11px; color: #9E9EB8; font-family: monospace; }
        .cm-banner-stats { display: flex; gap: 12px; font-size: 11px; color: #B0B0C0; }
        .cm-banner-stats span { display: flex; align-items: center; gap: 3px; }
        .cm-banner-actions { display: flex; flex-direction: column; gap: 4px; }

        /* Announcements */
        .cm-announce-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; background: #fff; border-radius: 12px; border: 1px solid #E8E8EC; margin-bottom: 8px; transition: all 0.25s; }
        .cm-announce-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .cm-announce-card.draft { background: #FAFBFC; opacity: 0.8; }
        .cm-ann-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .cm-pin-badge { font-size: 12px; font-weight: 600; color: #D48806; white-space: nowrap; }
        .cm-ann-body { min-width: 0; }
        .cm-ann-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--color-text); }
        .cm-ann-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #9E9EB8; flex-wrap: wrap; }
        .cm-ann-meta span { display: flex; align-items: center; gap: 3px; }
        .cm-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #D0D0D8; }
        .cm-ann-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .cm-ann-actions { display: flex; gap: 4px; }

        /* FAQ */
        .cm-faq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        .cm-faq-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; padding: 16px; transition: all 0.3s ease; position: relative; }
        .cm-faq-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.04); transform: translateY(-1px); }
        .cm-faq-card.draft { opacity: 0.7; background: #FAFBFC; }
        .cm-faq-cat { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-bottom: 8px; }
        .cm-faq-q { font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 12px; line-height: 1.4; }
        .cm-faq-footer { display: flex; justify-content: space-between; align-items: center; }
        .cm-sort-badge { font-size: 11px; color: #9E9EB8; }
        .cm-faq-actions { position: absolute; top: 12px; right: 12px; display: flex; gap: 2px; opacity: 0; transition: opacity 0.25s; }
        .cm-faq-card:hover .cm-faq-actions { opacity: 1; }

        /* Shared */
        .cm-icon-btn { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #B0B0C0; transition: all 0.2s; cursor: pointer; }
        .cm-icon-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .cm-status-tag { padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; display: inline-block; }
        .cm-status-tag.active, .cm-status-tag.published { background: linear-gradient(135deg, #E8F8F4, #D4F5EC); color: #2D9B7A; }
        .cm-status-tag.inactive, .cm-status-tag.draft { background: linear-gradient(135deg, #F5F5F7, #EEEFF2); color: #8E8EA0; }

        @media (max-width: 768px) {
          .cm-announce-card { flex-direction: column; align-items: flex-start; }
          .cm-ann-right { width: 100%; justify-content: space-between; }
          .cm-banner-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
