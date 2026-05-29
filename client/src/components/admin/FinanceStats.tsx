import { useState, useEffect } from 'react'
import { TrendingUp, Download, DollarSign, Users, Percent, BarChart3, Wallet, CreditCard, Calendar, ChevronDown } from 'lucide-react'
import { api } from '../../utils/api'



const chartColors = ['#FF7D5A', '#45B7A0', '#4A90D9', '#FFD93D', '#9B59B6']

export default function FinanceStats() {
  const [chartTab, setChartTab] = useState<'revenue' | 'commission' | 'orders'>('revenue')
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  useEffect(() => { api.get<any>('/admin/finance').then(data => { setMonthlyData(data.monthlyData || []); setRecentTransactions(data.recentTransactions || []) }).catch(() => {}) }, [])
  const chartMax = Math.max(...monthlyData.map(d => d.revenue), 1)

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0)
  const totalCommission = monthlyData.reduce((s, d) => s + d.commission, 0)
  const totalPayout = monthlyData.reduce((s, d) => s + d.payout, 0)
  const totalOrders = monthlyData.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="fs-page">
      <div className="fs-page-hdr">
        <div><h1>财务统计</h1><p className="fs-subtitle">2026年1-5月 · 总营收 ¥{(totalRevenue / 10000).toFixed(1)}万 · 总订单 {totalOrders} 单</p></div>
        <div className="fs-hdr-actions">
          <button className="fs-export-btn" onClick={() => alert('导出报表')}><Download size={15} /> 导出报表</button>
          <div className="fs-date-picker"><Calendar size={14} /> 2026年1月 - 5月 <ChevronDown size={12} /></div>
        </div>
      </div>

      <div className="fs-stats-grid">
        <div className="fs-stat-card fs-stat-revenue">
          <div className="fs-sc-top"><span className="fs-sc-label">总营收</span><span className="fs-sc-icon"><DollarSign size={20} /></span></div>
          <span className="fs-sc-value">¥{(totalRevenue / 10000).toFixed(1)}万</span>
          <span className="fs-sc-change up"><TrendingUp size={12} /> +10.2%</span>
          <div className="fs-sc-bar" style={{ width: '100%' }} />
        </div>
        <div className="fs-stat-card fs-stat-commission">
          <div className="fs-sc-top"><span className="fs-sc-label">平台佣金</span><span className="fs-sc-icon"><Percent size={20} /></span></div>
          <span className="fs-sc-value">¥{(totalCommission / 10000).toFixed(2)}万</span>
          <span className="fs-sc-sub">抽成比例 15%</span>
          <div className="fs-sc-bar" style={{ width: '65%' }} />
        </div>
        <div className="fs-stat-card fs-stat-payout">
          <div className="fs-sc-top"><span className="fs-sc-label">服务者结算</span><span className="fs-sc-icon"><Wallet size={20} /></span></div>
          <span className="fs-sc-value">¥{(totalPayout / 10000).toFixed(1)}万</span>
          <span className="fs-sc-sub">已结算至服务者</span>
          <div className="fs-sc-bar" style={{ width: '82%' }} />
        </div>
        <div className="fs-stat-card fs-stat-growth">
          <div className="fs-sc-top"><span className="fs-sc-label">月均增长</span><span className="fs-sc-icon"><BarChart3 size={20} /></span></div>
          <span className="fs-sc-value">+7.2%</span>
          <span className="fs-sc-change up"><TrendingUp size={12} /> +2.1%</span>
          <div className="fs-sc-bar" style={{ width: '45%' }} />
        </div>
      </div>

      <div className="fs-chart-section">
        <div className="fs-chart-hdr">
          <h3>月度营收趋势</h3>
          <div className="fs-chart-tabs">
            <button className={`fs-ct-btn ${chartTab === 'revenue' ? 'active' : ''}`} onClick={() => setChartTab('revenue')}>营收</button>
            <button className={`fs-ct-btn ${chartTab === 'commission' ? 'active' : ''}`} onClick={() => setChartTab('commission')}>佣金</button>
            <button className={`fs-ct-btn ${chartTab === 'orders' ? 'active' : ''}`} onClick={() => setChartTab('orders')}>订单量</button>
          </div>
        </div>
        <div className="fs-chart-body">
          <div className="fs-chart-bars">
            {monthlyData.map((d, i) => {
              const isOrders = chartTab === 'orders'
              const val = isOrders ? d.orders : (chartTab === 'revenue' ? d.revenue : d.commission)
              const max = isOrders ? Math.max(...monthlyData.map(m => m.orders)) : chartMax
              return (
                <div key={d.month} className="fs-chart-col">
                  <span className="fs-chart-val">{isOrders ? `${d.orders}单` : `¥${(val / 1000).toFixed(1)}k`}</span>
                  <div className="fs-chart-bar-track">
                    <div className="fs-chart-bar" style={{ height: `${(val / max) * 100}%`, '--delay': `${i * 0.05}s`, background: chartColors[i] } as React.CSSProperties}>
                      <div className="fs-chart-bar-glow" />
                    </div>
                  </div>
                  <span className="fs-chart-lbl">{d.month}</span>
                  <span className="fs-chart-sub">{d.orders}单</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fs-section-hdr">
        <h3>结算明细</h3>
        <span className="fs-section-meta">近7笔交易 · 已结算 {recentTransactions.filter(t => t.status === 'settled').length} 笔</span>
      </div>
      <div className="fs-table-card">
        <table className="fs-table">
          <thead><tr><th>交易号</th><th>关联订单</th><th>服务者</th><th>订单金额</th><th>平台佣金</th><th>结算金额</th><th>支付方式</th><th>状态</th><th>日期</th></tr></thead>
          <tbody>
            {recentTransactions.map(tx => (
              <tr key={tx.id}>
                <td><span className="fs-td-code">{tx.id}</span></td>
                <td><span className="fs-td-order">{tx.order}</span></td>
                <td>{tx.sitter}</td>
                <td><span className="fs-td-amount">¥{tx.amount ?? 0}</span></td>
                <td><span className="fs-td-commission">¥{(tx.commission ?? 0).toFixed(2)}</span></td>
                <td><span className="fs-td-payout">¥{(tx.payout ?? 0).toFixed(2)}</span></td>
                <td><span className="fs-pay-method">{tx.method}</span></td>
                <td><span className={`fs-status-tag ${tx.status}`}>{tx.status === 'settled' ? '已结算' : '待结算'}</span></td>
                <td className="fs-td-muted">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .fs-page { font-size: 14px; }
        .fs-page-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .fs-page-hdr h1 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0; }
        .fs-subtitle { font-size: 13px; color: #9E9EB8; margin-top: 4px; }
        .fs-hdr-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .fs-export-btn { display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 10px; background: var(--color-primary); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .fs-export-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .fs-date-picker { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; border: 1px solid #E8E8EC; font-size: 13px; color: #5A5A7A; background: #fff; cursor: pointer; transition: border-color 0.25s; }
        .fs-date-picker:hover { border-color: var(--color-primary); }

        .fs-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .fs-stat-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #E8E8EC; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .fs-stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.04); transform: translateY(-2px); }
        .fs-sc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .fs-sc-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .fs-stat-revenue .fs-sc-icon { background: linear-gradient(135deg, #FFF0EB, #FFE0D6); color: #FF7D5A; }
        .fs-stat-commission .fs-sc-icon { background: linear-gradient(135deg, #E8F8F4, #D4F5EC); color: #45B7A0; }
        .fs-stat-payout .fs-sc-icon { background: linear-gradient(135deg, #EFF6FF, #E0EEFF); color: #4A90D9; }
        .fs-stat-growth .fs-sc-icon { background: linear-gradient(135deg, #F0EBFF, #E4DBFF); color: #9B59B6; }
        .fs-sc-label { font-size: 13px; color: #9E9EB8; }
        .fs-sc-value { font-size: 26px; font-weight: 800; color: var(--color-text); display: block; margin-bottom: 4px; }
        .fs-sc-change { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
        .fs-sc-change.up { color: #45B7A0; background: #E8F8F4; }
        .fs-sc-sub { font-size: 12px; color: #9E9EB8; }
        .fs-sc-bar { height: 3px; background: linear-gradient(90deg, var(--color-primary), #FFB3A0); border-radius: 3px; margin-top: 10px; }
        .fs-stat-commission .fs-sc-bar { background: linear-gradient(90deg, #45B7A0, #81D4C0); }
        .fs-stat-payout .fs-sc-bar { background: linear-gradient(90deg, #4A90D9, #80B8E8); }
        .fs-stat-growth .fs-sc-bar { background: linear-gradient(90deg, #9B59B6, #C39BD3); }

        .fs-chart-section { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; padding: 20px; margin-bottom: 20px; }
        .fs-chart-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .fs-chart-hdr h3 { font-size: 15px; font-weight: 700; margin: 0; }
        .fs-chart-tabs { display: flex; gap: 3px; background: #F5F5F7; border-radius: 8px; padding: 3px; }
        .fs-ct-btn { padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #9E9EB8; transition: all 0.2s; cursor: pointer; }
        .fs-ct-btn.active { background: #fff; color: var(--color-text); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .fs-ct-btn:hover:not(.active) { color: #5A5A7A; }
        .fs-chart-body { padding: 8px 0; }
        .fs-chart-bars { display: flex; justify-content: space-between; align-items: flex-end; height: 200px; gap: 12px; }
        .fs-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
        .fs-chart-val { font-size: 10px; color: #9E9EB8; font-weight: 600; }
        .fs-chart-bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; border-radius: 4px; position: relative; }
        .fs-chart-bar { width: 100%; max-width: 40px; border-radius: 6px 6px 2px 2px; min-height: 4px; transition: height 0.6s ease; animation: chartGrow 0.6s ease both; animation-delay: var(--delay, 0s); position: relative; overflow: hidden; }
        .fs-chart-bar-glow { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.3); border-radius: 6px 6px 0 0; }
        .fs-chart-bar:hover { filter: brightness(1.05); }
        @keyframes chartGrow { from { height: 0 !important; } }
        .fs-chart-lbl { font-size: 12px; font-weight: 600; color: var(--color-text); }
        .fs-chart-sub { font-size: 10px; color: #B0B0C0; margin-top: -2px; }

        .fs-section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; margin-top: 4px; }
        .fs-section-hdr h3 { font-size: 15px; font-weight: 700; margin: 0; }
        .fs-section-meta { font-size: 12px; color: #9E9EB8; }

        .fs-table-card { background: #fff; border-radius: 14px; border: 1px solid #E8E8EC; overflow-x: auto; }
        .fs-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .fs-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9E9EB8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E8E8EC; background: #FAFBFC; white-space: nowrap; }
        .fs-table td { padding: 14px 16px; border-bottom: 1px solid #F3F4F6; color: var(--color-text); transition: background 0.2s; }
        .fs-table tr:last-child td { border-bottom: none; }
        .fs-table tbody tr:hover td { background: #FAFBFC; }
        .fs-td-code { font-family: monospace; font-size: 11px; color: #9E9EB8; }
        .fs-td-order { font-size: 11px; color: #B0B0C0; font-family: monospace; }
        .fs-td-amount { font-weight: 600; }
        .fs-td-commission { color: #9E9EB8; }
        .fs-td-payout { font-weight: 700; color: var(--color-primary); }
        .fs-pay-method { padding: 2px 8px; border-radius: 100px; font-size: 11px; background: #F5F5F7; color: #5A5A7A; }
        .fs-status-tag { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; display: inline-block; }
        .fs-status-tag.settled { background: linear-gradient(135deg, #E8F8F4, #D4F5EC); color: #2D9B7A; }
        .fs-status-tag.pending { background: linear-gradient(135deg, #FFF8E0, #FFF3CC); color: #D48806; }
        .fs-td-muted { color: #9E9EB8; font-size: 12px; }

        @media (max-width: 1024px) { .fs-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .fs-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .fs-sc-value { font-size: 20px; }
          .fs-table th:nth-child(3), .fs-table td:nth-child(3),
          .fs-table th:nth-child(7), .fs-table td:nth-child(7) { display: none; }
        }
        @media (max-width: 600px) {
          .fs-table th:nth-child(5), .fs-table td:nth-child(5),
          .fs-table th:nth-child(9), .fs-table td:nth-child(9) { display: none; }
        }
      `}</style>
    </div>
  )
}
