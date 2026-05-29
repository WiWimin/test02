import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Clock, ChevronRight, MessageCircle,
  CheckCircle2, Circle, X, Camera, Heart, User, ShieldCheck
} from 'lucide-react'
import { api } from '../../utils/api'

type OrderStatus = 'pending_pay' | 'pending_accept' | 'accepted' | 'in_progress' | 'completed' | 'reviewed' | 'cancelled'

interface OrderDetail {
  id: string
  status: OrderStatus
  services: { name: string; duration: string; price: number }[]
  total: number
  petName: string
  petBreed: string
  petAvatar: string
  address: string
  date: string
  time: string
  sitterName: string
  sitterAvatar: string
  sitterLevel: string
  sitterRating: number
  sitterOrders: number
  timeline: { status: string; label: string; time: string; done: boolean }[]
}

const statusSteps = [
  { key: 'paid', label: '已支付' },
  { key: 'accepted', label: '待接单' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'reviewed', label: '已评价' },
]

const statusIndex: Record<OrderStatus, number> = {
  pending_pay: 0, pending_accept: 1, accepted: 2, in_progress: 2, completed: 3, reviewed: 4, cancelled: -1,
}

const levelLabels: Record<number, string> = {
  1: '金牌服务者',
  2: '银牌服务者',
  3: '铜牌服务者',
}

