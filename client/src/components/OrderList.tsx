import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Search, Clock, MapPin, ChevronRight,
  MessageCircle, XCircle, Star, RotateCcw, Trash2,
  AlertCircle, CreditCard, ChevronDown
} from 'lucide-react'
import { api } from '../utils/api'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending_pay:   { label: '待支付', color: '#D48806', bg: '#FFFBEB' },
  pending_accept:{ label: '待接单', color: '#3B82F6', bg: '#EFF6FF' },
  accepted:      { label: '已接单', color: '#45B7A0', bg: '#E8F8F4' },
  in_progress:   { label: '服务中', color: '#45B7A0', bg: '#E8F8F4' },
  completed:     { label: '已完成', color: '#9E9EB8', bg: '#F5F5F7' },
  reviewed:      { label: '已评价', color: '#9E9EB8', bg: '#F5F5F7' },
  cancelled:     { label: '已取消', color: '#FF6B6B', bg: '#FFF0F0' },
}

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending_pay', label: '待支付' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

function formatCountdown(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

interface OrderItem {
  id: string
  status: string
  petName: string
  petEmoji: string
  serviceName: string
  sitterName: string
  sitterAvatar: string
  date: string
  time: string
  price: number
  address: string
  createdAt: string
}

function filterOrders(orders: OrderItem[], tab: string) {
  if (tab === 'all') return orders
  if (tab === 'active') return orders.filter(o => o.status === 'accepted' || o.status === 'in_progress' || o.status === 'pending_accept')
  return orders.filter(o => o.status === tab)
}

function CountdownTimer({ createdAt }: { createdAt: string }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const end = new Date(createdAt).getTime() + 30 * 60 * 1000
    const tick = () => {
      const r = end - Date.now()
      if (r <= 0) { setRemaining(0); return }
      setRemaining(r)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [createdAt])

  if (remaining <= 0) return <span className="ol-countdown expired">已过期</span>

  return (
    <span className="ol-countdown">
      <Clock size={12} />
      {formatCountdown(remaining)}
    </span>
  )
}

export default function OrderList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get<any[]>('/orders?page=1&pageSize=50')
        setOrders((data || []).map((o: any) => ({
          id: o.id || '',
          status: o.status || 'pending_pay',
          petName: o.petName || o.pet_name || '宠物',
          petEmoji: o.petEmoji || o.pet_emoji || '🐾',
          serviceName: o.serviceName || o.service_name || '宠物服务',
          sitterName: o.sitterName || o.sitter_name || '服务者',
          sitterAvatar: o.sitterAvatar || o.sitter_avatar || '👤',
          date: o.serviceDate || o.service_date || '',
          time: o.serviceTime || o.service_time || '',
          price: o.totalPrice || o.total_price || 0,
          address: o.addressDetail || o.address_detail || o.address || '',
          createdAt: o.createdAt || o.created_at || new Date().toISOString(),
        })))
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filtered = filterOrders(orders, activeTab)
  const displayed = filtered.slice(0, page * 10)

  const handleLoadMore = useCallback(() => {
    if (loadingMore || displayed.length >= filtered.length) return
    setLoadingMore(true)
    setTimeout(() => { setPage(p => p + 1); setLoadingMore(false) }, 600)
  }, [loadingMore, displayed.length, filtered.length])

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      if (doc.scrollHeight - doc.scrollTop - doc.clientHeight < 120) handleLoadMore()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [handleLoadMore])

  useEffect(() => { setPage(1) }, [activeTab])

  if (loading) {
    return (
      <div className="ol-page">
        <div className="ol-topbar">
          <div className="container ol-topbar-inner">
            <button className="ol-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="ol-title">我的订单</h1>
            <button className="ol-search-btn" aria-label="搜索">
              <Search size={20} />
            </button>
          </div>
        </div>
        <div className="ol-body container" style={{ paddingTop: 80, textAlign: 'center', color: '#9E9EB8' }}>
          加载中...
        </div>
      </div>
    )
  }

  return (
    <div className="ol-page">
      {/* ── Top Bar ── */}
      <div className="ol-topbar">
        <div className="container ol-topbar-inner">
          <button className="ol-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="ol-title">我的订单</h1>
          <button className="ol-search-btn" aria-label="搜索">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ol-tabs-wrap">
        <div className="container">
          <div className="ol-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`ol-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.key !== 'all' && tab.key !== 'active' && (
                  <span className="ol-tab-count">{filterOrders(orders, tab.key).length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="ol-tab-indicator" style={{ left: `${tabs.findIndex(t => t.key === activeTab) * 20}%`, width: `${20}%` }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="ol-body container">
        {displayed.length === 0 ? (
          <div className="ol-empty">
            <div className="ol-empty-icon">📋</div>
            <h3 className="ol-empty-title">暂无{tabs.find(t => t.key === activeTab)?.label}订单</h3>
            <p className="ol-empty-desc">去预约一次宠物服务吧</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>去预约</button>
          </div>
        ) : (
          <div className="ol-list">
            {displayed.map(order => (
              <OrderCard key={order.id} order={order} navigate={navigate} />
            ))}

            {loadingMore && [...Array(2)].map((_, i) => <OrderSkeleton key={`skel-${i}`} />)}

            {displayed.length < filtered.length && !loadingMore && (
              <button className="ol-load-more" onClick={handleLoadMore}>
                加载更多 <ChevronDown size={14} />
              </button>
            )}

            {displayed.length >= filtered.length && filtered.length > 0 && (
              <p className="ol-end">— 已显示全部 {filtered.length} 条订单 —</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .ol-page { min-height: 100vh; background: var(--color-bg); padding-top: 112px; }

        .ol-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px; background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);
        }
        .ol-topbar-inner { display: flex; align-items: center; height: 100%; gap: 12px; }
        .ol-back {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 10px; border-radius: var(--radius-sm);
          color: var(--color-text-secondary); transition: all 0.25s ease;
        }
        .ol-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .ol-title { flex: 1; font-size: 17px; font-weight: 700; color: var(--color-text); }
        .ol-search-btn {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-secondary); transition: all 0.25s ease;
        }
        .ol-search-btn:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }

        .ol-tabs-wrap {
          position: fixed; top: 56px; left: 0; right: 0; z-index: 99;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
        }
        .ol-tabs { display: flex; position: relative; padding: 8px 0; }
        .ol-tab {
          flex: 1; padding: 10px 6px; font-size: 14px; font-weight: 500;
          color: var(--color-text-muted); text-align: center;
          transition: color 0.3s ease; position: relative;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .ol-tab.active { color: var(--color-primary); }
        .ol-tab-count {
          font-size: 11px; background: var(--color-border); color: var(--color-text-muted);
          padding: 0 7px; border-radius: 100px; line-height: 18px;
        }
        .ol-tab.active .ol-tab-count { background: var(--color-primary-light); color: var(--color-primary); }
        .ol-tab-indicator {
          position: absolute; bottom: 0; height: 2px;
          background: var(--color-primary); border-radius: 1px;
          transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .ol-body { padding: 16px 0 32px; }

        .ol-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center;
        }
        .ol-empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.6; }
        .ol-empty-title { font-size: 17px; font-weight: 600; color: var(--color-text); margin-bottom: 8px; }
        .ol-empty-desc { font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px; }

        .ol-list { display: flex; flex-direction: column; gap: 12px; animation: fadeIn 0.35s ease; }

        .ol-card {
          background: var(--color-bg-alt); border-radius: var(--radius-lg);
          border: 1px solid var(--color-border); overflow: hidden;
          transition: all 0.3s ease; cursor: pointer;
        }
        .ol-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .ol-card.in-progress { border-color: rgba(69,183,160,0.3); }

        .ol-card-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 18px 0;
        }
        .ol-card-id { font-size: 11px; color: var(--color-text-muted); letter-spacing: 0.3px; }

        .ol-status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 100px;
          font-size: 11px; font-weight: 600;
        }
        .ol-status-dot {
          width: 5px; height: 5px; border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        .ol-card-body { padding: 12px 18px; display: flex; gap: 14px; align-items: flex-start; }
        .ol-card-emoji { font-size: 36px; flex-shrink: 0; }
        .ol-card-info { flex: 1; min-width: 0; }
        .ol-card-service { font-size: 15px; font-weight: 600; color: var(--color-text); margin-bottom: 2px; }
        .ol-card-sitter { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; }

        .ol-card-meta {
          display: flex; flex-wrap: wrap; gap: 12px;
          font-size: 12px; color: var(--color-text-muted);
        }
        .ol-meta-item { display: flex; align-items: center; gap: 4px; }

        .ol-card-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 18px 14px; border-top: 1px solid var(--color-border);
        }
        .ol-card-price {
          font-size: 13px; color: var(--color-text-secondary);
        }
        .ol-card-price strong { font-size: 18px; font-weight: 800; color: var(--color-primary); margin-left: 4px; }

        .ol-card-actions { display: flex; gap: 8px; }
        .ol-act-btn {
          padding: 6px 14px; border-radius: var(--radius-sm);
          font-size: 12px; font-weight: 600;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          transition: all 0.25s ease;
        }
        .ol-act-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }
        .ol-act-btn.primary {
          background: var(--color-primary-gradient); color: #fff; border-color: transparent;
        }
        .ol-act-btn.primary:hover { box-shadow: var(--shadow-hover); }
        .ol-act-btn.danger { color: var(--color-error); border-color: var(--color-error); }
        .ol-act-btn.danger:hover { background: #FFF0F0; }
        .ol-act-btn.success { color: var(--color-secondary); border-color: var(--color-secondary); }
        .ol-act-btn.success:hover { background: var(--color-secondary-light); }

        .ol-countdown {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700; color: var(--color-error);
          font-variant-numeric: tabular-nums;
        }
        .ol-countdown.expired { color: var(--color-text-muted); }

        .ol-skeleton {
          background: var(--color-bg-alt); border-radius: var(--radius-lg);
          border: 1px solid var(--color-border); padding: 16px 18px;
        }
        .ol-sk-line {
          height: 14px; border-radius: 4px; background: var(--color-border);
          background-image: linear-gradient(90deg, var(--color-border) 25%, #f0f0f3 50%, var(--color-border) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
          margin-bottom: 10px;
        }
        .ol-sk-line:last-child { margin-bottom: 0; }
        .ol-sk-line.w60 { width: 60%; }
        .ol-sk-line.w40 { width: 40%; }
        .ol-sk-line.w80 { width: 80%; }

        .ol-load-more {
          width: 100%; padding: 14px; text-align: center;
          font-size: 14px; color: var(--color-primary); font-weight: 500;
          display: flex; align-items: center; justify-content: center; gap: 4px;
          transition: background 0.25s; border-radius: var(--radius-sm);
        }
        .ol-load-more:hover { background: var(--color-primary-light); }
        .ol-end {
          text-align: center; font-size: 12px; color: var(--color-text-muted);
          padding: 20px 0;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @media (max-width: 480px) {
          .ol-card-body { flex-direction: column; align-items: center; text-align: center; }
          .ol-card-meta { justify-content: center; }
          .ol-card-footer { flex-direction: column; gap: 12px; }
          .ol-card-actions { width: 100%; justify-content: center; }
          .ol-tab { font-size: 13px; }
        }
      `}</style>
    </div>
  )
}

function OrderCard({ order, navigate }: { order: OrderItem; navigate: ReturnType<typeof useNavigate> }) {
  const cfg = statusConfig[order.status]
  const isActive = order.status === 'in_progress'

  return (
    <div className={`ol-card ${isActive ? 'in-progress' : ''}`} onClick={() => navigate(`/orders/${order.id}`)}>
      <div className="ol-card-header">
        <span className="ol-card-id">{order.id}</span>
        <span className="ol-status-badge" style={{ background: cfg?.bg, color: cfg?.color }}>
          {order.status === 'in_progress' && <span className="ol-status-dot" style={{ background: cfg?.color }} />}
          <span style={{ 
            width: 5, height: 5, borderRadius: '50%', 
            background: cfg?.color, display: 'inline-block',
            animation: order.status === 'in_progress' || order.status === 'pending_accept' ? 'pulse 2s ease infinite' : 'none',
          }} />
          {cfg?.label}
        </span>
      </div>

      <div className="ol-card-body">
        <span className="ol-card-emoji">{order.petEmoji}</span>
        <div className="ol-card-info">
          <div className="ol-card-service">
            {order.petName} · {order.serviceName}
          </div>
          <div className="ol-card-sitter">
            {order.sitterAvatar} {order.sitterName}
          </div>
          <div className="ol-card-meta">
            <span className="ol-meta-item"><Clock size={12} /> {order.date} {order.time}</span>
            <span className="ol-meta-item"><MapPin size={12} /> {order.address}</span>
            {order.status === 'pending_pay' && <CountdownTimer createdAt={order.createdAt} />}
          </div>
        </div>
      </div>

      <div className="ol-card-footer" onClick={e => e.stopPropagation()}>
        <span className="ol-card-price">
          合计 <strong>¥{order.price}</strong>
        </span>
        <div className="ol-card-actions">
          {order.status === 'pending_pay' && (
            <>
              <button className="ol-act-btn" onClick={() => alert('已取消订单')}>取消</button>
              <button className="ol-act-btn primary" onClick={() => alert('跳转支付')}>
                <CreditCard size={13} /> 去支付
              </button>
            </>
          )}
          {order.status === 'pending_accept' && (
            <>
              <button className="ol-act-btn danger" onClick={() => alert('已取消订单')}>取消</button>
              <button className="ol-act-btn" onClick={() => navigate(`/chat/${encodeURIComponent(order.sitterName)}`)}>
                <MessageCircle size={13} /> 联系
              </button>
            </>
          )}
          {(order.status === 'accepted' || order.status === 'in_progress') && (
            <button className="ol-act-btn" onClick={() => navigate(`/chat/${encodeURIComponent(order.sitterName)}`)}>
              <MessageCircle size={13} /> 联系服务者
            </button>
          )}
          {order.status === 'completed' && (
            <>
              <button className="ol-act-btn success" onClick={() => alert('跳转预约')}>
                <RotateCcw size={13} /> 再次预约
              </button>
              <button className="ol-act-btn primary" onClick={() => alert('跳转评价')}>
                <Star size={13} /> 去评价
              </button>
            </>
          )}
          {order.status === 'cancelled' && (
            <button className="ol-act-btn danger" onClick={() => alert('已删除')}>
              <Trash2 size={13} /> 删除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div className="ol-skeleton">
      <div className="ol-sk-line w40" />
      <div className="ol-sk-line w80" />
      <div className="ol-sk-line w60" />
    </div>
  )
}
