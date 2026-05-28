import { useState } from 'react'
import {
  LayoutDashboard, Users, Briefcase, ClipboardList, DollarSign,
  FileText, Settings, ChevronLeft, ChevronRight, Bell, Search,
  Menu, Star, TrendingUp, TrendingDown,
  AlertCircle, ArrowUpRight
} from 'lucide-react'
import UserManagement from './admin/UserManagement'
import SitterManagement from './admin/SitterManagement'
import OrderManagement from './admin/OrderManagement'
import FinanceStats from './admin/FinanceStats'
import ContentManagement from './admin/ContentManagement'
import SystemSettings from './admin/SystemSettings'

/* ── Mock Data ── */

const sidebarItems = [
  { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { key: 'users', label: '用户管理', icon: Users, badge: 3 },
  { key: 'sitters', label: '服务者管理', icon: Briefcase, badge: 8 },
  { key: 'orders', label: '订单管理', icon: ClipboardList },
  { key: 'finance', label: '财务统计', icon: DollarSign },
  { key: 'content', label: '内容管理', icon: FileText },
  { key: 'settings', label: '系统设置', icon: Settings },
]

const statsCards = [
  { label: '今日订单', value: '128', change: '+12.5%', up: true, icon: ClipboardList, color: '#FF7D5A' },
  { label: '今日营收', value: '¥12,560', change: '+8.3%', up: true, icon: DollarSign, color: '#45B7A0' },
  { label: '新增用户', value: '36', change: '+24.1%', up: true, icon: Users, color: '#4A90D9' },
  { label: '待审核', value: '8', change: '-2', up: false, icon: Briefcase, color: '#FFD93D' },
]

const chartData = [
  { day: '5/22', value: 82 }, { day: '5/23', value: 95 }, { day: '5/24', value: 110 },
  { day: '5/25', value: 88 }, { day: '5/26', value: 124 }, { day: '5/27', value: 106 },
  { day: '5/28', value: 128 },
]

const pendingItems = [
  { type: 'refund', label: '退款申请待审核', count: 3, severity: 'medium', icon: DollarSign },
  { type: 'sitter', label: '服务者入驻待审核', count: 8, severity: 'medium', icon: Briefcase },
  { type: 'complaint', label: '纠纷投诉待处理', count: 2, severity: 'high', icon: AlertCircle },
]

const topSitters = [
  { rank: 1, name: '张阿姨', avatar: '👩', rating: 4.9, orders: 128, satisfaction: '98%' },
  { rank: 2, name: '李明', avatar: '👨', rating: 4.8, orders: 96, satisfaction: '96%' },
  { rank: 3, name: '小王', avatar: '👩', rating: 4.9, orders: 203, satisfaction: '99%' },
  { rank: 4, name: '赵师傅', avatar: '👨', rating: 4.7, orders: 72, satisfaction: '95%' },
  { rank: 5, name: '陈姐', avatar: '👩', rating: 4.8, orders: 88, satisfaction: '97%' },
]

const recentOrders = [
  { id: 'ORD-20260528-001', user: '王女士', sitter: '张阿姨', service: '遛狗60min', amount: 79, status: 'completed', time: '10:32' },
  { id: 'ORD-20260528-002', user: '李先生', sitter: '李明', service: '上门喂猫', amount: 39, status: 'in_progress', time: '10:15' },
  { id: 'ORD-20260528-003', user: '刘先生', sitter: '小王', service: '宠物清洁', amount: 69, status: 'pending', time: '09:58' },
  { id: 'ORD-20260528-004', user: '赵女士', sitter: '张阿姨', service: '遛狗30min', amount: 49, status: 'cancelled', time: '09:30' },
  { id: 'ORD-20260528-005', user: '陈先生', sitter: '赵师傅', service: '遛狗60min', amount: 79, status: 'completed', time: '09:12' },
]

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: '已完成', color: '#45B7A0', bg: '#E8F8F4' },
  in_progress: { label: '服务中', color: '#3B82F6', bg: '#EFF6FF' },
  pending: { label: '待接单', color: '#D48806', bg: '#FFFBEB' },
  cancelled: { label: '已取消', color: '#FF6B6B', bg: '#FFF0F0' },
}

