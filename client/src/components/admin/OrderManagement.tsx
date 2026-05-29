import { useState, useEffect } from 'react'
import { Search, Eye, AlertCircle, X, RefreshCw, CheckCircle, XCircle, Clock, FileText, MessageCircle } from 'lucide-react'
import { api } from '../../utils/api'

const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending_pay: { label: '待付款', color: '#D48806', bg: '#FFFBEB', icon: Clock },
  pending_accept: { label: '待接单', color: '#3B82F6', bg: '#EFF6FF', icon: Clock },
  accepted: { label: '已接单', color: '#45B7A0', bg: '#E8F8F4', icon: CheckCircle },
  in_progress: { label: '服务中', color: '#3B82F6', bg: '#EFF6FF', icon: Clock },
  completed: { label: '已完成', color: '#2D9B7A', bg: '#E8F8F4', icon: CheckCircle },
  reviewed: { label: '已评价', color: '#9E9EB8', bg: '#F5F5F7', icon: CheckCircle },
  refunding: { label: '退款中', color: '#D63031', bg: '#FFF0F0', icon: RefreshCw },
  disputed: { label: '纠纷', color: '#7C3AED', bg: '#F0EBFF', icon: AlertCircle },
  cancelled: { label: '已取消', color: '#8E8EA0', bg: '#F5F5F7', icon: XCircle },
}
const statusFallback = { label: '未知', color: '#9E9EB8', bg: '#F5F5F7', icon: Clock }

