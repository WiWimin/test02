import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, Clock, CheckCircle, Circle, ChevronLeft } from 'lucide-react'

const mockOrder = {
  id: 'ORD-001', petEmoji: '🐕', petName: '豆豆', serviceName: '遛狗 60分钟',
  date: '2026-05-28', time: '10:00-11:00', address: '望京SOHO T3 1808',
  price: 79, status: 'in_progress', payStatus: '已支付',
  ownerName: '李先生', ownerPhone: '138****8888',
  note: '豆豆有点怕生，请温柔对待，家里有摄像头 🎥',
}

const steps = [
  { key: 'accepted', label: '已接单' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
  { key: 'review', label: '待评价' },
]

export default function SitterOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentStatus] = useState(mockOrder.status)

  const currentStep = steps.findIndex(s => s.key === currentStatus)

  return (
    <div className="sod-page">
      <div className="sod-top">
        <button className="sod-back" onClick={() => navigate('/sitter/orders')}><ChevronLeft size={20} /></button>
        <h1>订单详情</h1>
      </div>

      <div className="sod-progress">
        <div className="sod-steps">
          {steps.map((step, i) => {
            const done = i <= currentStep
            const isCurrent = i === currentStep
            return (
              <div key={step.key} className={`sod-step ${done ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="sod-step-icon">{done ? <CheckCircle size={18} /> : <Circle size={18} />}</div>
                <span className="sod-step-label">{step.label}</span>
                {i < steps.length - 1 && <div className={`sod-step-line ${done ? 'done' : ''}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="sod-card">
        <div className="sod-card-hdr">
          <span className="sod-card-emoji">{mockOrder.petEmoji}</span>
          <div>
            <h2>{mockOrder.petName} · {mockOrder.serviceName}</h2>
            <span className="sod-card-id">订单号: {mockOrder.id}</span>
          </div>
        </div>
        <div className="sod-card-body">
          <div className="sod-info-row"><Clock size={14} /><span>{mockOrder.date} {mockOrder.time}</span></div>
          <div className="sod-info-row"><MapPin size={14} /><span>{mockOrder.address}</span></div>
          <div className="sod-info-row"><span className="sod-price">¥{mockOrder.price}</span><span className="sod-pay-status">{mockOrder.payStatus}</span></div>
        </div>
      </div>

      <div className="sod-card">
        <div className="sod-card-hdr"><h3>主人信息</h3></div>
        <div className="sod-card-body">
          <div className="sod-owner-info">
            <span className="sod-owner-avatar">👤</span>
            <div>
              <span className="sod-owner-name">{mockOrder.ownerName}</span>
              <span className="sod-owner-phone">{mockOrder.ownerPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {mockOrder.note && (
        <div className="sod-card">
          <div className="sod-card-hdr"><h3>服务备注</h3></div>
          <div className="sod-card-body">
            <p className="sod-note">{mockOrder.note}</p>
          </div>
        </div>
      )}

      <div className="sod-actions">
        <button className="sod-action-btn outline" onClick={() => alert(`拨打 ${mockOrder.ownerPhone}`)}>
          <Phone size={16} /> 联系主人
        </button>
        <button className="sod-action-btn outline" onClick={() => navigate(`/chat/${mockOrder.id}`)}>
          <MessageCircle size={16} /> 发消息
        </button>
        <button className="sod-action-btn outline" onClick={() => alert(`导航至: ${mockOrder.address}`)}>
          <MapPin size={16} /> 导航前往
        </button>
        {currentStatus === 'in_progress' && (
          <button className="sod-action-btn primary" onClick={() => alert('✅ 服务已完成')}>
            <CheckCircle size={16} /> 完成服务
          </button>
        )}
        {currentStatus === 'accepted' && (
          <button className="sod-action-btn primary" onClick={() => alert('📍 已签到，开始服务')}>
            <MapPin size={16} /> 开始服务
          </button>
        )}
      </div>

      <style>{`
        .sod-page { max-width: 640px; margin: 0 auto; }
        .sod-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .sod-back { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); transition: all 0.25s; }
        .sod-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .sod-top h1 { font-size: 20px; font-weight: 800; color: var(--color-text); margin: 0; }
        .sod-progress { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 20px; margin-bottom: 14px; }
        .sod-steps { display: flex; align-items: flex-start; justify-content: space-between; }
        .sod-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
        .sod-step-icon { color: var(--color-border); margin-bottom: 6px; }
        .sod-step.done .sod-step-icon { color: var(--color-secondary); }
        .sod-step.current .sod-step-icon { color: var(--color-primary); animation: pulse 2s ease infinite; }
        .sod-step-label { font-size: 11px; font-weight: 600; color: var(--color-text-muted); white-space: nowrap; }
        .sod-step.done .sod-step-label { color: var(--color-secondary); }
        .sod-step.current .sod-step-label { color: var(--color-primary); }
        .sod-step-line { position: absolute; top: 9px; left: 60%; width: 80%; height: 2px; background: var(--color-border); }
        .sod-step-line.done { background: var(--color-secondary); }
        .sod-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; margin-bottom: 12px; }
        .sod-card-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .sod-card-hdr h2 { font-size: 16px; font-weight: 700; color: var(--color-text); margin: 0; }
        .sod-card-hdr h3 { font-size: 14px; font-weight: 700; color: var(--color-text); margin: 0; }
        .sod-card-emoji { font-size: 36px; }
        .sod-card-id { display: block; font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
        .sod-card-body { display: flex; flex-direction: column; gap: 10px; }
        .sod-info-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
        .sod-price { font-size: 18px; font-weight: 800; color: var(--color-primary); }
        .sod-pay-status { font-size: 12px; padding: 2px 8px; border-radius: 100px; background: #E8F8F4; color: #2D9B7A; font-weight: 600; }
        .sod-owner-info { display: flex; align-items: center; gap: 12px; }
        .sod-owner-avatar { font-size: 32px; }
        .sod-owner-name { display: block; font-size: 15px; font-weight: 600; color: var(--color-text); }
        .sod-owner-phone { font-size: 13px; color: var(--color-text-muted); }
        .sod-note { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0; background: #FFF8E0; padding: 12px; border-radius: var(--radius-sm); }
        .sod-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
        .sod-action-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; transition: all 0.25s; cursor: pointer; }
        .sod-action-btn.outline { border: 1px solid var(--color-border); color: var(--color-text-secondary); background: #fff; }
        .sod-action-btn.outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .sod-action-btn.primary { background: var(--color-primary-gradient); color: #fff; border: none; grid-column: 1 / -1; box-shadow: 0 4px 14px rgba(255,125,90,0.3); }
        .sod-action-btn.primary:hover { box-shadow: 0 6px 24px rgba(255,125,90,0.4); transform: translateY(-1px); }
        @media (max-width: 480px) { .sod-actions { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