/* ── Main Component ── */

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [activeNav, setActiveNav] = useState('dashboard')

  const chartMax = Math.max(...chartData.map(d => d.value))

  return (
    <div className="ad-page">
      {/* ── Sidebar ── */}
      <aside className={`ad-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebar ? 'mobile-open' : ''}`}>
        <div className="ad-sb-header">
          <div className="ad-sb-logo">
            <span className="ad-sb-logo-icon">🐾</span>
            {!sidebarCollapsed && <span className="ad-sb-logo-text">PetCare Admin</span>}
          </div>
          <button className="ad-sb-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="ad-sb-nav">
          {sidebarItems.map(item => {
            const Icon = item.icon
            const active = activeNav === item.key
            return (
              <button
                key={item.key}
                className={`ad-sb-item ${active ? 'active' : ''}`}
                onClick={() => { setActiveNav(item.key); setMobileSidebar(false) }}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span className="ad-sb-item-label">{item.label}</span>}
                {item.badge && !sidebarCollapsed && (
                  <span className="ad-sb-item-badge">{item.badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="ad-sb-footer">
          <div className="ad-sb-admin">
            <span className="ad-sb-admin-avatar">👤</span>
            {!sidebarCollapsed && (
              <div>
                <span className="ad-sb-admin-name">管理员</span>
                <span className="ad-sb-admin-role">超级管理员</span>
              </div>
            )}
          </div>
        </div>

        {mobileSidebar && <div className="ad-sb-overlay" onClick={() => setMobileSidebar(false)} />}
      </aside>

      {/* ── Main Content ── */}
      <div className="ad-main">
        {/* Top Bar */}
        <header className="ad-topbar">
          <button className="ad-mobile-menu" onClick={() => setMobileSidebar(true)}>
            <Menu size={20} />
          </button>
          <div className="ad-topbar-search">
            <Search size={16} />
            <input type="text" placeholder="搜索订单、用户、服务者..." />
          </div>
          <div className="ad-topbar-actions">
            <button className="ad-topbar-btn">
              <Bell size={18} />
              <span className="ad-topbar-dot" />
            </button>
            <div className="ad-topbar-divider" />
            <span className="ad-topbar-avatar">👤</span>
            <span className="ad-topbar-name">管理员</span>
          </div>
        </header>

        {/* Content */}
        <div className="ad-content">
          {activeNav === 'dashboard' && (
            <>
              <div className="ad-page-header">
                <h1>仪表盘</h1>
                <p className="ad-page-date">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
              </div>
              <div className="ad-stats-grid">
                {statsCards.map(card => (
                  <div key={card.label} className="ad-stat-card">
                    <div className="ad-sc-top">
                      <span className="ad-sc-icon" style={{ background: `${card.color}15`, color: card.color }}><card.icon size={20} /></span>
                      <span className={`ad-sc-change ${card.up ? 'up' : 'down'}`}>{card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{card.change}</span>
                    </div>
                    <span className="ad-sc-value">{card.value}</span>
                    <span className="ad-sc-label">{card.label}</span>
                  </div>
                ))}
              </div>
              <div className="ad-row">
                <div className="ad-chart-card">
                  <div className="ad-card-header"><h3>近7日订单趋势</h3><span className="ad-card-meta">较上周 <strong style={{ color: 'var(--color-secondary)' }}>+12.3%</strong></span></div>
                  <div className="ad-chart"><div className="ad-chart-bars">{chartData.map((d, i) => (<div key={d.day} className="ad-chart-col"><span className="ad-chart-value">{d.value}</span><div className="ad-chart-bar-wrap"><div className="ad-chart-bar" style={{ height: `${(d.value / chartMax) * 100}%`, '--delay': `${i * 0.05}s` } as React.CSSProperties} /></div><span className="ad-chart-label">{d.day}</span></div>))}</div></div>
                </div>
                <div className="ad-pending-card">
                  <div className="ad-card-header"><h3>待处理事项</h3><span className="ad-card-meta">共 {pendingItems.reduce((s, i) => s + i.count, 0)} 项</span></div>
                  <div className="ad-pending-list">{pendingItems.map(item => (<div key={item.type} className="ad-pending-item"><div className={`ad-pi-icon ${item.severity}`}>{item.type === 'refund' && <DollarSign size={18} />}{item.type === 'sitter' && <Briefcase size={18} />}{item.type === 'complaint' && <AlertCircle size={18} />}</div><div className="ad-pi-body"><span className="ad-pi-label">{item.label}</span><span className="ad-pi-count">{item.count}笔</span></div><button className="ad-pi-btn"><ArrowUpRight size={16} /></button></div>))}</div>
                </div>
              </div>
              <div className="ad-row">
                <div className="ad-sitters-card">
                  <div className="ad-card-header"><h3>服务者 TOP5</h3></div>
                  <div className="ad-sitters-list">{topSitters.map(sitter => (<div key={sitter.rank} className="ad-sitter-item"><span className={`ad-si-rank ${sitter.rank <= 3 ? 'top' : ''}`}>{sitter.rank}</span><span className="ad-si-avatar">{sitter.avatar}</span><div className="ad-si-info"><span className="ad-si-name">{sitter.name}</span><span className="ad-si-stats"><Star size={11} fill="#FFD93D" color="#FFD93D" /> {sitter.rating} · {sitter.orders}单 · 好评{sitter.satisfaction}</span></div><span className="ad-si-badge">好评{sitter.satisfaction}</span></div>))}</div>
                </div>
                <div className="ad-orders-card">
                  <div className="ad-card-header"><h3>最新订单</h3><button className="ad-card-link">查看全部 <ArrowUpRight size={14} /></button></div>
                  <div className="ad-orders-table">
                    <div className="ad-ot-header"><span>订单号</span><span>用户</span><span>服务者</span><span>服务</span><span>金额</span><span>状态</span></div>
                    {recentOrders.map(order => { const st = statusMap[order.status]; return (<div key={order.id} className="ad-ot-row"><span className="ad-ot-id">{order.id}</span><span>{order.user}</span><span>{order.sitter}</span><span>{order.service}</span><span className="ad-ot-amount">¥{order.amount}</span><span className="ad-ot-status" style={{ background: st.bg, color: st.color }}>{st.label}</span></div>) })}
                  </div>
                </div>
              </div>
            </>
          )}
          {activeNav === 'users' && <UserManagement />}
          {activeNav === 'sitters' && <SitterManagement />}
          {activeNav === 'orders' && <OrderManagement />}
          {activeNav === 'finance' && <FinanceStats />}
          {activeNav === 'content' && <ContentManagement />}
          {activeNav === 'settings' && <SystemSettings />}
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        .ad-page {
          display: flex; min-height: 100vh; background: #F0F2F5;
          font-size: 14px;
        }

        /* Sidebar */
        .ad-sidebar {
          width: 240px; background: #1A1A2E; color: rgba(255,255,255,0.7);
          display: flex; flex-direction: column; flex-shrink: 0;
          transition: width 0.3s ease; position: fixed; top: 0; left: 0;
          bottom: 0; z-index: 100; overflow: hidden;
        }
        .ad-sidebar.collapsed { width: 60px; }

        .ad-sb-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px; height: 60px; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ad-sb-logo { display: flex; align-items: center; gap: 8px; }
        .ad-sb-logo-icon { font-size: 22px; }
        .ad-sb-logo-text { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; }

        .ad-sb-collapse {
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); transition: all 0.25s;
        }
        .ad-sb-collapse:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .ad-sidebar.collapsed .ad-sb-collapse { margin: 0 auto; }

        .ad-sb-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .ad-sb-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6); transition: all 0.2s ease;
          white-space: nowrap; position: relative;
        }
        .ad-sb-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .ad-sb-item.active {
          background: rgba(255,125,90,0.15); color: var(--color-primary);
        }
        .ad-sb-item.active::before {
          content: ''; position: absolute; left: -8px; top: 50%;
          transform: translateY(-50%); width: 3px; height: 20px;
          background: var(--color-primary); border-radius: 0 3px 3px 0;
        }
        .ad-sb-item-label { flex: 1; }
        .ad-sb-item-badge {
          padding: 1px 8px; border-radius: 100px; font-size: 11px;
          background: var(--color-error); color: #fff; line-height: 18px;
        }
        .ad-sidebar.collapsed .ad-sb-item { justify-content: center; padding: 10px 0; }
        .ad-sidebar.collapsed .ad-sb-item-badge {
          position: absolute; top: 4px; right: 6px; padding: 0 5px; font-size: 10px; line-height: 16px;
        }

        .ad-sb-footer {
          padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ad-sb-admin { display: flex; align-items: center; gap: 10px; }
        .ad-sb-admin-avatar { font-size: 24px; }
        .ad-sb-admin-name { display: block; font-size: 13px; font-weight: 600; color: #fff; }
        .ad-sb-admin-role { font-size: 11px; color: rgba(255,255,255,0.4); }
        .ad-sidebar.collapsed .ad-sb-admin { justify-content: center; }
        .ad-sidebar.collapsed .ad-sb-admin-name,
        .ad-sidebar.collapsed .ad-sb-admin-role { display: none; }

        /* Mobile overlay */
        .ad-sb-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          z-index: -1;
        }

        /* Main */
        .ad-main { flex: 1; margin-left: 240px; min-width: 0; transition: margin-left 0.3s ease; }
        .ad-sidebar.collapsed + .ad-main { margin-left: 60px; }

        /* Topbar */
        .ad-topbar {
          height: 60px; background: #fff; border-bottom: 1px solid #E8E8EC;
          display: flex; align-items: center; padding: 0 24px; gap: 16px;
          position: sticky; top: 0; z-index: 50;
        }
        .ad-mobile-menu { display: none; }
        .ad-topbar-search {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 8px;
          background: #F5F5F7; color: #9E9EB8; flex: 1; max-width: 320px;
        }
        .ad-topbar-search input {
          border: none; background: transparent; outline: none;
          font-size: 13px; color: var(--color-text); flex: 1; font-family: var(--font);
        }
        .ad-topbar-search input::placeholder { color: #9E9EB8; }

        .ad-topbar-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .ad-topbar-btn {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #5A5A7A; position: relative; transition: background 0.25s;
        }
        .ad-topbar-btn:hover { background: #F5F5F7; }
        .ad-topbar-dot {
          position: absolute; top: 8px; right: 8px;
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--color-error);
        }
        .ad-topbar-divider { width: 1px; height: 24px; background: #E8E8EC; }
        .ad-topbar-avatar { font-size: 24px; }
        .ad-topbar-name { font-size: 13px; font-weight: 600; color: var(--color-text); }

        /* Content */
        .ad-content { padding: 24px; max-width: 1200px; }
        .ad-page-header { margin-bottom: 24px; }
        .ad-page-header h1 { font-size: 22px; font-weight: 700; color: var(--color-text); }
        .ad-page-date { font-size: 13px; color: #9E9EB8; margin-top: 4px; }

        /* Stats */
        .ad-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .ad-stat-card {
          background: #fff; border-radius: 12px; padding: 20px;
          border: 1px solid #E8E8EC; transition: all 0.3s ease;
        }
        .ad-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.04); transform: translateY(-2px); }
        .ad-sc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ad-sc-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .ad-sc-change {
          display: flex; align-items: center; gap: 2px;
          font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 100px;
        }
        .ad-sc-change.up { color: #45B7A0; background: #E8F8F4; }
        .ad-sc-change.down { color: #FF6B6B; background: #FFF0F0; }
        .ad-sc-value { font-size: 28px; font-weight: 800; color: var(--color-text); display: block; margin-bottom: 4px; }
        .ad-sc-label { font-size: 13px; color: #9E9EB8; }

        /* Rows */
        .ad-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }

        /* Card base */
        .ad-card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px;
        }
        .ad-card-header h3 { font-size: 15px; font-weight: 700; color: var(--color-text); }
        .ad-card-meta { font-size: 12px; color: #9E9EB8; }
        .ad-card-link {
          display: flex; align-items: center; gap: 2px;
          font-size: 12px; font-weight: 600; color: var(--color-primary);
          transition: opacity 0.25s;
        }
        .ad-card-link:hover { opacity: 0.7; }

        /* Chart */
        .ad-chart-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #E8E8EC; }
        .ad-chart { padding-top: 8px; }
        .ad-chart-bars {
          display: flex; justify-content: space-between; align-items: flex-end;
          height: 140px; gap: 8px;
        }
        .ad-chart-col {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 6px; height: 100%;
        }
        .ad-chart-value { font-size: 10px; color: #9E9EB8; font-weight: 600; }
        .ad-chart-bar-wrap {
          flex: 1; width: 100%; display: flex;
          align-items: flex-end; justify-content: center;
        }
        .ad-chart-bar {
          width: 100%; max-width: 32px; border-radius: 4px 4px 0 0;
          background: var(--color-primary-gradient);
          min-height: 4px; transition: height 0.6s ease;
          animation: chartGrow 0.6s ease both;
          animation-delay: var(--delay, 0s);
        }
        .ad-chart-bar:hover { opacity: 0.8; }
        .ad-chart-label { font-size: 11px; color: #9E9EB8; }
        @keyframes chartGrow { from { height: 0 !important; } }

        /* Pending */
        .ad-pending-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #E8E8EC; }
        .ad-pending-list { display: flex; flex-direction: column; gap: 8px; }
        .ad-pending-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 10px;
          background: #F8F9FB; transition: background 0.25s;
        }
        .ad-pending-item:hover { background: #F0F2F5; }
        .ad-pi-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ad-pi-icon.medium { background: #FFF8E0; color: #D48806; }
        .ad-pi-icon.high { background: #FFF0F0; color: #FF6B6B; }
        .ad-pi-body { flex: 1; }
        .ad-pi-label { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .ad-pi-count { font-size: 12px; color: #9E9EB8; }
        .ad-pi-btn {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #9E9EB8; transition: all 0.25s;
        }
        .ad-pi-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }

        /* Sitters */
        .ad-sitters-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #E8E8EC; }
        .ad-sitters-list { display: flex; flex-direction: column; gap: 2px; }
        .ad-sitter-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 8px; border-radius: 8px; transition: background 0.25s;
        }
        .ad-sitter-item:hover { background: #F8F9FB; }
        .ad-si-rank {
          width: 24px; font-size: 13px; font-weight: 700;
          color: #9E9EB8; text-align: center;
        }
        .ad-si-rank.top { color: #FFD93D; }
        .ad-si-avatar { font-size: 24px; }
        .ad-si-info { flex: 1; }
        .ad-si-name { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .ad-si-stats { font-size: 11px; color: #9E9EB8; display: flex; align-items: center; gap: 2px; }
        .ad-si-badge {
          font-size: 11px; font-weight: 600; padding: 2px 10px;
          border-radius: 100px; background: var(--color-secondary-light);
          color: var(--color-secondary);
        }

        /* Orders */
        .ad-orders-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #E8E8EC; }
        .ad-orders-table { min-width: 0; }
        .ad-ot-header {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr 0.8fr 0.8fr;
          gap: 8px; padding: 8px 0; font-size: 11px; font-weight: 600;
          color: #9E9EB8; text-transform: uppercase; letter-spacing: 0.3px;
          border-bottom: 1px solid #E8E8EC;
        }
        .ad-ot-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr 0.8fr 0.8fr;
          gap: 8px; padding: 10px 0; font-size: 13px; color: var(--color-text);
          align-items: center; border-bottom: 1px solid #F0F2F5;
          transition: background 0.25s;
        }
        .ad-ot-row:hover { background: #F8F9FB; margin: 0 -8px; padding: 10px 8px; border-radius: 6px; }
        .ad-ot-row:last-child { border-bottom: none; }
        .ad-ot-id { font-size: 11px; color: #9E9EB8; font-weight: 500; }
        .ad-ot-amount { font-weight: 700; color: var(--color-primary); }
        .ad-ot-status {
          font-size: 11px; font-weight: 600; padding: 2px 10px;
          border-radius: 100px; text-align: center; display: inline-block;
          width: fit-content;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .ad-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-row { grid-template-columns: 1fr; }
          .ad-ot-header, .ad-ot-row {
            grid-template-columns: 1.2fr 0.8fr 0.8fr 1fr 0.7fr 0.7fr;
            font-size: 12px;
          }
        }

        @media (max-width: 768px) {
          .ad-mobile-menu { display: flex; }
          .ad-sidebar { transform: translateX(-100%); width: 240px !important; }
          .ad-sidebar.mobile-open { transform: translateX(0); }
          .ad-sidebar.collapsed { width: 240px !important; }
          .ad-main { margin-left: 0 !important; }
          .ad-sb-collapse { display: none; }
          .ad-sb-overlay { display: block; }
          .ad-topbar { padding: 0 16px; }
          .ad-topbar-search { max-width: none; }
          .ad-topbar-name { display: none; }
          .ad-content { padding: 16px; }
          .ad-stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .ad-sc-value { font-size: 22px; }
          .ad-ot-header, .ad-ot-row {
            grid-template-columns: 1fr 0.8fr 0.8fr;
          }
          .ad-ot-header span:nth-child(4),
          .ad-ot-header span:nth-child(5),
          .ad-ot-row span:nth-child(4),
          .ad-ot-row span:nth-child(5) { display: none; }
        }

        @media (max-width: 480px) {
          .ad-stats-grid { grid-template-columns: 1fr; }
          .ad-stat-card { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
