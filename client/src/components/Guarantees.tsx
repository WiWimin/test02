import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, MapPin, MessageCircle, Heart, ChevronRight } from 'lucide-react'

const guarantees = [
  { id: 'real-name', icon: ShieldCheck, label: '实名认证', desc: '每位服务者都经过严格的身份审核，确认真实可靠', color: '#FF7D5A' },
  { id: 'insurance', icon: Heart, label: '宠物保险', desc: '每笔订单都享有宠物意外保险保障，最高赔付5000元', color: '#45B7A0' },
  { id: 'tracking', icon: MapPin, label: '实时定位', desc: '服务过程实时追踪，随时了解服务者位置和进展', color: '#4A90D9' },
  { id: 'chat', icon: MessageCircle, label: '在线沟通', desc: '与服务者实时沟通，全程无忧，支持图片和语音', color: '#9B59B6' },
]

export default function Guarantees() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="section guarantees-section" id="guarantees">
      <div className="container">
        <div className={`section-title ${isVisible ? 'visible' : ''}`}>
          <h2>服务保障</h2>
          <p>让您每一次托付都安心</p>
          <span className="accent-line" />
        </div>
        <div className="guarantees-grid">
          {guarantees.map((g, i) => (
            <Link
              key={g.label}
              to={`/guarantee/${g.id}`}
              className={`guarantee-card ${isVisible ? 'visible' : ''}`}
              style={{ '--delay': `${i * 0.12}s`, '--card-color': g.color } as React.CSSProperties}
            >
              <div className="gc-icon" style={{ background: `${g.color}15`, color: g.color }}>
                <g.icon size={28} />
              </div>
              <h3 className="gc-label">{g.label}</h3>
              <p className="gc-desc">{g.desc}</p>
              <span className="gc-link">了解详情 <ChevronRight size={13} /></span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .guarantees-section { background: var(--color-bg); }

        .guarantees-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .guarantee-card {
          background: var(--color-bg-alt);
          border-radius: var(--radius-lg);
          padding: 36px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--color-border);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          transform: translateY(30px);
        }

        .guarantee-card.visible {
          opacity: 1;
          transform: translateY(0);
          transition-delay: var(--delay, 0s);
        }

        .guarantee-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.06);
          border-color: var(--card-color);
        }

        .gc-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .guarantee-card:hover .gc-icon {
          transform: scale(1.1) rotate(-5deg);
        }

        .gc-label {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text);
        }

          .gc-desc {
          font-size: 13px;
          color: var(--color-text-muted);
          line-height: 1.6;
          max-width: 200px;
        }
        .gc-link {
          font-size: 12px; font-weight: 600; color: var(--card-color);
          display: inline-flex; align-items: center; gap: 2px;
          opacity: 0; transform: translateY(4px);
          transition: all 0.3s ease; margin-top: auto;
        }
        .guarantee-card:hover .gc-link { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          .guarantees-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .guarantee-card { padding: 28px 16px; }
        }

        @media (max-width: 400px) {
          .guarantees-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
