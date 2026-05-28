import { useState } from 'react'
import { DollarSign, Calendar, TrendingUp, Users, Download, ArrowUpRight } from 'lucide-react'

const stats = [
  { label: '今日收入', value: 320, change: '+12%', up: true, icon: DollarSign, color: '#FF7D5A' },
  { label: '本周收入', value: 1280, change: '+8%', up: true, icon: TrendingUp, color: '#45B7A0' },
  { label: '本月收入', value: 4560, change: '+15%', up: true, icon: Calendar, color: '#4A90D9' },
  { label: '总收入', value: 22300, change: '+22%', up: true, icon: Users, color: '#9B59B6' },
]

const weeklyData = [
  { day: '05/22', value: 120 }, { day: '05/23', value: 80 },
  { day: '05/24', value: 160 }, { day: '05/25', value: 200 },
  { day: '05/26', value: 90 }, { day: '05/27', value: 140 },
  { day: '05/28', value: 180 },
]

const transactions = [
  { id: 'tx-1', type: 'income' as const, petEmoji: '🐕', petName: '豆豆', serviceName: '遛狗 60分钟', amount: 79, date: '05/28 10:00', settled: true },
  { id: 'tx-2', type: 'income' as const, petEmoji: '🐈', petName: '咪咪', serviceName: '上门喂猫', amount: 39, date: '05/28 14:00', settled: true },
  { id: 'tx-3', type: 'income' as const, petEmoji: '🐕', petName: '可乐', serviceName: '遛狗 60分钟', amount: 69, date: '05/27 09:00', settled: true },
  { id: 'tx-4', type: 'income' as const, petEmoji: '🐕', petName: '团子', serviceName: '遛狗+清洁', amount: 99, date: '05/26 16:00', settled: true },
  { id: 'tx-5', type: 'withdraw' as const, petEmoji: '💳', petName: '', serviceName: '提现', amount: -200, date: '05/25 10:00', settled: true },
]

const maxVal = Math.max(...weeklyData.map(d => d.value))

export default function Wallet() {
  const [period, setPeriod] = useState('week')

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1>收入明细</h1>
        <button className="wl-withdraw-btn" onClick={() => alert('申请提现')}>
          <Download size={14} /> 申请提现
        </button>
      </div>

      <div className="wl-stats-grid">
        {stats.map((stat, i) => (
          <div key={stat.label} className="wl-stat-card" style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}>
            <div className="wl-sc-top">
              <span className="wl-sc-label">{stat.label}</span>
              <div className="wl-sc-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={16} />
              </div>
            </div>
            <div className="wl-sc-value">¥{stat.value.toLocaleString()}</div>
            <div className="wl-sc-footer">
              <span className={`wl-sc-change ${stat.up ? 'up' : 'down'}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="wl-card">
        <div className="wl-card-hdr">
          <h3>收入趋势</h3>
          <div className="wl-period-tabs">
            <button className={`wl-pt-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>周</button>
            <button className={`wl-pt-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>月</button>
          </div>
        </div>
        <div className="wl-chart">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="wl-chart-col">
              <div className="wl-chart-bar-track">
                <div className="wl-chart-bar" style={{ height: `${(d.value / maxVal) * 100}%`, '--delay': `${i * 0.05}s` } as React.CSSProperties} />
              </div>
              <span className="wl-chart-lbl">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wl-card">
        <div className="wl-card-hdr"><h3>最近流水</h3></div>
        <div className="wl-tx-list">
          {transactions.map(tx => (
            <div key={tx.id} className="wl-tx-item">
              <span className="wl-tx-icon">{tx.petEmoji}</span>
              <div className="wl-tx-body">
                <span className="wl-tx-service">{tx.petName ? `${tx.serviceName} · ${tx.petName}` : tx.serviceName}</span>
                <span className="wl-tx-date">{tx.date}</span>
              </div>
              <span className={`wl-tx-amount ${tx.amount > 0 ? 'income' : 'withdraw'}`}>
                {tx.amount > 0 ? '+' : ''}¥{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .wl-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .wl-header h1 { font-size: 20px; font-weight: 800; color: var(--color-text); margin: 0; }
        .wl-withdraw-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: var(--radius-sm); background: var(--color-primary-gradient); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .wl-withdraw-btn:hover { box-shadow: 0 4px 14px rgba(255,125,90,0.3); transform: translateY(-1px); }
        .wl-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .wl-stat-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; animation: fadeInUp 0.5s ease both; animation-delay: var(--delay, 0s); }
        .wl-sc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .wl-sc-label { font-size: 12px; color: var(--color-text-muted); font-weight: 500; }
        .wl-sc-icon { width: 30px; height: 30px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
        .wl-sc-value { font-size: 22px; font-weight: 800; color: var(--color-text); margin-bottom: 4px; }
        .wl-sc-change { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
        .wl-sc-change.up { background: #E8F8F4; color: #45B7A0; }
        .wl-sc-change.down { background: #FFF0F0; color: #FF6B6B; }
        .wl-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; margin-bottom: 14px; }
        .wl-card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .wl-card-hdr h3 { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
        .wl-period-tabs { display: flex; gap: 4px; background: var(--color-bg-alt); border-radius: 6px; padding: 3px; }
        .wl-pt-btn { padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: var(--color-text-muted); transition: all 0.25s; }
        .wl-pt-btn.active { background: #fff; color: var(--color-text); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .wl-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; padding-top: 8px; }
        .wl-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
        .wl-chart-bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
        .wl-chart-bar { width: 100%; max-width: 32px; margin: 0 auto; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--color-primary), #FFB39A); animation: expandIn 0.6s ease both; animation-delay: var(--delay, 0s); }
        .wl-chart-lbl { font-size: 10px; color: var(--color-text-muted); }
        .wl-tx-list { display: flex; flex-direction: column; gap: 0; }
        .wl-tx-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--color-border); }
        .wl-tx-item:last-child { border-bottom: none; }
        .wl-tx-icon { font-size: 24px; flex-shrink: 0; }
        .wl-tx-body { flex: 1; min-width: 0; }
        .wl-tx-service { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .wl-tx-date { display: block; font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
        .wl-tx-amount { font-size: 15px; font-weight: 800; white-space: nowrap; }
        .wl-tx-amount.income { color: var(--color-secondary); }
        .wl-tx-amount.withdraw { color: var(--color-error); }
        @media (max-width: 768px) { .wl-stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  )
}
