import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, MapPin, Phone, MessageCircle, Calendar, DollarSign,
  TrendingUp, Users, Check, X, Bell, AlertCircle
} from 'lucide-react'

const sitterInfo = {
  name: '张阿姨', avatar: '👩', bgColor: '#FFF0EB',
  level: '金牌服务者', rating: 4.9, completedOrders: 287,
}

const incomeStats = [
  { label: '今日收入', value: 320, icon: DollarSign, color: '#FF7D5A', orders: 3, change: '+12%', up: true },
  { label: '本周收入', value: 1280, icon: TrendingUp, color: '#45B7A0', orders: 16, change: '+8%', up: true },
  { label: '本月收入', value: 4560, icon: Calendar, color: '#4A90D9', orders: 58, change: '+15%', up: true },
  { label: '总收入', value: 22300, icon: Users, color: '#9B59B6', orders: 287, change: '+22%', up: true },
]

const todaySchedule = [
  { id: 'sched-1', time: '09:00', endTime: '10:00', petEmoji: '🐕', petName: '豆豆', serviceName: '遛狗 60分钟', address: '望京SOHO T3 1808', ownerName: '李先生', ownerPhone: '138****8888', status: 'completed' },
  { id: 'sched-2', time: '10:00', endTime: '11:00', petEmoji: '🐕', petName: '可乐', serviceName: '遛狗 60分钟', address: '华润橡树湾5-2-801', ownerName: '可乐妈妈', ownerPhone: '139****1234', status: 'in_progress' },
  { id: 'sched-3', time: '14:00', endTime: '14:30', petEmoji: '🐈', petName: '咪咪', serviceName: '上门喂食', address: '融泽嘉园12号院3-1206', ownerName: '咪咪爸爸', ownerPhone: '136****5678', status: 'pending' },
  { id: 'sched-4', time: '16:00', endTime: '17:00', petEmoji: '🐕', petName: '团子', serviceName: '遛狗+清洁', address: '华联商场后侧2-302', ownerName: '团子妈妈', ownerPhone: '137****9012', status: 'pending' },
  { id: 'sched-5', time: '19:00', endTime: '20:00', petEmoji: '🐈', petName: '花花', serviceName: '上门喂猫', address: '望京西园三区502', ownerName: '花花主人', ownerPhone: '158****3456', status: 'pending' },
]

const pendingOrders = [
  { id: 'po-1', ownerName: '王女士', petEmoji: '🐕', petName: '大毛', serviceName: '遛狗 30分钟', price: 49, timeLeft: 12, createdAt: Date.now() },
  { id: 'po-2', ownerName: '刘先生', petEmoji: '🐈', petName: '雪球', serviceName: '上门喂猫', price: 39, timeLeft: 8, createdAt: Date.now() },
]

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval>>()
  useEffect(() => {
    let start = 0; const duration = 800; const step = Math.max(1, Math.floor(value / 30))
    ref.current = setInterval(() => {
      start += step; if (start >= value) { setDisplay(value); clearInterval(ref.current) } else setDisplay(start)
    }, value > 0 ? duration / (value / step) : 0)
    return () => clearInterval(ref.current)
  }, [value])
  return <>{display.toLocaleString()}{suffix}</>
}

