import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, MapPin, Phone, MessageCircle, Check, X, AlertCircle } from 'lucide-react'

interface Order {
  id: string; petEmoji: string; petName: string; serviceName: string;
  address: string; price: number; ownerName: string; ownerPhone: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string; date: string; time: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-001', petEmoji: '🐕', petName: '豆豆', serviceName: '遛狗 60分钟', address: '望京SOHO T3 1808', price: 79, ownerName: '李先生', ownerPhone: '138****8888', status: 'pending', createdAt: new Date(Date.now() - 2 * 60000).toISOString(), date: '2026-05-28', time: '10:00' },
  { id: 'ORD-002', petEmoji: '🐈', petName: '咪咪', serviceName: '上门喂猫', address: '融泽嘉园12号院3-1206', price: 39, ownerName: '王女士', ownerPhone: '139****5678', status: 'pending', createdAt: new Date(Date.now() - 5 * 60000).toISOString(), date: '2026-05-28', time: '14:00' },
  { id: 'ORD-003', petEmoji: '🐕', petName: '可乐', serviceName: '遛狗 60分钟', address: '华润橡树湾5-2-801', price: 69, ownerName: '可乐妈妈', ownerPhone: '139****1234', status: 'accepted', createdAt: new Date(Date.now() - 120 * 60000).toISOString(), date: '2026-05-28', time: '10:00' },
  { id: 'ORD-004', petEmoji: '🐕', petName: '团子', serviceName: '遛狗+清洁', address: '华联商场后侧2-302', price: 99, ownerName: '团子妈妈', ownerPhone: '137****9012', status: 'in_progress', createdAt: new Date(Date.now() - 240 * 60000).toISOString(), date: '2026-05-28', time: '16:00' },
  { id: 'ORD-005', petEmoji: '🐈', petName: '花花', serviceName: '上门喂猫', address: '望京西园三区502', price: 39, ownerName: '花花主人', ownerPhone: '158****3456', status: 'completed', createdAt: new Date(Date.now() - 86400 * 1000).toISOString(), date: '2026-05-27', time: '19:00' },
  { id: 'ORD-006', petEmoji: '🐕', petName: '大毛', serviceName: '遛狗 30分钟', address: '望京SOHO T2 1506', price: 49, ownerName: '王女士', ownerPhone: '136****9999', status: 'completed', createdAt: new Date(Date.now() - 172800 * 1000).toISOString(), date: '2026-05-26', time: '09:00' },
  { id: 'ORD-007', petEmoji: '🐕', petName: '可乐', serviceName: '宠物清洁', address: '华润橡树湾5-2-801', price: 69, ownerName: '可乐妈妈', ownerPhone: '139****1234', status: 'cancelled', createdAt: new Date(Date.now() - 259200 * 1000).toISOString(), date: '2026-05-25', time: '14:00' },
  { id: 'ORD-008', petEmoji: '🐈', petName: '雪球', serviceName: '上门喂猫', address: '融泽嘉园8号院1-502', price: 39, ownerName: '刘先生', ownerPhone: '136****5678', status: 'pending', createdAt: new Date().toISOString(), date: '2026-05-29', time: '18:00' },
]

const tabs = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待接单', color: '#D48806', bg: '#FFFBEB' },
  accepted: { label: '已接单', color: '#3B82F6', bg: '#EFF6FF' },
  in_progress: { label: '服务中', color: '#45B7A0', bg: '#E8F8F4' },
  completed: { label: '已完成', color: '#9E9EB8', bg: '#F5F5F7' },
  cancelled: { label: '已取消', color: '#FF6B6B', bg: '#FFF0F0' },
}

function CountdownTimer({ createdAt }: { createdAt: string }) {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    const end = new Date(createdAt).getTime() + 15 * 60 * 1000
    const tick = () => setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000)))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [createdAt])
  const m = Math.floor(remaining / 60); const s = remaining % 60
  if (remaining <= 0) return <span className="so-countdown expired">已过期</span>
  return <span className={`so-countdown ${remaining < 120 ? 'urgent' : ''}`}>⏱ {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</span>
}

