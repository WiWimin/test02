import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Phone, MessageCircle, MapPin, CheckCircle, Clock } from 'lucide-react'
import { api } from '../../utils/api'

const steps = [
  { key: 'accepted', label: '已接单' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
]

export default function SitterOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get<any>('/orders/' + id).then(setOrder).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="sod-loading">加载中...</div>
  if (!order) return <div className="sod-loading">订单不存在</div>

  const currentStep = steps.findIndex(s => s.key === order.status)
  const isPending = order.status === 'pending_accept'

  return (
    <div className="sod-page">
      <div className="sod-topbar">
        <button className="sod-back" onClick={() => navigate('/sitter/orders')}><ChevronLeft size={20} /></button>
        <h2>订单详情</h2>
        <div />
      </div>

      {!isPending && (
        <div className="sod-progress">
          {steps.map((step, i) => (
            <div key={step.key} className={'sod-step ' + (i <= currentStep ? 'done ' : '') + (i === currentStep ? 'current' : '')}>
              <div className="sod-step-dot">{i <= currentStep ? <CheckCircle size={14} /> : i + 1}</div>
              <span className="sod-step-label">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="sod-card">
        <div className="sod-card-header">
          <span className="sod-service">{order.serviceName || order.service?.name || '宠物服务'}</span>
          <span className="sod-price">¥{order.total || order.totalPrice || 0}</span>
        </div>
        <div className="sod-meta">
          <span><Clock size={13} /> {order.service_time || order.time || '-'}</span>
          <span><MapPin size={13} /> {order.address || order.addressDetail || '-'}</span>
        </div>
        {order.note && <div className="sod-note">备注：{order.note}</div>}
      </div>

      <div className="sod-card">
        <div className="sod-card-title">主人信息</div>
        <div className="sod-owner">
          <div className="sod-avatar">{order.owner?.avatar || '👤'}</div>
          <div>
            <div className="sod-owner-name">{order.ownerName || order.owner?.name || '主人'}</div>
            <div className="sod-owner-phone">{order.ownerPhone || order.owner?.phone || ''}</div>
          </div>
        </div>
        <div className="sod-actions-row">
          <button className="sod-action-btn"><Phone size={14} /> 电话</button>
          <button className="sod-action-btn" onClick={() => navigate('/chat/' + order.id)}><MessageCircle size={14} /> 消息</button>
        </div>
      </div>

      <div className="sod-bottom">
        {isPending ? (
          <div className="sod-btn-row">
            <button className="sod-btn sod-btn-secondary" onClick={async () => { try { await api.put('/orders/' + id + '/reject'); navigate('/sitter/orders') } catch {} }}>拒绝</button>
            <button className="sod-btn sod-btn-primary" onClick={async () => { try { await api.put('/orders/' + id + '/accept'); setOrder({ ...order, status: 'accepted' }) } catch {} }}>接单</button>
          </div>
        ) : order.status === 'accepted' ? (
          <button className="sod-btn sod-btn-primary" onClick={async () => { try { await api.put('/orders/' + id + '/start'); setOrder({ ...order, status: 'in_progress' }) } catch {} }}>开始服务</button>
        ) : order.status === 'in_progress' ? (
          <button className="sod-btn sod-btn-primary" onClick={async () => { try { await api.put('/orders/' + id + '/complete'); setOrder({ ...order, status: 'completed' }) } catch {} }}>完成服务</button>
        ) : null}
      </div>

      <style>{`
        .sod-page { display: flex; flex-direction: column; gap: 12px; padding-bottom: 80px; }
        .sod-loading { text-align: center; padding: 60px 16px; color: #8E8EA0; font-size: 13px; }
        .sod-topbar { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
        .sod-topbar h2 { font-size: 16px; font-weight: 700; color: #1A1A2E; margin: 0; flex: 1; }
        .sod-back { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #1A1A2E; cursor: pointer; }
        .sod-progress { display: flex; background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .sod-step { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center; position: relative; }
        .sod-step:not(:last-child)::after { content: ''; position: absolute; left: 60%; right: -20%; height: 2px; background: #EEEEF2; top: 50%; }
        .sod-step.done:not(:last-child)::after { background: #45B7A0; }
        .sod-step-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: #F0F2F5; color: #8E8EA0; position: relative; z-index: 1; }
        .sod-step.done .sod-step-dot { background: #45B7A0; color: #fff; }
        .sod-step.current .sod-step-dot { background: #45B7A0; color: #fff; box-shadow: 0 0 0 4px rgba(69,183,160,0.2); }
        .sod-step-label { font-size: 11px; color: #8E8EA0; font-weight: 500; }
        .sod-step.done .sod-step-label { color: #45B7A0; }
        .sod-step.current .sod-step-label { color: #1A1A2E; font-weight: 600; }
        .sod-card { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .sod-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .sod-card-title { font-size: 14px; font-weight: 700; color: #1A1A2E; margin-bottom: 10px; }
        .sod-service { font-size: 15px; font-weight: 700; color: #1A1A2E; }
        .sod-price { font-size: 18px; font-weight: 800; color: #FF7D5A; }
        .sod-meta { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #5A5A7A; }
        .sod-meta span { display: flex; align-items: center; gap: 5px; }
        .sod-note { margin-top: 8px; padding: 8px 12px; border-radius: 8px; background: #F8F9FB; font-size: 12px; color: #8E8EA0; }
        .sod-owner { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .sod-avatar { width: 40px; height: 40px; border-radius: 50%; background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .sod-owner-name { font-size: 14px; font-weight: 600; color: #1A1A2E; }
        .sod-owner-phone { font-size: 12px; color: #8E8EA0; }
        .sod-actions-row { display: flex; gap: 8px; }
        .sod-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600; background: #F5F6FA; color: #5A5A7A; cursor: pointer; }
        .sod-action-btn:hover { background: #EEEEF2; }
        .sod-bottom { position: fixed; bottom: 64px; left: 0; right: 0; padding: 12px 16px; background: #fff; border-top: 1px solid #EEEEF2; }
        .sod-btn-row { display: flex; gap: 10px; }
        .sod-btn { flex: 1; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700; text-align: center; cursor: pointer; }
        .sod-btn-primary { background: #FF7D5A; color: #fff; }
        .sod-btn-secondary { background: #F5F6FA; color: #5A5A7A; }
      `}</style>
    </div>
  )
}
