import { useState, useEffect } from 'react'
import { Search, ChevronDown, X, Star, ShieldCheck, Ban, Eye, Phone, Calendar, ShoppingBag, PawPrint, Mail, MessageCircle } from 'lucide-react'
import { api } from '../../utils/api'

const statusConfig = {
  active: { label: '正常', bg: 'linear-gradient(135deg, #E8F8F4, #D4F5EC)', color: '#2D9B7A', dot: '#45B7A0' },
  banned: { label: '已封禁', bg: 'linear-gradient(135deg, #FFF0F0, #FFE0E0)', color: '#D63031', dot: '#FF6B6B' },
  inactive: { label: '未激活', bg: 'linear-gradient(135deg, #F5F5F7, #EEEFF2)', color: '#8E8EA0', dot: '#B0B0C0' },
}

function UserDetailModal({ user, onClose }: { user: any; onClose: () => void }) {
  if (!user) return null
  const st = statusConfig[user.status as keyof typeof statusConfig]
  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={e => e.stopPropagation()}>
        <div className="um-modal-bg" />
        <button className="um-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="um-modal-body">
          <div className="um-profile">
            <div className="um-avatar-ring"><span className="um-avatar">{user.avatar}</span></div>
            <div className="um-profile-info">
              <h2>{user.name}</h2>
              <span className="um-profile-id">ID: {user.id}</span>
              <span className="um-profile-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
            </div>
          </div>
          <div className="um-detail-grid">
            <div className="um-detail-item"><Phone size={14} /><span><label>手机号</label><strong>{user.phone}</strong></span></div>
            <div className="um-detail-item"><Mail size={14} /><span><label>邮箱</label><strong>{user.email}</strong></span></div>
            <div className="um-detail-item"><ShoppingBag size={14} /><span><label>角色</label><strong>{user.role}</strong></span></div>
            <div className="um-detail-item"><PawPrint size={14} /><span><label>宠物数量</label><strong>{user.pets}只</strong></span></div>
            <div className="um-detail-item"><Calendar size={14} /><span><label>注册时间</label><strong>{user.registerDate}</strong></span></div>
            <div className="um-detail-item"><Star size={14} /><span><label>完成订单</label><strong>{user.orders}单</strong></span></div>
          </div>
          <div className="um-detail-actions">
            <button className="um-btn um-btn-primary"><MessageCircle size={15} /> 发送通知</button>
            <button className="um-btn um-btn-outline">查看订单记录</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => { api.get<any[]>('/admin/users').then(setUsers) }, [])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [page, setPage] = useState(1)

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && (roleFilter === 'owner' ? u.role !== '宠物主人' : u.role !== '服务者')) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    if (search && !u.name.includes(search) && !u.id.includes(search) && !u.phone.includes(search)) return false
    return true
  })

  const perPage = 6
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="um-page">
      <div className="um-page-hdr">
        <div><h1>用户管理</h1><p className="um-subtitle">共 {users.length} 位注册用户，其中 {users.filter(u => u.status === 'active').length} 位活跃</p></div>
        <div className="um-hdr-stats">
          <div className="um-hdr-stat"><span className="um-hdr-num">{users.length}</span><span>总用户</span></div>
          <div className="um-hdr-divider" />
          <div className="um-hdr-stat"><span className="um-hdr-num">{users.filter(u => u.role === '服务者').length}</span><span>服务者</span></div>
          <div className="um-hdr-divider" />
          <div className="um-hdr-stat"><span className="um-hdr-num">{users.filter(u => u.status === 'active').length}</span><span>活跃</span></div>
        </div>
      </div>

      <div className="um-toolbar">
        <div className="um-search"><Search size={16} /><input placeholder="搜索姓名、ID或手机号..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /></div>
        <div className="um-filters">
          <div className="um-select-wrap"><select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}><option value="all">全部角色</option><option value="owner">宠物主人</option><option value="sitter">服务者</option></select><ChevronDown size={14} /></div>
          <div className="um-select-wrap"><select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}><option value="all">全部状态</option><option value="active">正常</option><option value="banned">已封禁</option><option value="inactive">未激活</option></select><ChevronDown size={14} /></div>
        </div>
      </div>

      <div className="um-table-card">
        <table className="um-table">
          <thead><tr><th>用户</th><th>手机号</th><th>角色</th><th>状态</th><th>订单数</th><th>注册时间</th><th>操作</th></tr></thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7}><div className="um-empty"><Search size={32} /><p>未找到匹配的用户</p></div></td></tr>
            ) : paged.map(u => {
              const st = statusConfig[u.status as keyof typeof statusConfig]
              return (
                <tr key={u.id}>
                  <td><div className="um-td-user"><span className="um-td-avatar">{u.avatar}</span><div><span className="um-td-name">{u.name}</span><span className="um-td-id">{u.id}</span></div></div></td>
                  <td><span className="um-td-phone">{u.phone}</span></td>
                  <td><span className={`um-role-tag ${u.role === '服务者' ? 'sitter' : 'owner'}`}>{u.role}</span></td>
                  <td><span className="um-status-badge" style={{ background: st.bg, color: st.color }}><span className="um-status-dot" style={{ background: st.dot }} />{st.label}</span></td>
                  <td><span className="um-num">{u.orders}</span></td>
                  <td className="um-td-muted">{u.registerDate}</td>
                  <td><div className="um-td-actions"><button className="um-action-btn" onClick={() => setSelectedUser(u)} title="查看详情"><Eye size={15} /></button><button className={`um-action-btn ${u.status === 'banned' ? 'warn' : 'danger'}`} title={u.status === 'banned' ? '解封' : '封禁'} onClick={async () => { const action = u.status === 'banned' ? 'unban' : 'ban'; await api.put('/admin/users/' + u.id + '/' + action); setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: action === 'ban' ? 'banned' : 'active' } : x)) }}>{u.status === 'banned' ? <ShieldCheck size={15} /> : <Ban size={15} />}</button></div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="um-pagination">
        <span className="um-pg-info">显示 {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)}，共 {filtered.length} 条</span>
        <div className="um-pg-btns">
          <button className={`um-pg-btn ${page <= 1 ? 'disabled' : ''}`} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`um-pg-num ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className={`um-pg-btn ${page >= totalPages ? 'disabled' : ''}`} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      </div>

      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

      <style>{`
        .um-page { font-size: 14px; }
        .um-page-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .um-page-hdr h1 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0; }
        .um-subtitle { font-size: 13px; color: #9E9EB8; margin-top: 4px; }
        .um-hdr-stats { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 10px; padding: 10px 20px; border: 1px solid #E8E8EC; }
        .um-hdr-stat { display: flex; flex-direction: column; align-items: center; gap: 0; }
        .um-hdr-num { font-size: 18px; font-weight: 800; color: var(--color-text); line-height: 1.2; }
        .um-hdr-stat span:last-child { font-size: 11px; color: #9E9EB8; }
        .um-hdr-divider { width: 1px; height: 28px; background: #E8E8EC; }

        .um-toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .um-search { display: flex; align-items: center; gap: 8px; padding: 0 14px; background: #fff; border-radius: 10px; border: 1px solid #E8E8EC; flex: 1; min-width: 220px; height: 40px; color: #9E9EB8; transition: border-color 0.25s, box-shadow 0.25s; }
        .um-search:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.08); }
        .um-search input { border: none; outline: none; font-size: 13px; flex: 1; font-family: var(--font); background: transparent; }
        .um-filters { display: flex; gap: 8px; }
        .um-select-wrap { position: relative; }
        .um-select-wrap select { appearance: none; padding: 0 32px 0 14px; height: 40px; border-radius: 10px; border: 1px solid #E8E8EC; font-size: 13px; color: var(--color-text); background: #fff; font-family: var(--font); cursor: pointer; min-width: 120px; transition: border-color 0.25s; }
        .um-select-wrap select:focus { border-color: var(--color-primary); outline: none; }
        .um-select-wrap svg { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9E9EB8; pointer-events: none; }

        .um-table-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
        .um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .um-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9E9EB8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E8E8EC; background: #FAFBFC; white-space: nowrap; }
        .um-table td { padding: 14px 16px; border-bottom: 1px solid #F3F4F6; color: var(--color-text); transition: background 0.2s; }
        .um-table tr:last-child td { border-bottom: none; }
        .um-table tbody tr:hover td { background: #FAFBFC; }

        .um-td-user { display: flex; align-items: center; gap: 12px; }
        .um-td-avatar { font-size: 28px; line-height: 1; }
        .um-td-name { display: block; font-weight: 600; font-size: 13px; color: var(--color-text); }
        .um-td-id { font-size: 11px; color: #B0B0C0; }
        .um-td-phone { font-size: 12px; color: #5A5A7A; font-family: monospace; }
        .um-td-muted { color: #9E9EB8; font-size: 12px; }

        .um-role-tag { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .um-role-tag.owner { background: linear-gradient(135deg, #EFF6FF, #E0EEFF); color: #3B82F6; }
        .um-role-tag.sitter { background: linear-gradient(135deg, #F0EBFF, #E4DBFF); color: #7C3AED; }

        .um-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .um-status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .um-num { font-weight: 700; color: var(--color-text); }
        .um-td-actions { display: flex; gap: 4px; }
        .um-action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #B0B0C0; transition: all 0.2s; cursor: pointer; }
        .um-action-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .um-action-btn.danger:hover { background: #FFF0F0; color: #FF6B6B; }
        .um-action-btn.warn:hover { background: #E8F8F4; color: #45B7A0; }

        .um-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: #B0B0C0; gap: 8px; }
        .um-empty p { font-size: 14px; margin: 0; }

        .um-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 12px; }
        .um-pg-info { font-size: 12px; color: #9E9EB8; }
        .um-pg-btns { display: flex; gap: 4px; align-items: center; }
        .um-pg-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #5A5A7A; border: 1px solid #E8E8EC; transition: all 0.2s; cursor: pointer; background: #fff; }
        .um-pg-btn:hover:not(.disabled) { border-color: var(--color-primary); color: var(--color-primary); }
        .um-pg-btn.disabled, .um-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .um-pg-num { width: 32px; height: 32px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #5A5A7A; transition: all 0.2s; cursor: pointer; background: transparent; }
        .um-pg-num.active { background: var(--color-primary); color: #fff; }
        .um-pg-num:hover:not(.active) { background: #F5F5F7; }

        /* Modal */
        .um-modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; padding: 16px; }
        .um-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 460px; box-shadow: 0 25px 80px rgba(0,0,0,0.15); animation: expandIn 0.3s ease; position: relative; overflow: hidden; }
        .um-modal-bg { position: absolute; top: 0; left: 0; right: 0; height: 100px; background: linear-gradient(135deg, var(--color-primary-light), #FFF5F0); }
        .um-modal-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9E9EB8; background: rgba(255,255,255,0.9); z-index: 1; cursor: pointer; transition: all 0.2s; }
        .um-modal-close:hover { background: #fff; color: var(--color-text); }
        .um-modal-body { position: relative; padding: 24px; }
        .um-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .um-avatar-ring { width: 64px; height: 64px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .um-avatar { font-size: 36px; line-height: 1; }
        .um-profile-info h2 { font-size: 18px; font-weight: 700; margin: 0 0 2px; color: var(--color-text); }
        .um-profile-id { font-size: 12px; color: #9E9EB8; display: block; margin-bottom: 6px; }
        .um-profile-status { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .um-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .um-detail-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F8F9FB; border-radius: 10px; }
        .um-detail-item svg { color: #9E9EB8; flex-shrink: 0; }
        .um-detail-item span { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .um-detail-item label { font-size: 11px; color: #9E9EB8; }
        .um-detail-item strong { font-size: 13px; color: var(--color-text); font-weight: 600; }
        .um-detail-actions { display: flex; gap: 8px; }
        .um-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; flex: 1; cursor: pointer; transition: all 0.25s; }
        .um-btn-primary { background: var(--color-primary); color: #fff; }
        .um-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .um-btn-outline { border: 1px solid #E8E8EC; color: #5A5A7A; }
        .um-btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }

        @media (max-width: 768px) {
          .um-page-hdr { flex-direction: column; }
          .um-detail-grid { grid-template-columns: 1fr; }
          .um-table th:nth-child(2), .um-table td:nth-child(2),
          .um-table th:nth-child(5), .um-table td:nth-child(5) { display: none; }
          .um-pagination { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 600px) {
          .um-table th:nth-child(6), .um-table td:nth-child(6) { display: none; }
        }
      `}</style>
    </div>
  )
}