function OrderCountdown({ createdAt }: { createdAt: number }) {
  const [remaining, setRemaining] = useState(15 * 60)
  useEffect(() => {
    const end = createdAt + 15 * 60 * 1000
    const tick = () => { const r = Math.max(0, Math.floor((end - Date.now()) / 1000)); setRemaining(r) }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [createdAt])
  const m = Math.floor(remaining / 60); const s = remaining % 60
  if (remaining <= 0) return <span className="sd-countdown expired">已过期</span>
  return <span className={`sd-countdown ${remaining < 120 ? 'urgent' : ''}`}>🕐 {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</span>
}

export default function SitterDashboard() {
  const navigate = useNavigate()
  const [activeService, setActiveService] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(pendingOrders)
  const [sidebarTab, setSidebarTab] = useState<'todo' | 'notifications'>('todo')

  const handleStartService = (id: string) => {
    setActiveService(id); setTimeout(() => setActiveService(null), 2000)
    alert('📍 已签到！开始服务\n位置记录已开启')
  }
  const handleAcceptOrder = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))
  const handleRejectOrder = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))

  const getScheduleStatus = (status: string) => {
    switch (status) {
      case 'completed': return { label: '已完成', color: '#9E9EB8', bg: '#F5F5F7' }
      case 'in_progress': return { label: '服务中', color: '#45B7A0', bg: '#E8F8F4' }
      default: return { label: '待服务', color: '#3B82F6', bg: '#EFF6FF' }
    }
  }

  return (
    <div className="sd-page">
      <section className="sd-income-section">
        <div className="sd-income-grid">
          {incomeStats.map((stat, i) => (
            <div key={stat.label} className="sd-income-card" style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}>
              <div className="sd-ic-top">
                <span className="sd-ic-label">{stat.label}</span>
                <div className="sd-ic-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div className="sd-ic-value">
                <span className="sd-ic-sign">¥</span>
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="sd-ic-footer">
                <span className="sd-ic-orders">{stat.orders}单</span>
                <span className={`sd-ic-change ${stat.up ? 'up' : 'down'}`}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sd-main-section">
        <div className="sd-main-layout">
          <div className="sd-schedule">
            <div className="sd-schedule-header">
              <h2><Calendar size={18} /> 今日日程</h2>
              <span className="sd-schedule-date">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
            </div>
            <div className="sd-schedule-list">
              {todaySchedule.map((item, i) => {
                const statusInfo = getScheduleStatus(item.status); const isNow = item.status === 'in_progress'
                return (
                  <div key={item.id} className={`sd-sched-item ${isNow ? 'active' : ''} ${item.status === 'completed' ? 'done' : ''}`}>
                    <div className="sd-si-timeline">
                      <div className={`sd-si-dot ${isNow ? 'pulse' : ''} ${item.status === 'completed' ? 'done' : ''}`} />
                      {i < todaySchedule.length - 1 && <div className="sd-si-line" />}
                    </div>
                    <div className="sd-si-card">
                      <div className="sd-si-top">
                        <span className="sd-si-time"><Clock size={13} /> {item.time} - {item.endTime}</span>
                        <span className="sd-si-status" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                          {isNow && <span className="sd-si-pulse-dot" />}{statusInfo.label}
                        </span>
                      </div>
                      <div className="sd-si-body">
                        <span className="sd-si-emoji">{item.petEmoji}</span>
                        <div className="sd-si-info">
                          <span className="sd-si-service">{item.serviceName} · {item.petName}</span>
                          <span className="sd-si-address"><MapPin size={12} /> {item.address}</span>
                          <span className="sd-si-owner">主人: {item.ownerName} {item.ownerPhone}</span>
                        </div>
                      </div>
                      <div className="sd-si-actions">
                        <button className="sd-si-btn icon" onClick={() => alert(`拨打 ${item.ownerPhone}`)}><Phone size={15} /></button>
                        <button className="sd-si-btn icon" onClick={() => navigate(`/chat/${item.id}`)}><MessageCircle size={15} /></button>
                        {item.status !== 'completed' && (
                          <button className={`sd-si-btn primary ${isNow ? 'pulsing' : ''}`} onClick={() => handleStartService(item.id)}>
                            {isNow ? '📍 服务中' : '开始服务'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="sd-sidebar">
            <div className="sd-sb-tabs">
              <button className={`sd-sb-tab ${sidebarTab === 'todo' ? 'active' : ''}`} onClick={() => setSidebarTab('todo')}>
                今日待办 <span className="sd-sb-tab-badge">{todaySchedule.filter(s => s.status === 'pending').length}</span>
              </button>
              <button className={`sd-sb-tab ${sidebarTab === 'notifications' ? 'active' : ''}`} onClick={() => setSidebarTab('notifications')}>
                新订单 <span className="sd-sb-tab-badge urgent">{notifications.length}</span>
              </button>
            </div>
            {sidebarTab === 'todo' && (
              <div className="sd-sb-content">
                <div className="sd-todo-list">
                  {todaySchedule.filter(s => s.status === 'pending').length === 0 ? (
                    <div className="sd-todo-empty">🎉 今日所有服务已完成</div>
                  ) : (
                    todaySchedule.filter(s => s.status === 'pending').map(item => (
                      <div key={item.id} className="sd-todo-item">
                        <div className="sd-todo-time"><Clock size={13} /> {item.time} - {item.endTime}</div>
                        <div className="sd-todo-body">
                          <span className="sd-todo-emoji">{item.petEmoji}</span>
                          <div className="sd-todo-info">
                            <span className="sd-todo-service">{item.serviceName}</span>
                            <span className="sd-todo-address"><MapPin size={11} /> {item.address}</span>
                          </div>
                        </div>
                        <button className="sd-todo-btn" onClick={() => handleStartService(item.id)}>开始服务</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {sidebarTab === 'notifications' && (
              <div className="sd-sb-content">
                {notifications.length === 0 ? (
                  <div className="sd-todo-empty">✅ 暂无新订单</div>
                ) : (
                  <div className="sd-notif-list">
                    {notifications.map(order => (
                      <div key={order.id} className="sd-notif-card">
                        <div className="sd-notif-header">
                          <span className="sd-notif-icon">📩</span>
                          <span className="sd-notif-title">新订单来了！</span>
                          <OrderCountdown createdAt={order.createdAt} />
                        </div>
                        <div className="sd-notif-body">
                          <span className="sd-notif-emoji">{order.petEmoji}</span>
                          <div className="sd-notif-info">
                            <span className="sd-notif-name">{order.ownerName} · {order.petName}</span>
                            <span className="sd-notif-service">{order.serviceName}</span>
                            <span className="sd-notif-price">¥{order.price}</span>
                          </div>
                        </div>
                        <div className="sd-notif-actions">
                          <button className="sd-notif-btn reject" onClick={() => handleRejectOrder(order.id)}><X size={15} /> 拒单</button>
                          <button className="sd-notif-btn accept" onClick={() => handleAcceptOrder(order.id)}><Check size={15} /> 接单</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .sd-income-section { margin-bottom: 20px; }
        .sd-income-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .sd-income-card {
          background: #fff; border-radius: var(--radius-md);
          padding: 18px 20px; border: 1px solid var(--color-border);
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease both;
          animation-delay: var(--delay, 0s);
        }
        .sd-income-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .sd-ic-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .sd-ic-label { font-size: 13px; color: var(--color-text-muted); font-weight: 500; }
        .sd-ic-icon { width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
        .sd-ic-value { font-size: 26px; font-weight: 800; color: var(--color-text); margin-bottom: 4px; }
        .sd-ic-sign { font-size: 16px; margin-right: 2px; color: var(--color-text-muted); }
        .sd-ic-footer { display: flex; align-items: center; gap: 8px; }
        .sd-ic-orders { font-size: 12px; color: var(--color-text-muted); }
        .sd-ic-change { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
        .sd-ic-change.up { background: #E8F8F4; color: #45B7A0; }
        .sd-ic-change.down { background: #FFF0F0; color: #FF6B6B; }
        .sd-main-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        .sd-schedule { min-width: 0; }
        .sd-schedule-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .sd-schedule-header h2 { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--color-text); }
        .sd-schedule-date { font-size: 13px; color: var(--color-text-muted); }
        .sd-schedule-list { display: flex; flex-direction: column; gap: 0; }
        .sd-sched-item { display: flex; gap: 16px; position: relative; animation: fadeIn 0.4s ease; }
        .sd-si-timeline { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; padding-top: 6px; }
        .sd-si-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--color-border); border: 3px solid var(--color-bg); flex-shrink: 0; z-index: 1; }
        .sd-si-dot.pulse { background: var(--color-secondary); box-shadow: 0 0 0 4px rgba(69,183,160,0.2); animation: pulse 2s ease infinite; }
        .sd-si-dot.done { background: var(--color-secondary); }
        .sd-si-line { width: 2px; flex: 1; background: var(--color-border); min-height: 20px; }
        .sd-si-card { flex: 1; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px 18px; margin-bottom: 12px; transition: all 0.3s ease; }
        .sd-sched-item.active .sd-si-card { border-color: var(--color-secondary); box-shadow: 0 0 0 1px rgba(69,183,160,0.15); }
        .sd-sched-item.done .sd-si-card { opacity: 0.7; }
        .sd-si-card:hover { box-shadow: var(--shadow-sm); }
        .sd-si-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .sd-si-time { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .sd-si-status { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .sd-si-pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 1.5s ease infinite; }
        .sd-si-body { display: flex; gap: 12px; align-items: flex-start; }
        .sd-si-emoji { font-size: 28px; flex-shrink: 0; }
        .sd-si-info { display: flex; flex-direction: column; gap: 3px; }
        .sd-si-service { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .sd-si-address, .sd-si-owner { font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
        .sd-si-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border); }
        .sd-si-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; transition: all 0.25s; border: 1px solid var(--color-border); color: var(--color-text-secondary); }
        .sd-si-btn.icon { padding: 7px 10px; }
        .sd-si-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }
        .sd-si-btn.primary { background: var(--color-primary-gradient); color: #fff; border-color: transparent; box-shadow: 0 3px 10px rgba(255,125,90,0.25); }
        .sd-si-btn.primary:hover { box-shadow: 0 6px 20px rgba(255,125,90,0.35); transform: translateY(-1px); }
        .sd-si-btn.primary.pulsing { animation: pulse 2s ease infinite; }
        .sd-sidebar { position: sticky; top: 84px; }
        .sd-sb-tabs { display: flex; background: var(--color-bg-alt); border-radius: var(--radius-sm); padding: 4px; margin-bottom: 16px; border: 1px solid var(--color-border); }
        .sd-sb-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 6px; font-size: 13px; font-weight: 600; color: var(--color-text-muted); border-radius: 6px; transition: all 0.3s ease; }
        .sd-sb-tab.active { background: #fff; color: var(--color-text); box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .sd-sb-tab-badge { font-size: 11px; padding: 0 7px; border-radius: 100px; background: var(--color-border); color: var(--color-text-muted); line-height: 18px; }
        .sd-sb-tab-badge.urgent { background: var(--color-error); color: #fff; }
        .sd-sb-content { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; }
        .sd-todo-list { display: flex; flex-direction: column; gap: 10px; }
        .sd-todo-empty { text-align: center; padding: 32px 16px; font-size: 14px; color: var(--color-text-muted); }
        .sd-todo-item { background: var(--color-bg); border-radius: var(--radius-sm); padding: 14px; border: 1px solid var(--color-border); transition: all 0.25s; }
        .sd-todo-item:hover { border-color: var(--color-primary); }
        .sd-todo-time { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; }
        .sd-todo-body { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
        .sd-todo-emoji { font-size: 24px; }
        .sd-todo-info { display: flex; flex-direction: column; gap: 2px; }
        .sd-todo-service { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .sd-todo-address { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 3px; }
        .sd-todo-btn { width: 100%; padding: 8px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; text-align: center; background: var(--color-primary-gradient); color: #fff; transition: all 0.25s; }
        .sd-todo-btn:hover { box-shadow: 0 4px 12px rgba(255,125,90,0.3); }
        .sd-notif-list { display: flex; flex-direction: column; gap: 12px; }
        .sd-notif-card { background: #fff; border-radius: var(--radius-sm); padding: 14px; border: 1px solid var(--color-border); box-shadow: 0 2px 8px rgba(255,125,90,0.06); animation: expandIn 0.35s ease; }
        .sd-notif-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--color-border); }
        .sd-notif-icon { font-size: 16px; }
        .sd-notif-title { font-size: 13px; font-weight: 700; color: var(--color-text); flex: 1; }
        .sd-countdown { font-size: 12px; font-weight: 700; color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
        .sd-countdown.urgent { color: var(--color-error); animation: pulse 1.5s ease infinite; }
        .sd-countdown.expired { color: var(--color-text-muted); }
        .sd-notif-body { display: flex; gap: 10px; margin-bottom: 12px; }
        .sd-notif-emoji { font-size: 24px; }
        .sd-notif-info { display: flex; flex-direction: column; gap: 2px; }
        .sd-notif-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .sd-notif-service { font-size: 12px; color: var(--color-text-muted); }
        .sd-notif-price { font-size: 16px; font-weight: 800; color: var(--color-primary); }
        .sd-notif-actions { display: flex; gap: 8px; }
        .sd-notif-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 9px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; transition: all 0.25s; }
        .sd-notif-btn.accept { background: var(--color-primary-gradient); color: #fff; box-shadow: 0 3px 10px rgba(255,125,90,0.2); }
        .sd-notif-btn.accept:hover { box-shadow: 0 6px 20px rgba(255,125,90,0.3); }
        .sd-notif-btn.reject { border: 1px solid var(--color-border); color: var(--color-text-secondary); }
        .sd-notif-btn.reject:hover { border-color: var(--color-error); color: var(--color-error); background: #FFF0F0; }
        @media (max-width: 1024px) { .sd-main-layout { grid-template-columns: 1fr; } .sd-sidebar { position: static; } }
        @media (max-width: 768px) { .sd-income-grid { grid-template-columns: repeat(2, 1fr); } .sd-si-body { flex-direction: column; align-items: center; text-align: center; } .sd-si-info { align-items: center; } .sd-si-actions { justify-content: center; flex-wrap: wrap; } }
        @media (max-width: 480px) { .sd-income-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .sd-income-card { padding: 14px 16px; } .sd-ic-value { font-size: 22px; } }
      `}</style>
    </div>
  )
}
