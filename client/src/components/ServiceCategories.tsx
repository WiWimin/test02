import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dog, Cat, Bath, Stethoscope, Utensils, ChevronRight } from 'lucide-react'
import { isLoggedIn } from '../utils/auth'

const services = [
  { icon: Dog, label: '遛狗', id: 'dog-walk', desc: '小区或公园遛狗，含排泄清理', color: '#FF7D5A', gradient: 'linear-gradient(135deg, #FF7D5A, #FF6B3D)', category: 'walk' },
  { icon: Cat, label: '上门喂猫', id: 'cat-feeding', desc: '喂食、换水、清理猫砂盆', color: '#45B7A0', gradient: 'linear-gradient(135deg, #45B7A0, #3A9E89)', category: 'feed' },
  { icon: Bath, label: '宠物清洁', id: 'pet-bath', desc: '洗澡、梳毛、指甲修剪', color: '#4A90D9', gradient: 'linear-gradient(135deg, #4A90D9, #3A7BC8)', category: 'clean' },
  { icon: Stethoscope, label: '医疗陪护', id: 'vet-care', desc: '宠物医院陪同、术后护理', color: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)', category: 'medical' },
  { icon: Utensils, label: '上门喂食', id: 'pet-feeding', desc: '定时喂食、换水、简单陪伴', color: '#E67E22', gradient: 'linear-gradient(135deg, #E67E22, #D35400)', category: 'feed' },
]

export default function ServiceCategories() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  const handleClick = (svc: typeof services[0]) => {
    if (isLoggedIn()) {
      navigate(`/home/owner/market?category=${svc.label}`)
    } else {
      navigate(`/login?redirect=/home/owner/market?category=${encodeURIComponent(svc.label)}`)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="section services-section" id="services">
      <div className="container">
        <div className={`section-title ${isVisible ? 'visible' : ''}`}>
          <h2>选择服务类型</h2>
          <p>为您的毛孩子挑选合适的服务</p>
          <span className="accent-line" />
        </div>
        <div className="services-grid">
          {services.map((svc, i) => (
            <button
              key={svc.label}
              onClick={() => handleClick(svc)}
              className={`service-card ${isVisible ? 'visible' : ''}`}
              style={{ '--delay': `${i * 0.1}s`, '--card-color': svc.color } as React.CSSProperties}
            >
              <div className="sc-icon-wrap" style={{ background: svc.gradient }}>
                <svc.icon size={28} />
              </div>
              <h3 className="sc-title">{svc.label}</h3>
              <p className="sc-desc">{svc.desc}</p>
              <span className="sc-link">
                查看详情 <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .services-section { background: var(--color-bg); }

        .section-title {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .section-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .service-card {
          background: var(--color-bg-alt);
          border-radius: var(--radius-lg);
          padding: 32px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--color-border);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }

        .service-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition-delay: var(--delay, 0s);
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-color, var(--color-primary));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          border-color: transparent;
        }

        .service-card:hover::before {
          opacity: 1;
        }

        .sc-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: transform 0.3s ease;
        }

        .service-card:hover .sc-icon-wrap {
          transform: scale(1.1) rotate(-5deg);
        }

        .sc-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text);
        }

        .sc-desc {
          font-size: 13px;
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        .sc-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--card-color, var(--color-primary));
          display: inline-flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s ease;
        }

        .service-card:hover .sc-link {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 640px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .service-card { padding: 24px 16px; }
          .sc-icon-wrap { width: 50px; height: 50px; }
          .sc-icon-wrap svg { width: 22px; height: 22px; }
        }

        @media (max-width: 400px) {
          .services-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  )
}
