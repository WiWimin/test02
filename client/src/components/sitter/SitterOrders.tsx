import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, ChevronRight } from 'lucide-react'
import { api } from '../../utils/api'

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'pending_accept', label: '待接单' },
  { key: 'accepted', label: '已接单' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  pending_accept: { label: '待接单', color: '#FF9F43', bg: '#FFF5E6' },
  pending_pay: { label: '待付款', color: '#4A90D9', bg: '#EFF6FF' },
  accepted: { label: '已接单', color: '#4A90D9', bg: '#EFF6FF' },
  in_progress: { label: '服务中', color: '#45B7A0', bg: '#E8F8F4' },
  completed: { label: '已完成', color: '#8E8EA0', bg: '#F0F2F5' },
  cancelled: { label: '已取消', color: '#FF6B6B', bg: '#FFF0F0' },
}

export default function SitterOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeTab) params.set('status', activeTab)
    api.get<any[]>(`/orders?${params.toString()}`).then(d => {
      setOrders(Array.isArray(d) ? d : (d as any)?.items || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [activeTab])

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return (o.serviceName || o.service?.name || '').toLowerCase().includes(q)
      || (o.ownerName || o.owner?.name || '').toLowerCase().includes(q)
  })

  return (
    <div className="so-page">
      <div className="so-header">
        <h2>我的订单</h2>
        <div className="so-search">
          <Search size={15} />
          <input type="text" placeholder="搜索服务、主人..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="so-tabs">
        {statusTabs.map(tab => (
          <button key={tab.key} className={`so-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="so-list">
        {loading ? (
          <div className="so-empty">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="so-empty">暂无订单</div>
        ) : filtered.map(order => {
          const st = statusStyles[order.status] || statusStyles.completed
          return (
            <div key={order.id} className="so-card" onClick={() => navigate(`/sitter/orders/${order.id}`)}>
              <div className="so-card-top">
                <div className="so-card-info">
                  <span className="so-card-service">{order.serviceName || order.service?.name || '宠物服务'}</span>
                  <span className="so-card-price">¥{order.total || order.totalPrice || 0}</span>
                </div>
                <span className="so-card-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <div className="so-card-meta">
                <span>{order.petName || '🐾 宠物'} · {order.ownerName || order.owner?.name || '主人'}</span>
                <span className="so-card-time"><Clock size={11} /> {order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
              <div className="so-card-footer">
                <span className="so-card-addr">{order.address || order.addressDetail || ''}</span>
                <ChevronRight size={14} className="so-card-arrow" />
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .so-page { display: flex; flex-direction: column; gap: 12px; }
        .so-header h2 { font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0 0 10px; }
        .so-search {
          display: flex; align-items: center; gap: 8px; padding: 10px 14px;
          border-radius: 10px; background: #fff; border: 1px solid #EEEEF2;
        }
        .so-search input { border: none; background: none; outline: none; font-size: 13px; color: #1A1A2E; flex: 1; }
        .so-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
        .so-tab {
          padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
          white-space: nowrap; cursor: pointer; color: #8E8EA0; background: #fff;
          border: 1px solid #EEEEF2; transition: all 0.2s;
        }
        .so-tab.active { background: #FF7D5A; color: #fff; border-color: #FF7D5A; }
        .so-list { display: flex; flex-direction: column; gap: 10px; }
        .so-empty { text-align: center; padding: 40px 16px; color: #8E8EA0; font-size: 13px; }
        .so-card {
          background: #fff; border-radius: 14px; padding: 14px; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .so-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .so-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .so-card-info { display: flex; align-items: center; gap: 8px; }
        .so-card-service { font-size: 14px; font-weight: 600; color: #1A1A2E; }
        .so-card-price { font-size: 15px; font-weight: 800; color: #FF7D5A; }
        .so-card-status { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 100px; }
        .so-card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #8E8EA0; margin-bottom: 6px; }
        .so-card-time { display: flex; align-items: center; gap: 3px; }
        .so-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #B0B0C0; }
        .so-card-addr { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
        .so-card-arrow { color: #D0D0D8; flex-shrink: 0; }
      `}</style>
    </div>
  )
}
