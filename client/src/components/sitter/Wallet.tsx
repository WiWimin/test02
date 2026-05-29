import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { api } from '../../utils/api'

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

export default function Wallet() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get<any>('/wallet').then(setData).catch(() => {})
  }, [])

  const stats = [
    { label: '今日收入', value: data?.todayIncome || 0, icon: DollarSign, color: '#FF7D5A' },
    { label: '本周收入', value: data?.weekIncome || 0, icon: TrendingUp, color: '#45B7A0' },
    { label: '本月收入', value: data?.monthIncome || 0, icon: TrendingUp, color: '#4A90D9' },
    { label: '累计收入', value: data?.totalIncome || 0, icon: DollarSign, color: '#FFD93D' },
  ]

  return (
    <div className="sw-page">
      <div className="sw-header">
        <h2>我的收入</h2>
        <p>累计接单 <strong>{data?.totalOrders || 0}</strong> 单</p>
      </div>

      <div className="sw-stats">
        {stats.map(s => (
          <div key={s.label} className="sw-stat-card">
            <div className="sw-stat-icon" style={{ background: s.color + '15', color: s.color }}><s.icon size={16} /></div>
            <div className="sw-stat-body">
              <span className="sw-stat-value"><AnimatedNumber value={s.value} prefix="¥" /></span>
              <span className="sw-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sw-section">
        <div className="sw-section-header"><h3>收入趋势</h3></div>
        {data?.weeklyData && data.weeklyData.length > 0 ? (
          <div className="sw-chart">
            {data.weeklyData.map((d: any, i: number) => {
              const max = Math.max(...data.weeklyData.map((x: any) => x.amount || 0), 1)
              const h = ((d.amount || 0) / max) * 100
              return (
                <div key={i} className="sw-chart-col">
                  <span className="sw-chart-value">¥{d.amount || 0}</span>
                  <div className="sw-chart-bar-wrap"><div className="sw-chart-bar" style={{ height: h + '%' }} /></div>
                  <span className="sw-chart-label">{d.day || d.date || ''}</span>
                </div>
              )
            })}
          </div>
        ) : <p className="sw-empty">暂无趋势数据</p>}
      </div>

      <div className="sw-section">
        <div className="sw-section-header"><h3>最近交易</h3></div>
        {data?.transactions && data.transactions.length > 0 ? data.transactions.slice(0, 5).map((tx: any) => (
          <div key={tx.id} className="sw-tx-item">
            <div className="sw-tx-icon" style={{ background: tx.type === 'income' ? '#E8F8F4' : '#FFF0F0' }}>
              {tx.type === 'income' ? <TrendingUp size={14} style={{ color: '#45B7A0' }} /> : <TrendingDown size={14} style={{ color: '#FF6B6B' }} />}
            </div>
            <div className="sw-tx-info">
              <span className="sw-tx-name">{tx.description || tx.serviceName || '服务收入'}</span>
              <span className="sw-tx-time">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
            <span className={'sw-tx-amount ' + (tx.type === 'income' ? 'income' : 'expense')}>
              {tx.type === 'income' ? '+' : '-'}¥{tx.amount || 0}
            </span>
          </div>
        )) : <p className="sw-empty">暂无交易记录</p>}
      </div>

      <style>{'.sw-page { display: flex; flex-direction: column; gap: 12px; } .sw-header h2 { font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0; } .sw-header p { font-size: 13px; color: #8E8EA0; margin: 4px 0 0; } .sw-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } .sw-stat-card { background: #fff; border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .sw-stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; } .sw-stat-body { display: flex; flex-direction: column; gap: 1px; } .sw-stat-value { font-size: 17px; font-weight: 800; color: #1A1A2E; } .sw-stat-label { font-size: 11px; color: #8E8EA0; } .sw-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .sw-section-header { margin-bottom: 12px; } .sw-section-header h3 { font-size: 14px; font-weight: 700; color: #1A1A2E; margin: 0; } .sw-empty { text-align: center; padding: 20px; color: #8E8EA0; font-size: 12px; } .sw-chart { display: flex; justify-content: space-between; align-items: flex-end; height: 100px; gap: 6px; } .sw-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; } .sw-chart-value { font-size: 9px; color: #8E8EA0; } .sw-chart-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; } .sw-chart-bar { width: 100%; max-width: 24px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, #FF7D5A, #FF9F7A); min-height: 2px; transition: height 0.5s ease; } .sw-chart-label { font-size: 9px; color: #8E8EA0; } .sw-tx-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F5F6FA; } .sw-tx-item:last-child { border-bottom: none; } .sw-tx-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; } .sw-tx-info { flex: 1; } .sw-tx-name { display: block; font-size: 13px; font-weight: 600; color: #1A1A2E; } .sw-tx-time { font-size: 11px; color: #8E8EA0; } .sw-tx-amount { font-size: 14px; font-weight: 700; } .sw-tx-amount.income { color: #45B7A0; } .sw-tx-amount.expense { color: #FF6B6B; }'}</style>
    </div>
  )
}