export default function OwnerOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewDims, setReviewDims] = useState({ onTime: 5, attitude: 5, professional: 5 })
  const [reviewText, setReviewText] = useState('')
  const [reviewImgs, setReviewImgs] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const fetchOrder = async () => {
    try {
      const data = await api.get<any>(`/orders/${id}`)
      const sitterLevelNum = data.sitter?.sitter_profile?.level || 0
      setOrder({
        id: data.id,
        status: data.status,
        services: data.services || [],
        total: data.total || 0,
        petName: data.pets?.[0]?.pet?.name || '',
        petBreed: data.pets?.[0]?.pet?.breed || '',
        petAvatar: data.pets?.[0]?.pet?.avatar || '🐱',
        address: data.address ? `${data.address.address} ${data.address.detail}`.trim() : '',
        date: data.service_date ? new Date(data.service_date).toLocaleDateString('zh-CN') : '',
        time: data.service_time || '',
        sitterName: data.sitter?.name || '',
        sitterAvatar: data.sitter?.avatar || '👩',
        sitterLevel: levelLabels[sitterLevelNum] || `Lv.${sitterLevelNum}`,
        sitterRating: data.sitter?.sitter_profile?.rating || 0,
        sitterOrders: data.sitter?.sitter_profile?.total_orders || 0,
        timeline: (data.timeline || []).map((t: any) => ({
          status: t.status,
          label: t.label,
          time: t.created_at ? new Date(t.created_at).toLocaleString('zh-CN') : '',
          done: true,
        })),
      })
    } catch (err) {
      console.error('Failed to load order:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchOrder()
  }, [id])

  const currentIdx = order ? statusIndex[order.status] : -1
  const canCancel = order && ['pending_pay', 'pending_accept'].includes(order.status)
  const canPay = order?.status === 'pending_pay'
  const canReview = order?.status === 'completed' && !submitted

  const handlePay = async () => {
    if (!order || actionLoading) return
    setActionLoading(true)
    try {
      await api.put(`/orders/${order.id}/pay`)
      await fetchOrder()
    } catch (err: any) {
      alert(err.message || '支付失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!order || actionLoading) return
    setActionLoading(true)
    try {
      await api.put(`/orders/${order.id}/cancel`, { reason: '用户取消' })
      setCancelConfirm(false)
      await fetchOrder()
    } catch (err: any) {
      alert(err.message || '取消失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!order || actionLoading) return
    setActionLoading(true)
    try {
      await api.post(`/reviews/orders/${order.id}/review`, {
        rating: reviewRating,
        text: reviewText,
        on_time: reviewDims.onTime,
        attitude: reviewDims.attitude,
        professional: reviewDims.professional,
        is_anonymous: isAnonymous,
      })
      setSubmitted(true)
      setShowReview(false)
      await fetchOrder()
    } catch (err: any) {
      alert(err.message || '提交评价失败')
    } finally {
      setActionLoading(false)
    }
  }

  const actionButtons = () => {
    if (canPay) return (
      <>
        <button className="ood-action secondary" onClick={() => setCancelConfirm(true)}>取消订单</button>
        <button className="ood-action primary" onClick={handlePay} disabled={actionLoading}>去支付 ¥{order?.total}</button>
      </>
    )
    if (canCancel) return (
      <>
        <button className="ood-action primary danger" onClick={() => setCancelConfirm(true)}>取消订单</button>
        <button className="ood-action secondary disabled" disabled>等待接单</button>
      </>
    )
    if (order?.status === 'in_progress') return (
      <button className="ood-action primary" onClick={() => navigate(`/chat/${order.id}`)}>
        <MessageCircle size={16} /> 联系服务者
      </button>
    )
    if (canReview) return (
      <>
        <button className="ood-action primary" onClick={() => navigate('/booking/new')}>再次预约</button>
        <button className="ood-action primary" onClick={() => setShowReview(true)}>写评价</button>
      </>
    )
    if (order?.status === 'reviewed') return (
      <button className="ood-action primary" onClick={() => navigate('/booking/new')}>再次预约</button>
    )
    if (order?.status === 'cancelled') return (
      <button className="ood-action primary" onClick={() => navigate('/booking/new')}>再次预约</button>
    )
    return null
  }

  if (loading) {
    return <div className="ood-page" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>加载中...</div>
  }

  if (!order) {
    return <div className="ood-page" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>订单不存在</div>
  }

  return (
    <div className="ood-page">
      {/* Top Bar */}
      <div className="ood-topbar">
        <button className="ood-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <span className="ood-title">订单详情</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress Steps */}
      {order.status !== 'cancelled' && (
        <div className="ood-steps">
          {statusSteps.map((s, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={s.key} className={`ood-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                <div className="ood-step-dot">
                  {done ? <CheckCircle2 size={18} weight="fill" /> : <Circle size={18} />}
                </div>
                <span className="ood-step-label">{s.label}</span>
                {i < statusSteps.length - 1 && <div className={`ood-step-line ${done ? 'done' : ''}`} />}
              </div>
            )
          })}
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="ood-cancelled-banner">
          <span>订单已取消</span>
        </div>
      )}

      {/* Content */}
      <div className="ood-content">
        {/* Service Items */}
        <section className="ood-section">
          <h3 className="ood-section-title">📋 服务信息</h3>
          <div className="ood-service-list">
            {order.services.map((svc, i) => (
              <div key={i} className="ood-service-item">
                <span className="ood-svc-name">{svc.name} <span className="ood-svc-duration">{svc.duration}</span></span>
                <span className="ood-svc-price">¥{svc.price}</span>
              </div>
            ))}
            <div className="ood-service-total">
              <span>合计</span>
              <span className="ood-total-price">¥{order.total}</span>
            </div>
          </div>
        </section>

        {/* Pet Info */}
        <section className="ood-section">
          <div className="ood-pet-card" onClick={() => navigate('/home/owner/pets')}>
            <span className="ood-pet-avatar">{order.petAvatar}</span>
            <div className="ood-pet-info">
              <span className="ood-pet-name">{order.petName}</span>
              <span className="ood-pet-breed">{order.petBreed}</span>
            </div>
            <ChevronRight size={16} />
          </div>
        </section>

        {/* Address + Time */}
        <section className="ood-section">
          <div className="ood-info-row">
            <MapPin size={16} />
            <span>{order.address}</span>
          </div>
          <div className="ood-info-row">
            <Clock size={16} />
            <span>{order.date} {order.time}</span>
          </div>
        </section>

        {/* Sitter Info */}
        <section className="ood-section">
          <div className="ood-sitter-card" onClick={() => navigate(`/chat/${order.id}`)}>
            <div className="ood-sitter-left">
              <div className="ood-sitter-avatar">{order.sitterAvatar}</div>
              <div className="ood-sitter-info">
                <span className="ood-sitter-name">{order.sitterName}</span>
                <span className="ood-sitter-meta">
                  <Star size={11} /> {order.sitterRating} · {order.sitterOrders}单
                </span>
              </div>
            </div>
            <button className="ood-chat-btn" onClick={e => { e.stopPropagation(); navigate(`/chat/${order.id}`) }}>
              <MessageCircle size={16} /> 联系
            </button>
          </div>
        </section>

        {/* Timeline */}
        <section className="ood-section">
          <h3 className="ood-section-title">📝 订单时间线</h3>
          <div className="ood-timeline">
            {order.timeline.map((t, i) => (
              <div key={i} className="ood-tl-item">
                <div className="ood-tl-dot" />
                <div className="ood-tl-content">
                  <span className="ood-tl-label">{t.label}</span>
                  <span className="ood-tl-time">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Action Bar */}
      <div className="ood-bottom-bar">
        <div className="ood-bottom-inner">
          {actionButtons()}
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="ood-overlay" onClick={() => setShowReview(false)}>
          <div className="ood-review-modal" onClick={e => e.stopPropagation()}>
            <div className="ood-review-header">
              <h3>写评价</h3>
              <button onClick={() => setShowReview(false)}><X size={20} /></button>
            </div>
            <div className="ood-review-body">
              <div className="ood-review-sitter">
                <span>{order.sitterAvatar}</span>
                <span>{order.sitterName}</span>
              </div>
              <div className="ood-review-stars">
                <span className="ood-review-label">综合评分</span>
                <div className="ood-star-group">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} className={`ood-star-btn ${i <= reviewRating ? 'active' : ''}`} onClick={() => setReviewRating(i)}>
                      <Star size={28} weight={i <= reviewRating ? 'fill' : 'regular'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="ood-review-dims">
                {(['onTime', 'attitude', 'professional'] as const).map(dim => (
                  <div key={dim} className="ood-dim-row">
                    <span className="ood-dim-label">{dim === 'onTime' ? '准时性' : dim === 'attitude' ? '服务态度' : '专业度'}</span>
                    <div className="ood-dim-stars">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} className={`ood-star-btn small ${i <= reviewDims[dim] ? 'active' : ''}`} onClick={() => setReviewDims(p => ({ ...p, [dim]: i }))}>
                          <Star size={16} weight={i <= reviewDims[dim] ? 'fill' : 'regular'} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <textarea className="ood-review-text" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="给阿姨写段评语吧..." rows={3} />
              <div className="ood-review-photos">
                {reviewImgs.map((_, i) => (
                  <div key={i} className="ood-photo-preview"><span>📷</span></div>
                ))}
                {reviewImgs.length < 6 && (
                  <button className="ood-photo-add" onClick={() => { const newImgs = [...reviewImgs, `img_${Date.now()}`]; setReviewImgs(newImgs) }}>
                    <Camera size={20} />
                  </button>
                )}
              </div>
              <div className="ood-review-anon">
                <label className="ood-toggle">
                  <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                  <span className="ood-toggle-track" />
                  <span>匿名评价</span>
                </label>
              </div>
            </div>
            <button className="ood-review-submit" onClick={handleSubmitReview}>提交评价</button>
          </div>
        </div>
      )}

      {/* Cancel Confirm */}
      {cancelConfirm && (
        <div className="ood-overlay" onClick={() => setCancelConfirm(false)}>
          <div className="ood-confirm-modal" onClick={e => e.stopPropagation()}>
            <AlertIcon size={32} />
            <h3>确认取消订单？</h3>
            <p>取消后可能产生取消费用</p>
            <div className="ood-confirm-btns">
              <button className="ood-confirm-cancel" onClick={() => setCancelConfirm(false) } disabled={actionLoading}>暂不取消</button>
              <button className="ood-confirm-ok" onClick={handleCancel} disabled={actionLoading}>{actionLoading ? '取消中...' : '确认取消'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ood-page { padding-bottom: 80px; }
        .ood-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ood-back { width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); }
        .ood-back:hover { background: rgba(0,0,0,0.04); }
        .ood-title { font-size: 17px; font-weight: 700; }

        /* Steps */
        .ood-steps { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; margin-bottom: 20px; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
        .ood-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
        .ood-step-dot { color: var(--color-border); line-height: 1; }
        .ood-step.done .ood-step-dot { color: var(--color-secondary); }
        .ood-step.active .ood-step-dot { color: var(--color-primary); animation: pulse 1.5s infinite; }
        .ood-step-label { font-size: 10px; color: var(--color-text-muted); margin-top: 4px; white-space: nowrap; }
        .ood-step.done .ood-step-label { color: var(--color-secondary); }
        .ood-step.active .ood-step-label { color: var(--color-primary); font-weight: 600; }
        .ood-step-line { position: absolute; top: 9px; left: 60%; width: 80%; height: 2px; background: var(--color-border); }
        .ood-step-line.done { background: var(--color-secondary); }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }

        .ood-cancelled-banner { padding: 12px 16px; border-radius: var(--radius-md); background: #FFF0F0; color: #FF6B6B; font-size: 14px; font-weight: 600; text-align: center; margin-bottom: 20px; }

        .ood-content { display: flex; flex-direction: column; gap: 12px; }
        .ood-section { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; }
        .ood-section-title { font-size: 14px; font-weight: 700; margin: 0 0 12px; display: flex; align-items: center; gap: 6px; }

        .ood-service-list { display: flex; flex-direction: column; gap: 8px; }
        .ood-service-item { display: flex; align-items: center; justify-content: space-between; }
        .ood-svc-name { font-size: 13px; color: var(--color-text); }
        .ood-svc-duration { font-size: 12px; color: var(--color-text-muted); font-weight: 400; }
        .ood-svc-price { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .ood-service-total { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--color-border); font-size: 14px; font-weight: 600; }
        .ood-total-price { font-size: 18px; font-weight: 800; color: var(--color-primary); }

        .ood-pet-card { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .ood-pet-avatar { font-size: 28px; line-height: 1; }
        .ood-pet-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .ood-pet-name { font-size: 14px; font-weight: 600; }
        .ood-pet-breed { font-size: 12px; color: var(--color-text-muted); }

        .ood-info-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 13px; color: var(--color-text-secondary); }
        .ood-info-row svg { flex-shrink: 0; color: var(--color-text-muted); }

        .ood-sitter-card { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .ood-sitter-left { display: flex; align-items: center; gap: 12px; }
        .ood-sitter-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .ood-sitter-info { display: flex; flex-direction: column; gap: 2px; }
        .ood-sitter-name { font-size: 14px; font-weight: 600; }
        .ood-sitter-meta { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
        .ood-chat-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 100px; border: 1px solid var(--color-primary); color: var(--color-primary); font-size: 12px; font-weight: 600; }

        .ood-timeline { display: flex; flex-direction: column; gap: 16px; }
        .ood-tl-item { display: flex; gap: 12px; position: relative; padding-left: 8px; }
        .ood-tl-item::before { content: ''; position: absolute; left: 13px; top: 20px; bottom: -16px; width: 2px; background: var(--color-border); }
        .ood-tl-item:last-child::before { display: none; }
        .ood-tl-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-secondary); margin-top: 4px; flex-shrink: 0; }
        .ood-tl-content { display: flex; flex-direction: column; gap: 2px; }
        .ood-tl-label { font-size: 13px; font-weight: 500; }
        .ood-tl-time { font-size: 11px; color: var(--color-text-muted); }

        .ood-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-top: 1px solid var(--color-border); padding: 12px 16px; }
        .ood-bottom-inner { display: flex; gap: 10px; max-width: 1200px; margin: 0 auto; }
        .ood-action { flex: 1; padding: 12px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 700; border: none; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ood-action.primary { background: var(--color-primary); color: #fff; }
        .ood-action.primary.danger { background: #FF6B6B; }
        .ood-action.secondary { background: var(--color-bg); color: var(--color-text-secondary); border: 1px solid var(--color-border); }
        .ood-action.secondary.disabled { opacity: 0.5; cursor: not-allowed; }

        /* Review Modal */
        .ood-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
        .ood-review-modal { background: #fff; border-radius: var(--radius-lg); width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
        .ood-review-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .ood-review-header h3 { font-size: 18px; font-weight: 700; margin: 0; }
        .ood-review-header button { width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .ood-review-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .ood-review-sitter { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
        .ood-review-sitter span:first-child { font-size: 24px; }
        .ood-review-stars { text-align: center; }
        .ood-review-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--color-text); }
        .ood-star-group { display: flex; justify-content: center; gap: 4px; }
        .ood-star-btn { color: #E0E0E0; }
        .ood-star-btn.active { color: #FFD93D; }
        .ood-star-btn.small { color: #E0E0E0; }
        .ood-star-btn.small.active { color: #FFD93D; }
        .ood-review-dims { display: flex; flex-direction: column; gap: 8px; }
        .ood-dim-row { display: flex; align-items: center; justify-content: space-between; }
        .ood-dim-label { font-size: 13px; color: var(--color-text-secondary); }
        .ood-dim-stars { display: flex; gap: 2px; }
        .ood-review-text { width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 14px; resize: none; outline: none; font-family: var(--font); }
        .ood-review-text:focus { border-color: var(--color-primary); }
        .ood-review-photos { display: flex; gap: 8px; flex-wrap: wrap; }
        .ood-photo-preview { width: 64px; height: 64px; border-radius: var(--radius-sm); background: var(--color-bg); display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .ood-photo-add { width: 64px; height: 64px; border-radius: var(--radius-sm); border: 1.5px dashed var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .ood-review-anon { display: flex; align-items: center; }
        .ood-toggle { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
        .ood-toggle input { display: none; }
        .ood-toggle-track { width: 36px; height: 20px; border-radius: 10px; background: var(--color-border); position: relative; transition: all 0.25s; }
        .ood-toggle input:checked + .ood-toggle-track { background: var(--color-primary); }
        .ood-toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: all 0.25s; }
        .ood-toggle input:checked + .ood-toggle-track::after { left: 18px; }
        .ood-review-submit { width: 100%; padding: 14px; border: none; background: var(--color-primary); color: #fff; font-size: 15px; font-weight: 700; border-radius: 0 0 var(--radius-lg) var(--radius-lg); cursor: pointer; }

        /* Cancel Confirm */
        .ood-confirm-modal { background: #fff; border-radius: var(--radius-lg); padding: 32px 28px 24px; text-align: center; max-width: 320px; width: 100%; }
        .ood-confirm-modal h3 { font-size: 18px; font-weight: 700; margin: 12px 0 4px; }
        .ood-confirm-modal p { font-size: 14px; color: var(--color-text-muted); margin: 0 0 20px; }
        .ood-confirm-btns { display: flex; gap: 10px; }
        .ood-confirm-cancel { flex: 1; padding: 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--color-border); font-size: 14px; font-weight: 600; background: #fff; cursor: pointer; }
        .ood-confirm-ok { flex: 1; padding: 10px; border-radius: var(--radius-sm); border: none; font-size: 14px; font-weight: 600; background: #FF6B6B; color: #fff; cursor: pointer; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

function AlertIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
