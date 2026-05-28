import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, ShieldCheck, Check, ChevronRight,
  Clock, Calendar, Image as ImageIcon, Phone, MessageCircle
} from 'lucide-react'
import { isLoggedIn } from '../utils/auth'

/* ── Mock Data ── */

const sitterData: Record<string, {
  name: string; avatar: string; bgColor: string; rating: number;
  reviews: number; distance: string; badges: string[]; desc: string;
  services: { id: string; name: string; duration: string; price: number; desc: string }[];
  timeSlots: { date: string; slots: { time: string; available: boolean }[] }[];
  reviewList: { user: string; avatar: string; rating: number; text: string; date: string; images: number }[];
}> = {
  'dog-walk': {
    name: '张阿姨', avatar: '👩', bgColor: '#FFF0EB', rating: 4.9, reviews: 128, distance: '1.2km',
    badges: ['实名认证', '宠物护理证', '无犯罪记录'],
    desc: '3年宠物护理经验，温柔耐心，是两位毛孩子的家长，深知每只宠物都是家人。',
    services: [
      { id: 'dw-30', name: '上门遛狗', duration: '30分钟', price: 49, desc: '小区或公园遛狗，含排泄物清理、补充饮水' },
      { id: 'dw-60', name: '上门遛狗', duration: '60分钟', price: 79, desc: '含基础训练互动（坐下、握手），更多陪伴时间' },
      { id: 'dw-combo', name: '喂食+遛狗组合', duration: '60分钟', price: 99, desc: '喂食+换水+遛狗+简单清洁，一站式服务' },
      { id: 'dw-clean', name: '遛狗+基础清洁', duration: '90分钟', price: 129, desc: '遛狗+擦脚+毛发梳理+简单清洁' },
    ],
    timeSlots: [
      { date: '今天 5/28', slots: [
        { time: '09:00', available: true }, { time: '10:00', available: true },
        { time: '10:30', available: false }, { time: '14:00', available: true },
        { time: '15:00', available: false }, { time: '16:00', available: true },
        { time: '17:00', available: true }, { time: '19:00', available: true },
      ]},
      { date: '明天 5/29', slots: [
        { time: '08:00', available: true }, { time: '09:00', available: true },
        { time: '10:00', available: true }, { time: '11:00', available: true },
        { time: '14:00', available: true }, { time: '15:00', available: true },
        { time: '16:00', available: false }, { time: '18:00', available: true },
      ]},
      { date: '后天 5/30', slots: [
        { time: '09:00', available: true }, { time: '10:00', available: true },
        { time: '11:00', available: true }, { time: '14:00', available: true },
        { time: '15:00', available: true }, { time: '16:00', available: true },
        { time: '17:00', available: true }, { time: '20:00', available: true },
      ]},
    ],
    reviewList: [
      { user: '豆豆妈', avatar: '👩', rating: 5, text: '特别细心，遛狗的时候还发了好多照片给我。豆豆玩得特别开心，以后就找张阿姨了！', date: '2026-05-20', images: 3 },
      { user: '可乐爸爸', avatar: '👨', rating: 5, text: '非常准时，提前10分钟就到了。对狗狗很有耐心，我家可乐有点怕生但很快就跟阿姨熟了。', date: '2026-05-18', images: 1 },
      { user: '团子麻麻', avatar: '👩', rating: 4, text: '服务很到位，还帮忙清理了狗窝。唯一就是时间稍微超了一点，但整体非常满意。', date: '2026-05-15', images: 0 },
      { user: '咪咪主人', avatar: '👨', rating: 5, text: '虽然是遛狗服务，但阿姨对猫咪也很有一套！强烈推荐！', date: '2026-05-12', images: 2 },
    ],
  },
  'sitter-zhang': {
    name: '张阿姨', avatar: '👩', bgColor: '#FFF0EB', rating: 4.9, reviews: 128, distance: '1.2km',
    badges: ['实名认证', '宠物护理证', '无犯罪记录'],
    desc: '3年宠物护理经验，温柔耐心，是两位毛孩子的家长，深知每只宠物都是家人。',
    services: [
      { id: 'sz-dw', name: '上门遛狗', duration: '30分钟', price: 49, desc: '小区或公园遛狗，含排泄物清理' },
      { id: 'sz-dw60', name: '上门遛狗', duration: '60分钟', price: 79, desc: '含基础训练互动，更多陪伴时间' },
      { id: 'sz-feed', name: '上门喂食', duration: '30分钟', price: 39, desc: '喂食+换水+简单陪伴' },
      { id: 'sz-clean', name: '宠物清洁', duration: '60分钟', price: 69, desc: '梳毛+擦脚+基础清洁' },
    ],
    timeSlots: [
      { date: '今天 5/28', slots: [
        { time: '09:00', available: true }, { time: '10:00', available: false },
        { time: '10:30', available: true }, { time: '14:00', available: true },
        { time: '15:00', available: true }, { time: '16:00', available: false },
        { time: '17:00', available: true }, { time: '19:00', available: true },
      ]},
      { date: '明天 5/29', slots: [
        { time: '08:00', available: true }, { time: '09:00', available: true },
        { time: '10:00', available: true }, { time: '11:00', available: false },
        { time: '14:00', available: true }, { time: '15:00', available: true },
        { time: '16:00', available: true }, { time: '18:00', available: true },
      ]},
      { date: '后天 5/30', slots: [
        { time: '09:00', available: true }, { time: '10:00', available: true },
        { time: '11:00', available: true }, { time: '14:00', available: true },
        { time: '15:00', available: false }, { time: '16:00', available: true },
        { time: '17:00', available: true }, { time: '20:00', available: true },
      ]},
    ],
    reviewList: [
      { user: '豆豆妈', avatar: '👩', rating: 5, text: '特别细心，遛狗的时候还发了好多照片给我。豆豆玩得特别开心！', date: '2026-05-20', images: 3 },
      { user: '可乐爸爸', avatar: '👨', rating: 5, text: '非常准时，提前10分钟就到了。对狗狗很有耐心。', date: '2026-05-18', images: 1 },
      { user: '团子麻麻', avatar: '👩', rating: 4, text: '服务很到位，还帮忙清理了狗窝。整体非常满意。', date: '2026-05-15', images: 0 },
      { user: '咪咪主人', avatar: '👨', rating: 5, text: '对猫咪也很有一套！强烈推荐！', date: '2026-05-12', images: 2 },
    ],
  },
}

