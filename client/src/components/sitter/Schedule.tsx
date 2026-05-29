import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { api } from '../../utils/api'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const scheduleData: Record<string, { time: string; petEmoji: string; petName: string; serviceName: string; address: string; status: string }[]> = {}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const statusColors: Record<string, string> = {
  completed: '#9E9EB8',
  in_progress: '#45B7A0',
  pending: '#3B82F6',
}

export default function Schedule() {
  const now = new Date()
  const [schedule, setSchedule] = useState<any>(null)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(`${year}-${month + 1}-${now.getDate()}`)

  useEffect(() => {
    api.get('/orders/today').then(setSchedule)
  }, [])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => { const d = new Date(year, month - 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()) }
  const nextMonth = () => { const d = new Date(year, month + 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()) }

  const selectDate = (day: number) => {
    const key = `${year}-${month + 1}-${day}`
    setSelectedDate(key)
  }

  const dayOrders = (schedule?.[selectedDate]) || []

  return (
    <div className="sc-page">
      <div className="sc-header">
        <button className="sc-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <h2>{year}年{month + 1}月</h2>
        <button className="sc-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      <div className="sc-calendar">
        <div className="sc-weekdays">
          {weekDays.map(d => <span key={d} className="sc-weekday">{d}</span>)}
        </div>
        <div className="sc-days">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="sc-day empty" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const key = `${year}-${month + 1}-${day}`
            const hasOrders = (schedule?.[key]?.length) > 0
            const isSelected = selectedDate === key
            const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
            return (
              <div key={day} className={`sc-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => selectDate(day)}>
                <span className="sc-day-num">{day}</span>
                {hasOrders && <span className="sc-day-dot" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="sc-schedule-section">
        <h3>
          {selectedDate.split('-').slice(1).join('月')}日 排期
          <span className="sc-schedule-count">{dayOrders.length}个服务</span>
        </h3>
        {dayOrders.length === 0 ? (
          <div className="sc-empty">暂无排期</div>
        ) : (
          <div className="sc-order-list">
            {dayOrders.map((o, i) => (
              <div key={i} className="sc-order-card">
                <div className="sc-order-time">
                  <Clock size={12} />
                  <span>{o.time}</span>
                </div>
                <span className="sc-order-emoji">{o.petEmoji}</span>
                <div className="sc-order-body">
                  <span className="sc-order-name">{o.serviceName} · {o.petName}</span>
                  <span className="sc-order-address"><MapPin size={11} /> {o.address}</span>
                </div>
                <span className="sc-order-status" style={{ background: `${statusColors[o.status]}15`, color: statusColors[o.status] }}>
                  {o.status === 'completed' ? '✅' : o.status === 'in_progress' ? '🟢' : '🟡'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .sc-header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px; }
        .sc-header h2 { font-size: 18px; font-weight: 800; color: var(--color-text); margin: 0; min-width: 120px; text-align: center; }
        .sc-nav-btn { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); transition: all 0.25s; }
        .sc-nav-btn:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .sc-calendar { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; margin-bottom: 16px; }
        .sc-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 8px; }
        .sc-weekday { font-size: 11px; font-weight: 700; color: var(--color-text-muted); padding: 6px 0; }
        .sc-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .sc-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; position: relative; }
        .sc-day:hover { background: var(--color-bg-alt); }
        .sc-day.empty { cursor: default; }
        .sc-day.today .sc-day-num { background: var(--color-primary); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .sc-day.selected { background: var(--color-primary-light); }
        .sc-day.selected .sc-day-num { color: var(--color-primary); font-weight: 700; }
        .sc-day-num { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .sc-day-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--color-primary); position: absolute; bottom: 6px; }
        .sc-schedule-section { }
        .sc-schedule-section h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0 0 12px; }
        .sc-schedule-count { font-size: 12px; font-weight: 500; color: var(--color-text-muted); }
        .sc-empty { text-align: center; padding: 40px; color: var(--color-text-muted); font-size: 14px; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
        .sc-order-list { display: flex; flex-direction: column; gap: 8px; }
        .sc-order-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: var(--radius-sm); border: 1px solid var(--color-border); padding: 12px 14px; transition: all 0.25s; }
        .sc-order-card:hover { border-color: var(--color-primary); }
        .sc-order-time { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--color-text); min-width: 80px; }
        .sc-order-emoji { font-size: 24px; flex-shrink: 0; }
        .sc-order-body { flex: 1; min-width: 0; }
        .sc-order-name { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
        .sc-order-address { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
        .sc-order-status { font-size: 16px; width: 28px; height: 28px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @media (max-width: 480px) { .sc-day-num { font-size: 12px; } }
      `}</style>
    </div>
  )
}
