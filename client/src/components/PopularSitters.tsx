import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, ShieldCheck } from 'lucide-react'

const sitters = [
  {
    name: '张阿姨',
    id: 'sitter-zhang',
    avatar: '👩',
    bgColor: '#FFF0EB',
    rating: 4.9,
    reviews: 128,
    distance: '1.2km',
    tags: ['遛狗', '喂食', '清洁'],
    badge: '金牌服务者',
    verified: true,
  },
  {
    name: '李明',
    id: 'sitter-li',
    avatar: '👨',
    bgColor: '#E8F8F4',
    rating: 4.8,
    reviews: 96,
    distance: '2.5km',
    tags: ['上门喂猫', '遛狗'],
    badge: '五星服务者',
    verified: true,
  },
  {
    name: '小王',
    id: 'sitter-wang',
    avatar: '👩',
    bgColor: '#FFF8E0',
    rating: 4.9,
    reviews: 203,
    distance: '0.8km',
    tags: ['全能服务', '医疗陪护'],
    badge: '金牌服务者',
    verified: true,
  },
]

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <span className="stars">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={`star ${i < full ? 'star-full' : i === full && hasHalf ? 'star-half' : 'star-empty'}`}
        />
      ))}
    </span>
  )
}

export default function PopularSitters() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="section sitters-section" id="sitters">
      <div className="container">
        <div className={`section-title ${isVisible ? 'visible' : ''}`}>
          <h2>热门服务者</h2>
          <p>附近最受欢迎的服务者，由宠物主人真实评价推荐</p>
          <span className="accent-line" />
        </div>
        <div className="sitters-grid">
          {sitters.map((sitter, i) => (
            <div
              key={sitter.name}
              className={`sitter-card ${isVisible ? 'visible' : ''}`}
              style={{ '--delay': `${i * 0.15}s` } as React.CSSProperties}
            >
              <div className="sitter-badge">{sitter.badge}</div>
              <div className="sitter-avatar" style={{ background: sitter.bgColor }}>
                <span className="sitter-emoji">{sitter.avatar}</span>
              </div>
              <h3 className="sitter-name">{sitter.name}</h3>
              <div className="sitter-rating">
                <StarRating rating={sitter.rating} />
                <span className="sitter-rate-num">{sitter.rating}</span>
                <span className="sitter-reviews">({sitter.reviews}单)</span>
              </div>
              <div className="sitter-meta">
                <span className="sitter-meta-item">
                  <MapPin size={13} /> {sitter.distance}
                </span>
                {sitter.verified && (
                  <span className="sitter-meta-item verified">
                    <ShieldCheck size={13} /> 已认证
                  </span>
                )}
              </div>
              <div className="sitter-tags">
                {sitter.tags.map(tag => (
                  <span key={tag} className="sitter-tag">{tag}</span>
                ))}
              </div>
              <Link to={`/services/${sitter.id}`} className="btn btn-primary sitter-btn">
                预约服务
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sitters-section { background: var(--color-bg-alt); }

        .sitters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .sitter-card {
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 32px 24px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--color-border);
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          transform: translateY(30px);
        }

        .sitter-card.visible {
          opacity: 1;
          transform: translateY(0);
          transition-delay: var(--delay, 0s);
        }

        .sitter-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          border-color: transparent;
        }

        .sitter-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          background: var(--color-primary-gradient);
          color: #fff;
        }

        .sitter-avatar {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .sitter-card:hover .sitter-avatar {
          transform: scale(1.08);
        }

        .sitter-emoji {
          font-size: 36px;
        }

        .sitter-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text);
        }

        .sitter-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stars {
          display: inline-flex;
          gap: 1px;
        }

        .star { color: #E0E0E0; }
        .star-full { color: #FFD93D; fill: #FFD93D; }
        .star-half { color: #FFD93D; }
        .star-empty { color: #E0E0E0; }

        .sitter-rate-num {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text);
          margin-left: 2px;
        }

        .sitter-reviews {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .sitter-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .sitter-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sitter-meta-item.verified {
          color: var(--color-secondary);
        }

        .sitter-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .sitter-tag {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .sitter-btn {
          margin-top: 4px;
          padding: 10px 28px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .sitters-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
    </section>
  )
}
