import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, DollarSign, CalendarCheck, Clock, ChevronRight, Star, Briefcase } from 'lucide-react'
import { api } from '../../utils/api'

const statusColor: Record<string, string> = {
  pending_accept: '#FF9F43', accepted: '#4A90D9', in_progress: '#45B7A0',
  completed: '#8E8EA0', cancelled: '#FF6B6B',
}

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 1000; const steps = 30; const increment = value / steps
    let current = 0; const id = setInterval(() => { current += increment; if (current >= value) { setDisplay(value); clearInterval(id) } else setDisplay(current) }, duration / steps)
    return () => clearInterval(id)
  }, [value])
  return <>{prefix}{Math.round(display).toLocaleString()}</>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [todayOrders, setTodayOrders] = useState<any[]>([])
  const [pendingOrders, setPendingOrders] = useState<any[]>([])

  useEffect(() => {
    api.get<any>('/wallet').then(d => setStats(d || {})).catch(() => setStats({}))
    api.get<any[]>('/orders/today').then(d => setTodayOrders(Array.isArray(d) ? d : [])).catch(() => setTodayOrders([]))
    api.get<any>('/orders?status=pending_accept&pageSize=5').then(d => {
      const arr = Array.isArray(d) ? d : d?.items || []
      setPendingOrders(arr)
    }).catch(() => setPendingOrders([]))
  }, [])

  const totalIncome = stats?.totalIncome || 0
  const todayInc = stats?.todayIncome || 0
  const weekInc = stats?.weekIncome || 0
  const monthInc = stats?.monthIncome || 0
  const totalOrders = stats?.totalOrders || 0

  return (
    <div className="sd-page">
      {/* Welcome Card */}
      <div className="sd-welcome">
        <div className="sd-welcome-text">
          <h2>今日概览</h2>
          <p>新的一天，继续为爱宠服务</p>
        </div>
        <div className="sd-welcome-badge">
          <CalendarCheck size={16} />
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="sd-stats">
        <div className="sd-stat-card primary">
          <div className="sd-stat-icon"><DollarSign size={18} /></div>
          <div className="sd-stat-body">
            <span className="sd-stat-value"><AnimatedNumber value={todayInc} prefix="¥" /></span>
            <span className="sd-stat-label">今日收入</span>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon week"><TrendingUp size={18} /></div>
          <div className="sd-stat-body">
            <span className="sd-stat-value"><AnimatedNumber value={weekInc} prefix="¥" /></span>
            <span className="sd-stat-label">本周收入</span>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon month"><DollarSign size={18} /></div>
          <div className="sd-stat-body">
            <span className="sd-stat-value"><AnimatedNumber value={monthInc} prefix="¥" /></span>
            <span className="sd-stat-label">本月收入</span>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon total"><Star size={18} /></div>
          <div className="sd-stat-body">
            <span className="sd-stat-value"><AnimatedNumber value={totalOrders} /></span>
            <span className="sd-stat-label">累计订单</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="sd-section">
        <div className="sd-section-header">
          <h3>今日日程</h3>
          <button className="sd-section-more" onClick={() => navigate('/sitter/orders')}>查看全部 <ChevronRight size={14} /></button>
        </div>
        {todayOrders.length === 0 ? (
          <div className="sd-empty">今天暂无服务安排</div>
        ) : (
          <div className="sd-timeline">
            {todayOrders.map((order: any) => (
              <div key={order.id} className="sd-tl-item" onClick={() => navigate(`/sitter/orders/${order.id}`)}>
                <div className="sd-tl-dot" style={{ background: statusColor[order.status] || '#8E8EA0' }} />
                <div className="sd-tl-body">
                  <div className="sd-tl-top">
                    <span className="sd-tl-service">{order.serviceName || order.service?.name || '宠物服务'}</span>
                    <span className="sd-tl-status" style={{ color: statusColor[order.status] || '#8E8EA0' }}>{order.status === 'pending_accept' ? '待接单' : order.status === 'accepted' ? '已接单' : order.status === 'in_progress' ? '服务中' : '已完成'}</span>
                  </div>
                  <div className="sd-tl-info">
                    <span>{order.petName || '宠物'} · {order.ownerName || '主人'}</span>
                    <span>{order.time || order.service_time || ''}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="sd-tl-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="sd-section">
          <div className="sd-section-header">
            <h3>待接订单</h3>
            <span className="sd-section-badge">{pendingOrders.length}</span>
          </div>
          <div className="sd-pending-list">
            {pendingOrders.map((order: any) => (
              <div key={order.id} className="sd-pending-item">
                <div className="sd-pi-top">
                  <span className="sd-pi-service">{order.serviceName || '宠物服务'}</span>
                  <span className="sd-pi-price">¥{order.total || order.totalPrice || 0}</span>
                </div>
                <div className="sd-pi-info">
                  <Clock size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : ''}
                </div>
                <div className="sd-pi-actions">
                  <button className="sd-btn sd-btn-primary" onClick={async () => { try { await api.put(`/orders/${order.id}/accept`); setPendingOrders(prev => prev.filter(o => o.id !== order.id)) } catch {} }}>
                    接单
                  </button>
                  <button className="sd-btn sd-btn-outline" onClick={async () => { try { await api.put(`/orders/${order.id}/reject`); setPendingOrders(prev => prev.filter(o => o.id !== order.id)) } catch {} }}>
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="sd-section">
        <div className="sd-section-header"><h3>快捷操作</h3></div>
        <div className="sd-actions">
          <button className="sd-action-card" onClick={() => navigate('/sitter/services')}>
            <div className="sd-action-icon" style={{ background: '#FFF0EB', color: '#FF7D5A' }}><Briefcase size={22} /></div>
            <span>管理服务</span>
          </button>
          <button className="sd-action-card" onClick={() => navigate('/sitter/wallet')}>
            <div className="sd-action-icon" style={{ background: '#E8F8F4', color: '#45B7A0' }}><DollarSign size={22} /></div>
            <span>查看收入</span>
          </button>
          <button className="sd-action-card" onClick={() => navigate('/sitter/schedule')}>
            <div className="sd-action-icon" style={{ background: '#EFF6FF', color: '#4A90D9' }}><CalendarCheck size={22} /></div>
            <span>日程安排</span>
          </button>
          <button className="sd-action-card" onClick={() => navigate('/sitter/profile')}>
            <div className="sd-action-icon" style={{ background: '#FFF8E0', color: '#FFD93D' }}><Star size={22} /></div>
            <span>我的资料</span>
          </button>
        </div>
      </div>

      <style>{`
        .sd-page { display: flex; flex-direction: column; gap: 16px; }
        .sd-welcome {
          background: linear-gradient(135deg, #FF7D5A, #FF9F7A); border-radius: 16px;
          padding: 20px; color: #fff; display: flex; justify-content: space-between;
          align-items: center;
        }
        .sd-welcome-text h2 { font-size: 20px; font-weight: 800; margin: 0; }
        .sd-welcome-text p { font-size: 13px; opacity: 0.85; margin: 4px 0 0; }
        .sd-welcome-badge {
          display: flex; align-items: center; gap: 4px; padding: 6px 12px;
          border-radius: 100px; background: rgba(255,255,255,0.2); font-size: 13px;
          font-weight: 600; white-space: nowrap;
        }
        .sd-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sd-stat-card {
          background: #fff; border-radius: 14px; padding: 16px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sd-stat-card.primary { background: linear-gradient(135deg, #FFF5F0, #FFE8E0); }
        .sd-stat-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,125,90,0.15); color: #FF7D5A; flex-shrink: 0;
        }
        .sd-stat-icon.week { background: rgba(69,183,160,0.15); color: #45B7A0; }
        .sd-stat-icon.month { background: rgba(74,144,217,0.15); color: #4A90D9; }
        .sd-stat-icon.total { background: rgba(255,217,61,0.2); color: #D4A800; }
        .sd-stat-body { display: flex; flex-direction: column; gap: 2px; }
        .sd-stat-value { font-size: 20px; font-weight: 800; color: #1A1A2E; line-height: 1.1; }
        .sd-stat-label { font-size: 12px; color: #8E8EA0; font-weight: 500; }
        .sd-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .sd-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .sd-section-header h3 { font-size: 15px; font-weight: 700; color: #1A1A2E; margin: 0; }
        .sd-section-more { display: flex; align-items: center; gap: 2px; font-size: 12px; color: #8E8EA0; cursor: pointer; }
        .sd-section-badge {
          padding: 2px 10px; border-radius: 100px; background: #FF7D5A; color: #fff;
          font-size: 12px; font-weight: 700;
        }
        .sd-empty { text-align: center; padding: 24px; color: #8E8EA0; font-size: 13px; }
        .sd-timeline { display: flex; flex-direction: column; gap: 0; }
        .sd-tl-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 0;
          border-bottom: 1px solid #F5F6FA; cursor: pointer;
        }
        .sd-tl-item:last-child { border-bottom: none; }
        .sd-tl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .sd-tl-body { flex: 1; }
        .sd-tl-top { display: flex; justify-content: space-between; align-items: center; }
        .sd-tl-service { font-size: 13px; font-weight: 600; color: #1A1A2E; }
        .sd-tl-status { font-size: 11px; font-weight: 600; }
        .sd-tl-info { display: flex; justify-content: space-between; font-size: 12px; color: #8E8EA0; margin-top: 2px; }
        .sd-tl-arrow { color: #D0D0D8; flex-shrink: 0; }
        .sd-pending-list { display: flex; flex-direction: column; gap: 8px; }
        .sd-pending-item {
          padding: 14px; border-radius: 12px; background: #FFFBF5;
          border: 1px solid #FFE8D0;
        }
        .sd-pi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .sd-pi-service { font-size: 13px; font-weight: 600; color: #1A1A2E; }
        .sd-pi-price { font-size: 16px; font-weight: 800; color: #FF7D5A; }
        .sd-pi-info { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #8E8EA0; margin-bottom: 10px; }
        .sd-pi-actions { display: flex; gap: 8px; }
        .sd-btn {
          flex: 1; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; text-align: center; transition: all 0.2s;
        }
        .sd-btn-primary { background: #FF7D5A; color: #fff; }
        .sd-btn-primary:hover { opacity: 0.9; }
        .sd-btn-outline { border: 1px solid #EEEEF2; color: #8E8EA0; }
        .sd-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .sd-action-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 16px 12px; border-radius: 12px; background: #FAFBFC;
          cursor: pointer; transition: all 0.2s;
        }
        .sd-action-card:hover { background: #F0F2F5; }
        .sd-action-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .sd-action-card span { font-size: 12px; font-weight: 600; color: #1A1A2E; }
      `}</style>
    </div>
  )
}