export default function SitterOrders() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 5

  const filtered = mockOrders.filter(o => {
    const tabMatch = activeTab === 'pending' ? o.status === 'pending' : o.status === activeTab
    const searchMatch = !search || o.petName.includes(search) || o.ownerName.includes(search) || o.id.includes(search)
    return tabMatch && searchMatch
  })

  const paged = filtered.slice(0, page * perPage)
  const hasMore = paged.length < filtered.length

  return (
    <div className="so-page">
      <div className="so-header">
        <h1>我的订单</h1>
        <span className="so-count">共 {filtered.length} 单</span>
      </div>

      <div className="so-search">
        <Search size={16} />
        <input placeholder="搜索宠物名、主人或订单号..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <div className="so-tabs">
        {tabs.map(tab => {
          const count = mockOrders.filter(o => tab === 'pending' ? o.status === 'pending' : o.status === tab).length
          return (
            <button key={tab} className={`so-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setPage(1) }}>
              {statusConfig[tab]?.label || tab}
              <span className="so-tab-count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="so-list">
        {paged.length === 0 ? (
          <div className="so-empty">
            <Search size={40} />
            <p>暂无{statusConfig[activeTab]?.label}订单</p>
          </div>
        ) : paged.map(order => {
          const st = statusConfig[order.status]
          const isPending = order.status === 'pending'
          return (
            <div key={order.id} className="so-card" onClick={() => navigate(`/sitter/orders/${order.id}`)}>
              <div className="so-card-left">
                <span className="so-card-emoji">{order.petEmoji}</span>
              </div>
              <div className="so-card-body">
                <div className="so-card-top">
                  <span className="so-card-name">{order.petName}</span>
                  <span className="so-card-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <span className="so-card-service">{order.serviceName}</span>
                <span className="so-card-address"><MapPin size={12} /> {order.address}</span>
                <div className="so-card-meta">
                  <span className="so-card-price">¥{order.price}</span>
                  <span className="so-card-owner"><Phone size={11} /> {order.ownerName} {order.ownerPhone}</span>
                </div>
              </div>
              <div className="so-card-right">
                {isPending && <CountdownTimer createdAt={order.createdAt} />}
                <span className="so-card-date">{order.date}<br />{order.time}</span>
              </div>
              {isPending && (
                <div className="so-card-overlay" onClick={e => e.stopPropagation()}>
                  <button className="so-action-btn reject" onClick={() => alert('已拒单')}><X size={16} /></button>
                  <button className="so-action-btn accept" onClick={() => alert('已接单')}><Check size={16} /></button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="so-more">
          <button onClick={() => setPage(p => p + 1)}>加载更多 ({filtered.length - paged.length} 条)</button>
        </div>
      )}

      <style>{`
        .so-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .so-header h1 { font-size: 20px; font-weight: 800; color: var(--color-text); margin: 0; }
        .so-count { font-size: 13px; color: var(--color-text-muted); }
        .so-search { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fff; border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: 14px; }
        .so-search input { flex: 1; border: none; outline: none; font-size: 13px; background: transparent; }
        .so-search input::placeholder { color: var(--color-text-muted); }
        .so-search:focus-within { border-color: var(--color-primary); }
        .so-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .so-tab { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--color-text-muted); background: #F5F5F7; transition: all 0.25s; }
        .so-tab.active { background: var(--color-primary); color: #fff; box-shadow: 0 3px 10px rgba(255,125,90,0.2); }
        .so-tab:hover:not(.active) { background: #EEEFF2; }
        .so-tab-count { font-size: 11px; padding: 0 6px; border-radius: 100px; background: rgba(0,0,0,0.06); line-height: 18px; }
        .so-tab.active .so-tab-count { background: rgba(255,255,255,0.2); }
        .so-list { display: flex; flex-direction: column; gap: 10px; }
        .so-card { display: flex; gap: 14px; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; position: relative; transition: all 0.25s; cursor: pointer; }
        .so-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.04); border-color: var(--color-primary); }
        .so-card-left { flex-shrink: 0; }
        .so-card-emoji { font-size: 32px; }
        .so-card-body { flex: 1; min-width: 0; }
        .so-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .so-card-name { font-size: 15px; font-weight: 700; color: var(--color-text); }
        .so-card-status { padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .so-card-service { display: block; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px; }
        .so-card-address { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-muted); margin-bottom: 6px; }
        .so-card-meta { display: flex; align-items: center; gap: 12px; }
        .so-card-price { font-size: 16px; font-weight: 800; color: var(--color-primary); }
        .so-card-owner { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--color-text-muted); }
        .so-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
        .so-countdown { font-size: 12px; font-weight: 700; color: var(--color-text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .so-countdown.urgent { color: var(--color-error); animation: pulse 1.5s ease infinite; }
        .so-countdown.expired { color: var(--color-text-muted); }
        .so-card-date { font-size: 11px; color: var(--color-text-muted); text-align: right; line-height: 1.4; }
        .so-card-overlay { position: absolute; bottom: 12px; right: 12px; display: flex; gap: 6px; }
        .so-action-btn { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; transition: all 0.25s; cursor: pointer; }
        .so-action-btn.accept { background: var(--color-primary-gradient); color: #fff; box-shadow: 0 3px 10px rgba(255,125,90,0.25); }
        .so-action-btn.accept:hover { transform: scale(1.1); }
        .so-action-btn.reject { background: #fff; border: 1px solid var(--color-border); color: var(--color-text-muted); }
        .so-action-btn.reject:hover { border-color: var(--color-error); color: var(--color-error); background: #FFF0F0; }
        .so-empty { text-align: center; padding: 60px 20px; color: var(--color-text-muted); }
        .so-empty p { margin-top: 12px; font-size: 14px; }
        .so-more { text-align: center; padding: 20px; }
        .so-more button { padding: 10px 28px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; color: var(--color-text-secondary); border: 1px solid var(--color-border); background: #fff; transition: all 0.25s; }
        .so-more button:hover { border-color: var(--color-primary); color: var(--color-primary); }
        @media (max-width: 768px) { .so-card { flex-wrap: wrap; } .so-card-right { width: 100%; flex-direction: row; justify-content: space-between; align-items: center; } }
      `}</style>
    </div>
  )
}