function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  const st = statusMap[order.status] || statusFallback
  const Icon = st.icon
  return (
    <div className="om-modal-overlay" onClick={onClose}>
      <div className="om-modal" onClick={e => e.stopPropagation()}>
        <div className="om-modal-bg" style={{ background: st.bg }} />
        <button className="om-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="om-modal-body">
          <div className="om-order-top">
            <div className="om-order-icon" style={{ background: st.bg, color: st.color }}><Icon size={24} /></div>
            <div>
              <h2>{order.id}</h2>
              <span className="om-order-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
            </div>
          </div>
          <div className="om-detail-grid">
            <div className="om-detail-item"><span className="om-di-label">用户</span><span className="om-di-value">{order.user}</span></div>
            <div className="om-detail-item"><span className="om-di-label">服务者</span><span className="om-di-value">{order.sitter}</span></div>
            <div className="om-detail-item"><span className="om-di-label">服务内容</span><span className="om-di-value">{order.service}</span></div>
            <div className="om-detail-item"><span className="om-di-label">订单金额</span><span className="om-di-value om-price">¥{order.amount}</span></div>
            <div className="om-detail-item"><span className="om-di-label">支付方式</span><span className="om-di-value">{order.payment}</span></div>
            <div className="om-detail-item" style={{ gridColumn: '1 / -1' }}><span className="om-di-label">服务地址</span><span className="om-di-value">{order.address}</span></div>
            <div className="om-detail-item" style={{ gridColumn: '1 / -1' }}><span className="om-di-label">下单时间</span><span className="om-di-value">{order.time}</span></div>
          </div>
          {order.issue && (
            <div className="om-issue-card">
              <AlertCircle size={16} />
              <div><span className="om-issue-title">待处理问题</span><p className="om-issue-text">{order.issue}</p></div>
            </div>
          )}
          <div className="om-timeline">
            <div className="om-tl-item active"><div className="om-tl-dot" /><div><span>订单创建</span><span className="om-tl-time">{order.time}</span></div></div>
            <div className={`om-tl-item ${order.status !== 'pending' ? 'active' : ''}`}><div className="om-tl-dot" /><div><span>服务者接单</span></div></div>
            <div className={`om-tl-item ${order.status === 'in_progress' || order.status === 'completed' ? 'active' : ''}`}><div className="om-tl-dot" /><div><span>服务开始</span></div></div>
            <div className={`om-tl-item ${order.status === 'completed' ? 'active' : ''}`}><div className="om-tl-dot" /><div><span>服务完成</span></div></div>
          </div>
          <div className="om-actions">
            {(order.status === 'refunding' || order.status === 'disputed') && (
              <button className="om-btn om-btn-primary" onClick={async () => { await api.put('/admin/orders/' + order.id + '/' + (order.status === 'refunding' ? 'refund' : 'resolve')); onClose() }}>处理 {order.status === 'refunding' ? '退款' : '纠纷'}</button>
            )}
            <button className="om-btn om-btn-outline"><MessageCircle size={14} /> 联系用户</button>
            <button className="om-btn om-btn-outline"><FileText size={14} /> 查看日志</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([])
  useEffect(() => { api.get<any>('/admin/orders').then(d => setOrders(Array.isArray(d) ? d : d?.items || [])).catch(() => setOrders([])) }, [])
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [page, setPage] = useState(1)

  const tabs = [
    { key: 'all', label: '全部', count: orders.length },
    { key: 'pending', label: '待接单', count: orders.filter(o => o.status === 'pending').length },
    { key: 'in_progress', label: '服务中', count: orders.filter(o => o.status === 'in_progress').length },
    { key: 'completed', label: '已完成', count: orders.filter(o => o.status === 'completed').length },
    { key: 'refunding', label: '退款/纠纷', count: orders.filter(o => o.status === 'refunding' || o.status === 'disputed').length },
  ]

  const filtered = orders.filter(o => {
    if (statusTab === 'refunding' && o.status !== 'refunding' && o.status !== 'disputed') return false
    if (statusTab !== 'all' && statusTab !== 'refunding' && o.status !== statusTab) return false
    if (search && !o.id.includes(search) && !o.user.includes(search) && !o.sitter.includes(search)) return false
    return true
  })

  const perPage = 6
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)
  const issueCount = orders.filter(o => o.status === 'refunding' || o.status === 'disputed').length

  return (
    <div className="om-page">
      <div className="om-page-hdr">
        <div><h1>订单管理</h1><p className="om-subtitle">共 {orders.length} 条订单 · {issueCount > 0 ? <span className="om-issue-badge">{issueCount} 条需处理</span> : '全部正常'}</p></div>
      </div>

      <div className="om-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`om-tab ${statusTab === t.key ? 'active' : ''}`} onClick={() => { setStatusTab(t.key); setPage(1) }}>
            {t.label}
            <span className={`om-tab-count ${statusTab === t.key ? 'active' : ''}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="om-toolbar">
        <div className="om-search"><Search size={16} /><input placeholder="搜索订单号、用户名或服务者..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /></div>
        <button className="om-refresh-btn" onClick={() => api.get<any>('/admin/orders').then(d => setOrders(Array.isArray(d) ? d : d?.items || []))}><RefreshCw size={15} /> 刷新</button>
      </div>

      <div className="om-table-card">
        <table className="om-table">
          <thead><tr><th>订单号</th><th>用户</th><th>服务者</th><th>服务</th><th>金额</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={8}><div className="om-empty"><Search size={32} /><p>未找到匹配的订单</p></div></td></tr>
            ) : paged.map(o => {
              const st = statusMap[o.status] || statusFallback
              const Icon = st.icon
              const isIssue = o.status === 'refunding' || o.status === 'disputed'
              return (
                <tr key={o.id} className={isIssue ? 'issue-row' : ''}>
                  <td><span className="om-td-id">{o.id}</span></td>
                  <td>{o.user}</td>
                  <td>{o.sitter}</td>
                  <td>{o.service}</td>
                  <td><span className="om-td-price">¥{o.amount}</span></td>
                  <td><span className="om-status-badge" style={{ background: st.bg, color: st.color }}><Icon size={11} /> {st.label}</span></td>
                  <td className="om-td-muted">{o.time}</td>
                  <td><div className="om-td-actions"><button className="om-action-btn" onClick={() => setSelected(o)} title="查看详情"><Eye size={15} /></button>{isIssue && <span className="om-issue-dot" />}</div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="om-pagination">
        <span className="om-pg-info">显示 {filtered.length > 0 ? (page - 1) * perPage + 1 : 0}-{Math.min(page * perPage, filtered.length)}，共 {filtered.length} 条</span>
        <div className="om-pg-btns">
          <button className={`om-pg-btn ${page <= 1 ? 'disabled' : ''}`} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`om-pg-num ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className={`om-pg-btn ${page >= totalPages ? 'disabled' : ''}`} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}

      <style>{`
        .om-page { font-size: 14px; }
        .om-page-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .om-page-hdr h1 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0; }
        .om-subtitle { font-size: 13px; color: #9E9EB8; margin-top: 4px; }
        .om-issue-badge { color: #D63031; font-weight: 600; }

        .om-tabs { display: flex; gap: 4px; margin-bottom: 16px; background: #F5F5F7; border-radius: 10px; padding: 4px; width: fit-content; flex-wrap: wrap; }
        .om-tab { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #9E9EB8; transition: all 0.25s; cursor: pointer; }
        .om-tab.active { background: #fff; color: var(--color-text); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .om-tab:hover:not(.active) { color: #5A5A7A; }
        .om-tab-count { padding: 0 7px; border-radius: 100px; font-size: 11px; font-weight: 700; background: #E8E8EC; color: #9E9EB8; line-height: 18px; }
        .om-tab-count.active { background: var(--color-primary); color: #fff; }

        .om-toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .om-search { display: flex; align-items: center; gap: 8px; padding: 0 14px; background: #fff; border-radius: 10px; border: 1px solid #E8E8EC; flex: 1; min-width: 220px; height: 40px; color: #9E9EB8; transition: border-color 0.25s, box-shadow 0.25s; }
        .om-search:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.08); }
        .om-search input { border: none; outline: none; font-size: 13px; flex: 1; font-family: var(--font); background: transparent; }
        .om-refresh-btn { display: flex; align-items: center; gap: 6px; padding: 0 16px; height: 40px; border-radius: 10px; border: 1px solid #E8E8EC; font-size: 13px; font-weight: 600; color: #5A5A7A; background: #fff; cursor: pointer; transition: all 0.25s; }
        .om-refresh-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }

        .om-table-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
        .om-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .om-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9E9EB8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E8E8EC; background: #FAFBFC; white-space: nowrap; }
        .om-table td { padding: 14px 16px; border-bottom: 1px solid #F3F4F6; color: var(--color-text); transition: background 0.2s; }
        .om-table tr:last-child td { border-bottom: none; }
        .om-table tbody tr:hover td { background: #FAFBFC; }
        .om-table tr.issue-row td { background: #FFFAFA; }
        .om-table tr.issue-row:hover td { background: #FFF5F5; }

        .om-td-id { font-size: 11px; color: #9E9EB8; font-weight: 500; font-family: monospace; }
        .om-td-price { font-weight: 700; color: var(--color-primary); }
        .om-td-muted { color: #9E9EB8; font-size: 12px; }
        .om-td-actions { display: flex; align-items: center; gap: 4px; position: relative; }
        .om-action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #B0B0C0; transition: all 0.2s; cursor: pointer; }
        .om-action-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }
        .om-issue-dot { width: 8px; height: 8px; border-radius: 50%; background: #D63031; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .om-status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; white-space: nowrap; }

        .om-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: #B0B0C0; gap: 8px; }
        .om-empty p { font-size: 14px; margin: 0; }

        .om-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 12px; }
        .om-pg-info { font-size: 12px; color: #9E9EB8; }
        .om-pg-btns { display: flex; gap: 4px; align-items: center; }
        .om-pg-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #5A5A7A; border: 1px solid #E8E8EC; transition: all 0.2s; cursor: pointer; background: #fff; }
        .om-pg-btn:hover:not(.disabled) { border-color: var(--color-primary); color: var(--color-primary); }
        .om-pg-btn.disabled, .om-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .om-pg-num { width: 32px; height: 32px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #5A5A7A; transition: all 0.2s; cursor: pointer; background: transparent; }
        .om-pg-num.active { background: var(--color-primary); color: #fff; }
        .om-pg-num:hover:not(.active) { background: #F5F5F7; }

        /* Modal */
        .om-modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; padding: 16px; }
        .om-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 25px 80px rgba(0,0,0,0.15); animation: expandIn 0.3s ease; position: relative; overflow: hidden; }
        .om-modal-bg { position: absolute; top: 0; left: 0; right: 0; height: 80px; }
        .om-modal-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9E9EB8; background: rgba(255,255,255,0.9); z-index: 1; cursor: pointer; transition: all 0.2s; }
        .om-modal-close:hover { background: #fff; color: var(--color-text); }
        .om-modal-body { position: relative; padding: 24px; }
        .om-order-top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .om-order-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .om-order-top h2 { font-size: 15px; font-weight: 700; margin: 0 0 4px; color: var(--color-text); font-family: monospace; }
        .om-order-status { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }

        .om-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; background: #F8F9FB; border-radius: 12px; padding: 12px; }
        .om-detail-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; border-bottom: 1px solid #EEEFF2; }
        .om-detail-item:last-child, .om-detail-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }
        .om-di-label { font-size: 12px; color: #9E9EB8; flex-shrink: 0; }
        .om-di-value { font-size: 13px; color: var(--color-text); font-weight: 500; text-align: right; }
        .om-price { color: var(--color-primary); font-weight: 700; }

        .om-issue-card { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: #FFF0F0; border-radius: 10px; margin-bottom: 16px; }
        .om-issue-card svg { color: #D63031; flex-shrink: 0; margin-top: 1px; }
        .om-issue-title { display: block; font-size: 12px; font-weight: 700; color: #D63031; margin-bottom: 2px; }
        .om-issue-text { font-size: 12px; color: #5A5A7A; margin: 0; }

        .om-timeline { display: flex; flex-direction: column; gap: 0; padding: 12px 0; margin-bottom: 16px; position: relative; }
        .om-tl-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; position: relative; }
        .om-tl-item:not(:last-child)::after { content: ''; position: absolute; left: 7px; top: 24px; width: 2px; height: 16px; background: #E8E8EC; }
        .om-tl-item.active .om-tl-dot { background: var(--color-primary); border-color: var(--color-primary); }
        .om-tl-item.active span:first-of-type { color: var(--color-text); font-weight: 600; }
        .om-tl-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #D0D0D8; background: #fff; flex-shrink: 0; transition: all 0.3s; }
        .om-tl-item span { display: block; font-size: 13px; color: #B0B0C0; }
        .om-tl-time { font-size: 11px; color: #9E9EB8 !important; }

        .om-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .om-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .om-btn-primary { background: linear-gradient(135deg, #FF7D5A, #FF6A40); color: #fff; flex: 1; }
        .om-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,125,90,0.3); }
        .om-btn-outline { border: 1px solid #E8E8EC; color: #5A5A7A; background: #fff; }
        .om-btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }

        @media (max-width: 768px) {
          .om-tabs { width: 100%; overflow-x: auto; flex-wrap: nowrap; }
          .om-detail-grid { grid-template-columns: 1fr; }
          .om-table th:nth-child(2), .om-table td:nth-child(2),
          .om-table th:nth-child(3), .om-table td:nth-child(3) { display: none; }
          .om-pagination { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 600px) {
          .om-table th:nth-child(7), .om-table td:nth-child(7) { display: none; }
        }
      `}</style>
    </div>
  )
}
