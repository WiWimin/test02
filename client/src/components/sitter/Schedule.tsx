import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { api } from '../../utils/api'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export default function Schedule() {
  const [date, setDate] = useState(new Date())
  const [orders, setOrders] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => { api.get<any[]>('/orders/today').then(setOrders).catch(() => {}) }, [])

  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => setDate(new Date(year, month - 1))
  const nextMonth = () => setDate(new Date(year, month + 1))

  const monthLabel = year + '年' + (month + 1) + '月'

  return (
    <div className="ssch-page">
      <div className="ssch-header">
        <button onClick={prevMonth}><ChevronLeft size={18} /></button>
        <h3>{monthLabel}</h3>
        <button onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      <div className="ssch-weekdays">{weekDays.map(d => <span key={d}>{d}</span>)}</div>

      <div className="ssch-grid">
        {Array.from({ length: firstDay }, (_, i) => <div key={'e' + i} className="ssch-day empty" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const isSelected = day === selectedDay
          return (
            <div key={day} className={'ssch-day ' + (isToday ? 'today ' : '') + (isSelected ? 'selected ' : '')} onClick={() => setSelectedDay(day)}>
              <span>{day}</span>
            </div>
          )
        })}
      </div>

      <div className="ssch-section">
        <h4>{selectedDay ? monthLabel + selectedDay + '日' : '今日'} 安排 ({orders.length})</h4>
        {orders.length === 0 ? <p className="ssch-empty">暂无安排</p> : orders.map((o: any) => (
          <div key={o.id} className="ssch-order-item">
            <div className="ssch-order-time"><Clock size={12} /> {o.service_time || o.time || '-'}</div>
            <div className="ssch-order-info">
              <span className="ssch-order-service">{o.serviceName || o.service?.name || '宠物服务'}</span>
              <span className="ssch-order-meta">🐾 {o.petName || '宠物'} · {o.ownerName || '主人'}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{'.ssch-page { display: flex; flex-direction: column; gap: 12px; } .ssch-header { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 14px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .ssch-header h3 { font-size: 15px; font-weight: 700; color: #1A1A2E; margin: 0; } .ssch-header button { width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #8E8EA0; cursor: pointer; } .ssch-header button:hover { background: #F5F6FA; } .ssch-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 11px; color: #8E8EA0; font-weight: 600; padding: 8px 0; } .ssch-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; } .ssch-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: all 0.15s; } .ssch-day.empty { cursor: default; } .ssch-day:not(.empty):hover { background: #F0F2F5; } .ssch-day.today { background: #FF7D5A; color: #fff; font-weight: 700; } .ssch-day.selected { border: 2px solid #FF7D5A; background: #FFF5F0; } .ssch-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); } .ssch-section h4 { font-size: 14px; font-weight: 700; color: #1A1A2E; margin: 0 0 12px; } .ssch-empty { text-align: center; padding: 20px; color: #8E8EA0; font-size: 12px; } .ssch-order-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F5F6FA; } .ssch-order-item:last-child { border-bottom: none; } .ssch-order-time { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #8E8EA0; white-space: nowrap; min-width: 60px; } .ssch-order-info { flex: 1; } .ssch-order-service { display: block; font-size: 13px; font-weight: 600; color: #1A1A2E; } .ssch-order-meta { font-size: 11px; color: #8E8EA0; }'}</style>
    </div>
  )
}