const defaultSitter = sitterData['dog-walk']

/* ── Sub-components ── */

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <span className="sd-stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} className={`sd-star ${i < full ? 'full' : i === full && hasHalf ? 'half' : 'empty'}`} />
      ))}
    </span>
  )
}

/* ── Main Component ── */

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sitter = sitterData[id || ''] || defaultSitter

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const total = useMemo(() => {
    return sitter.services
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0)
  }, [selectedServices, sitter.services])

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    )
  }

  const currentSlots = sitter.timeSlots[selectedDate]

  return (
    <div className="sd-page">
      {/* ── Top Bar ── */}
      <div className="sd-topbar">
        <div className="sd-topbar-inner container">
          <button className="sd-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
          <span className="sd-topbar-title">服务详情</span>
          <div className="sd-topbar-spacer" />
        </div>
      </div>

      <div className="sd-content">
        {/* ── Sitter Profile ── */}
        <section className="sd-section sd-sitter-section">
          <div className="container">
            <div className="sd-sitter-card">
              <div className="sd-sitter-avatar" style={{ background: sitter.bgColor }}>
                <span>{sitter.avatar}</span>
              </div>
              <div className="sd-sitter-info">
                <h1 className="sd-sitter-name">{sitter.name}</h1>
                <div className="sd-sitter-rating">
                  <StarRating rating={sitter.rating} size={16} />
                  <span className="sd-rating-num">{sitter.rating}</span>
                  <span className="sd-rating-reviews">({sitter.reviews}条评价)</span>
                  <span className="sd-rating-divider">|</span>
                  <MapPin size={14} />
                  <span>距您{sitter.distance}</span>
                </div>
                <div className="sd-sitter-badges">
                  {sitter.badges.map(b => (
                    <span key={b} className="sd-badge"><ShieldCheck size={12} /> {b}</span>
                  ))}
                </div>
                <p className="sd-sitter-desc">{sitter.desc}</p>
              </div>
              <div className="sd-sitter-actions">
                <button className="sd-act-btn" aria-label="电话">
                  <Phone size={18} />
                </button>
                <button className="sd-act-btn" aria-label="聊天" onClick={() => navigate(`/chat/${id}`)}>
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Service Items ── */}
        <section className="sd-section" id="sd-services">
          <div className="container">
            <div className="sd-section-header">
              <h2>选择服务项目</h2>
              <span className="sd-section-sub">可多选，组合更优惠</span>
            </div>
            <div className="sd-service-list">
              {sitter.services.map(s => {
                const selected = selectedServices.includes(s.id)
                return (
                  <button
                    key={s.id}
                    className={`sd-service-item ${selected ? 'selected' : ''}`}
                    onClick={() => toggleService(s.id)}
                  >
                    <div className={`sd-si-check ${selected ? 'checked' : ''}`}>
                      {selected && <Check size={14} />}
                    </div>
                    <div className="sd-si-body">
                      <div className="sd-si-top">
                        <span className="sd-si-name">{s.name}</span>
                        <span className="sd-si-price">¥{s.price}</span>
                      </div>
                      <span className="sd-si-duration">
                        <Clock size={12} /> {s.duration}
                      </span>
                      <p className="sd-si-desc">{s.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Time Slot Picker ── */}
        <section className="sd-section" id="sd-time">
          <div className="container">
            <div className="sd-section-header">
              <h2>选择预约时间</h2>
              <span className="sd-section-sub">请选择可用的时段</span>
            </div>

            <div className="sd-date-tabs">
              {sitter.timeSlots.map((d, i) => (
                <button
                  key={d.date}
                  className={`sd-date-tab ${i === selectedDate ? 'active' : ''}`}
                  onClick={() => { setSelectedDate(i); setSelectedTime(null) }}
                >
                  <Calendar size={14} />
                  <span>{d.date}</span>
                </button>
              ))}
            </div>

            <div className="sd-time-grid">
              {currentSlots.slots.map(slot => (
                <button
                  key={`${currentSlots.date}-${slot.time}`}
                  className={`sd-time-slot ${!slot.available ? 'unavailable' : ''} ${selectedTime === slot.time ? 'selected' : ''}`}
                  disabled={!slot.available}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                >
                  {slot.available ? slot.time : '已约满'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="sd-section sd-review-section" id="sd-reviews">
          <div className="container">
            <div className="sd-section-header">
              <h2>服务评价</h2>
              <span className="sd-section-sub">{sitter.reviews}条评价 · 好评率 98%</span>
            </div>

            <div className="sd-review-summary">
              <div className="sd-rs-score">
                <span className="sd-rs-num">{sitter.rating}</span>
                <StarRating rating={sitter.rating} size={16} />
                <span className="sd-rs-label">综合评分</span>
              </div>
              <div className="sd-rs-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const pct = Math.max(5, star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1)
                  return (
                    <div key={star} className="sd-rs-bar-row">
                      <span className="sd-rs-bar-label">{star}星</span>
                      <div className="sd-rs-bar-track">
                        <div className="sd-rs-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="sd-rs-bar-pct">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="sd-review-list">
              {sitter.reviewList.map((rv, i) => (
                <div key={i} className="sd-review-card">
                  <div className="sd-rc-header">
                    <div className="sd-rc-user">
                      <span className="sd-rc-avatar">{rv.avatar}</span>
                      <div>
                        <span className="sd-rc-name">{rv.user}</span>
                        <span className="sd-rc-date">{rv.date}</span>
                      </div>
                    </div>
                    <StarRating rating={rv.rating} size={12} />
                  </div>
                  <p className="sd-rc-text">{rv.text}</p>
                  {rv.images > 0 && (
                    <div className="sd-rc-images">
                      {[...Array(Math.min(rv.images, 3))].map((_, j) => (
                        <div key={j} className="sd-rc-img-placeholder">
                          <ImageIcon size={18} />
                        </div>
                      ))}
                      {rv.images > 3 && <span className="sd-rc-img-more">+{rv.images - 3}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="sd-view-all">查看全部评价 <ChevronRight size={14} /></button>
          </div>
        </section>

        {/* Spacer for fixed bottom bar */}
        <div className="sd-bottom-spacer" />
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div className="sd-bottom-bar">
        <div className="sd-bottom-inner container">
          <div className="sd-bottom-info">
            <span className="sd-bottom-label">合计</span>
            <span className="sd-bottom-price">
              ¥<span className="sd-price-num">{total}</span>
            </span>
            {total === 0 && <span className="sd-bottom-hint">请选择服务项目</span>}
          </div>
          <button
            className={`btn btn-primary sd-book-btn ${total === 0 || !selectedTime ? 'disabled' : ''}`}
            disabled={total === 0 || !selectedTime}
            onClick={() => {
              const bookingData = {
                sitterId: id,
                sitterName: sitter.name,
                sitterAvatar: sitter.avatar,
                selectedServices: sitter.services.filter(s => selectedServices.includes(s.id)).map(s => ({ id: s.id, name: s.name, duration: s.duration, price: s.price })),
                selectedDate: currentSlots.date,
                selectedTime,
                total,
              }
              if (!isLoggedIn()) {
                sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))
                navigate(`/login?redirect=/services/${id}`)
                return
              }
              navigate('/booking/new', { state: bookingData })
            }}
          >
            立即预约
          </button>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        .sd-page {
          min-height: 100vh;
          background: var(--color-bg);
          padding-top: 60px;
        }

        /* Top Bar */
        .sd-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 60px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
        }

        .sd-topbar-inner {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 12px;
        }

        .sd-back {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          transition: all 0.25s ease;
        }

        .sd-back:hover {
          background: rgba(0,0,0,0.04);
          color: var(--color-text);
        }

        .sd-topbar-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
        }

        .sd-topbar-spacer { flex: 1; }

        /* Content */
        .sd-content {
          animation: fadeIn 0.4s ease;
        }

        .sd-section {
          padding: 28px 0;
        }

        .sd-section-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 20px;
        }

        .sd-section-header h2 {
          font-size: 19px;
          font-weight: 700;
          color: var(--color-text);
        }

        .sd-section-sub {
          font-size: 13px;
          color: var(--color-text-muted);
        }

        /* Sitter Profile */
        .sd-sitter-section { padding-top: 24px; }

        .sd-sitter-card {
          background: var(--color-bg-alt);
          border-radius: var(--radius-lg);
          padding: 28px;
          display: flex;
          gap: 20px;
          border: 1px solid var(--color-border);
          position: relative;
          transition: box-shadow 0.3s ease;
        }

        .sd-sitter-card:hover {
          box-shadow: var(--shadow-md);
        }

        .sd-sitter-avatar {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          flex-shrink: 0;
        }

        .sd-sitter-info { flex: 1; min-width: 0; }

        .sd-sitter-name {
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .sd-sitter-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .sd-stars { display: inline-flex; gap: 1px; }
        .sd-star.full { color: #FFD93D; fill: #FFD93D; }
        .sd-star.half { color: #FFD93D; }
        .sd-star.empty { color: #E0E0E0; }

        .sd-rating-num {
          font-weight: 700;
          color: var(--color-text);
        }

        .sd-rating-reviews { color: var(--color-text-muted); }
        .sd-rating-divider { color: var(--color-border); margin: 0 2px; }

        .sd-sitter-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .sd-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-secondary);
          background: var(--color-secondary-light);
        }

        .sd-sitter-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }

        .sd-sitter-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }

        .sd-act-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: all 0.25s ease;
        }

        .sd-act-btn:hover {
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        /* Service Items */
        .sd-service-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sd-service-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--color-bg-alt);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }

        .sd-service-item:hover {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
          transform: translateX(4px);
        }

        .sd-service-item.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .sd-si-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.3s ease;
        }

        .sd-si-check.checked {
          background: var(--color-primary-gradient);
          border-color: var(--color-primary);
          color: #fff;
        }

        .sd-si-body { flex: 1; }

        .sd-si-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .sd-si-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
        }

        .sd-si-price {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-primary);
        }

        .sd-si-duration {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--color-text-muted);
          margin-bottom: 6px;
        }

        .sd-si-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        /* Date Tabs */
        .sd-date-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .sd-date-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          background: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          transition: all 0.3s ease;
        }

        .sd-date-tab:hover { border-color: var(--color-primary); color: var(--color-primary); }

        .sd-date-tab.active {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }

        /* Time Grid */
        .sd-time-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .sd-time-slot {
          padding: 12px 8px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          border: 1px solid var(--color-border);
          background: var(--color-bg-alt);
          color: var(--color-text);
          transition: all 0.25s ease;
        }

        .sd-time-slot:hover:not(.unavailable) {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
          transform: translateY(-1px);
        }

        .sd-time-slot.selected {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }

        .sd-time-slot.unavailable {
          background: #F5F5F7;
          color: var(--color-text-muted);
          border-color: transparent;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        /* Reviews */
        .sd-review-summary {
          display: flex;
          gap: 32px;
          padding: 24px;
          background: var(--color-bg-alt);
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          border: 1px solid var(--color-border);
        }

        .sd-rs-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-width: 100px;
        }

        .sd-rs-num {
          font-size: 42px;
          font-weight: 800;
          color: var(--color-text);
          line-height: 1;
        }

        .sd-rs-label {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .sd-rs-bars { flex: 1; display: flex; flex-direction: column; gap: 6px; justify-content: center; }

        .sd-rs-bar-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sd-rs-bar-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          width: 28px;
          flex-shrink: 0;
        }

        .sd-rs-bar-track {
          flex: 1;
          height: 6px;
          background: var(--color-border);
          border-radius: 3px;
          overflow: hidden;
        }

        .sd-rs-bar-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        .sd-rs-bar-pct {
          font-size: 11px;
          color: var(--color-text-muted);
          width: 32px;
          text-align: right;
        }

        .sd-review-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sd-review-card {
          padding: 20px;
          background: var(--color-bg-alt);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: box-shadow 0.3s ease;
        }

        .sd-review-card:hover { box-shadow: var(--shadow-sm); }

        .sd-rc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .sd-rc-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sd-rc-avatar { font-size: 28px; }

        .sd-rc-name {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
        }

        .sd-rc-date {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .sd-rc-text {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }

        .sd-rc-images {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          align-items: center;
        }

        .sd-rc-img-placeholder {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          background: var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
        }

        .sd-rc-img-more {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-primary);
        }

        .sd-view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-primary);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          transition: background 0.25s ease;
        }

        .sd-view-all:hover { background: var(--color-primary-light); }

        /* Bottom Bar */
        .sd-bottom-spacer { height: 80px; }

        .sd-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--color-border);
          padding: 12px 0;
          animation: fadeInUp 0.3s ease;
        }

        .sd-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .sd-bottom-info {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .sd-bottom-label {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .sd-bottom-price {
          font-size: 24px;
          font-weight: 800;
          color: var(--color-primary);
        }

        .sd-price-num {
          font-size: 28px;
        }

        .sd-bottom-hint {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .sd-book-btn {
          padding: 14px 40px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .sd-book-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sd-sitter-card { flex-direction: column; align-items: center; text-align: center; padding: 24px 20px; }
          .sd-sitter-rating { justify-content: center; }
          .sd-sitter-badges { justify-content: center; }
          .sd-sitter-actions { flex-direction: row; justify-content: center; }
          .sd-time-grid { grid-template-columns: repeat(3, 1fr); }
          .sd-review-summary { flex-direction: column; align-items: center; text-align: center; gap: 16px; }
          .sd-rs-bar-row { width: 100%; }
          .sd-date-tabs { flex-wrap: wrap; }
          .sd-bottom-price { font-size: 20px; }
          .sd-price-num { font-size: 24px; }
          .sd-book-btn { padding: 12px 28px; font-size: 15px; }
        }

        @media (max-width: 480px) {
          .sd-time-grid { grid-template-columns: repeat(2, 1fr); }
          .sd-sitter-avatar { width: 64px; height: 64px; font-size: 30px; }
        }
      `}</style>
    </div>
  )
}
