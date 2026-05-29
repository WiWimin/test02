import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, ChevronRight, MessageCircle, Star, Search } from 'lucide-react'
import { api } from '../../utils/api'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
]

interface OrderItem {
  id: string
  sitter: string
  sitterAvatar: string
  service: string
  petName: string
  date: string
  time: string
  status: string
  amount: number
  address: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending_pay: { label: '待支付', className: 'warning' },
  pending_accept: { label: '待接单', className: 'warning' },
  accepted: { label: '已接单', className: 'warning' },
  in_progress: { label: '进行中', className: 'active' },
  completed: { label: '已完成', className: 'done' },
  reviewed: { label: '已评价', className: 'done' },
  cancelled: { label: '已取消', className: 'cancel' },
}

const tabStatusMap: Record<string, string> = {
  all: 'all',
  pending: 'pending_accept',
  active: 'in_progress',
  completed: 'completed',
}

export default function OwnerOrders() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const statusParam = tabStatusMap[activeTab] || 'all'
        const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
        const res = await api.get<{ items: any[] }>(`/orders?status=${statusParam}&pageSize=20${searchParam}`)
        const items = (res as any)?.items || []
        setOrders(items.map((o: any) => ({
          id: o.id,
          sitter: o.sitter?.name || '',
          sitterAvatar: o.sitter?.avatar || '👩',
          service: o.services?.map((s: any) => s.name).join('、') || '',
          petName: o.pets?.[0]?.pet?.name || '',
          date: o.service_date ? new Date(o.service_date).toLocaleDateString('zh-CN') : '',
          time: o.service_time || '',
          status: o.status,
          amount: o.total || 0,
          address: o.address ? `${o.address.address} ${o.address.detail}`.trim() : '',
        })))
      } catch (err) {
        console.error('Failed to load orders:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [activeTab, search])

  return (
    <div className="oo-page">
      <div className="oo-header">
        <h2>我的订单</h2>
        <span className="oo-count">共{orders.length}单</span>
      </div>

      {/* Search */}
      <div className="oo-search">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索订单..." />
      </div>

      {/* Tabs */}
      <div className="oo-tabs">
        {tabs.map(tab => (
          <button key={tab.key} className={`oo-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="oo-empty">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="oo-empty">暂无订单</div>
      ) : (
        <div className="oo-list">
          {orders.map(order => {
            const s = statusMap[order.status] || { label: '未知', className: '' }
            return (
              <div key={order.id} className="oo-card" onClick={() => navigate(`/home/owner/orders/${order.id}`)}>
                <div className="oo-card-left">
                  <div className="oo-card-avatar">{order.sitterAvatar}</div>
                </div>
                <div className="oo-card-mid">
                  <div className="oo-card-top">
                    <span className="oo-card-sitter">{order.sitter}</span>
                    <span className={`oo-card-status ${s.className}`}>{s.label}</span>
                  </div>
                  <span className="oo-card-service">{order.service}</span>
                  <span className="oo-card-time"><Clock size={12} /> {order.date} {order.time}</span>
                  <span className="oo-card-addr"><MapPin size={12} /> {order.address}</span>
                </div>
                <div className="oo-card-right">
                  <span className="oo-card-amount">¥{order.amount}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .oo-page { }
        .oo-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
        .oo-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
        .oo-count { font-size: 13px; color: var(--color-text-muted); }
        .oo-search {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; border-radius: var(--radius-md);
          background: #fff; border: 1px solid var(--color-border);
          margin-bottom: 12px;
        }
        .oo-search input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .oo-search input::placeholder { color: var(--color-text-muted); }
        .oo-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; }
        .oo-tab {
          padding: 6px 18px; border-radius: 100px; font-size: 13px; font-weight: 500;
          border: 1px solid var(--color-border); white-space: nowrap;
          transition: all 0.2s; cursor: pointer;
        }
        .oo-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .oo-empty { text-align: center; padding: 60px 20px; color: var(--color-text-muted); font-size: 14px; }
        .oo-list { display: flex; flex-direction: column; gap: 10px; }
        .oo-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px; border-radius: var(--radius-md);
          background: #fff; border: 1px solid var(--color-border);
          cursor: pointer; transition: all 0.25s;
        }
        .oo-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .oo-card-left { flex-shrink: 0; }
        .oo-card-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .oo-card-mid { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .oo-card-top { display: flex; align-items: center; gap: 8px; }
        .oo-card-sitter { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .oo-card-status { font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 100px; }
        .oo-card-status.warning { background: #FFF8E1; color: #F59E0B; }
        .oo-card-status.active { background: #FFF0EB; color: var(--color-primary); }
        .oo-card-status.done { background: #E8F8F4; color: var(--color-secondary); }
        .oo-card-status.cancel { background: #F5F5F5; color: var(--color-text-muted); }
        .oo-card-service { font-size: 12px; color: var(--color-text-muted); }
        .oo-card-time, .oo-card-addr { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
        .oo-card-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .oo-card-amount { font-size: 16px; font-weight: 700; color: var(--color-primary); }
      `}</style>
    </div>
  )
}
