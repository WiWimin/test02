import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Shield, Sparkles } from 'lucide-react'

export default function HeroSection() {
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
    <section ref={ref} className="hero" id="hero">
      <div className="hero-bg" />
      <div className="hero-content container">
        <div className={`hero-text ${isVisible ? 'visible' : ''}`}>
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>专业宠物上门服务平台</span>
          </div>
          <h1 className="hero-title">
            把专业的宠物护理<br />
            <span className="hero-highlight">带到您家</span>
          </h1>
          <p className="hero-desc">
            严格筛选的服务者 &middot; 实时服务追踪 &middot; 全程保险保障<br />
            让您的毛孩子在家也能享受专业级照顾
          </p>
          <div className="hero-actions">
            <a href="#services" className="btn btn-primary btn-hero">
              立即预约 <ArrowRight size={18} />
            </a>
            <a href="#sitters" className="btn btn-outline btn-hero">
              了解更多
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">2,800+</span>
              <span className="stat-label">活跃服务者</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">15,000+</span>
              <span className="stat-label">已完成服务</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">4.9</span>
              <span className="stat-label">平均评分</span>
            </div>
          </div>
        </div>
        <div className={`hero-visual ${isVisible ? 'visible' : ''}`}>
          <div className="hero-illustration">
            <div className="floating-shape shape-1" />
            <div className="floating-shape shape-2" />
            <div className="floating-shape shape-3" />
            <div className="hero-card-main">
              <div className="hc-icon"><Shield size={32} /></div>
              <div className="hc-text">
                <span className="hc-title">安心保障</span>
                <span className="hc-desc">每一单都有保险护航</span>
              </div>
            </div>
            <div className="hero-card-sub card-sub-1">
              <span className="hc-emoji">🐕</span>
              <span>遛狗服务</span>
            </div>
            <div className="hero-card-sub card-sub-2">
              <span className="hc-emoji">🐈</span>
              <span>上门喂猫</span>
            </div>
            <div className="hero-card-sub card-sub-3">
              <span className="hc-emoji">🛁</span>
              <span>宠物清洁</span>
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="pet-paw" style={{ '--i': i } as React.CSSProperties}>
                🐾
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 C320,120 720,0 1440,50 L1440,100 L0,100 Z" fill="#F8F9FB" />
        </svg>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: var(--header-height);
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 10% 20%, rgba(255,125,90,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 80%, rgba(69,183,160,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,217,61,0.06) 0%, transparent 50%);
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
          padding-top: 40px;
          padding-bottom: 60px;
        }

        .hero-text {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.2s;
        }

        .hero-text.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease 0.4s both;
        }

        .hero-title {
          font-size: 52px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1.5px;
          color: var(--color-text);
          margin-bottom: 20px;
          animation: fadeInUp 0.6s ease 0.5s both;
        }

        .hero-highlight {
          background: var(--color-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .hero-highlight::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 8px;
          background: var(--color-primary-gradient);
          opacity: 0.15;
          border-radius: 4px;
        }

        .hero-desc {
          font-size: 17px;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin-bottom: 32px;
          animation: fadeInUp 0.6s ease 0.6s both;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
          animation: fadeInUp 0.6s ease 0.7s both;
        }

        .btn-hero {
          padding: 14px 32px;
          font-size: 16px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 32px;
          animation: fadeInUp 0.6s ease 0.8s both;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-num {
          font-size: 28px;
          font-weight: 800;
          color: var(--color-text);
          letter-spacing: -0.5px;
        }

        .stat-label {
          font-size: 13px;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--color-border);
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transform: translateX(30px);
          transition: all 0.8s ease 0.4s;
        }

        .hero-visual.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .hero-illustration {
          position: relative;
          width: 480px;
          height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(255,125,90,0.12), rgba(255,125,90,0.03));
          animation-delay: 0s;
        }

        .shape-2 {
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(69,183,160,0.10), rgba(69,183,160,0.02));
          animation-delay: -2s;
          top: 50px;
          right: 20px;
        }

        .shape-3 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(255,217,61,0.10), rgba(255,217,61,0.02));
          animation-delay: -4s;
          bottom: 60px;
          left: 30px;
        }

        .hero-card-main {
          position: relative;
          z-index: 2;
          width: 200px;
          padding: 28px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-radius: var(--radius-lg);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          animation: float 5s ease-in-out infinite;
        }

        .hc-icon {
          width: 56px;
          height: 56px;
          background: var(--color-primary-gradient);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .hc-text {
          display: flex;
          flex-direction: column;
        }

        .hc-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text);
        }

        .hc-desc {
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .hero-card-sub {
          position: absolute;
          z-index: 1;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          animation: float 6s ease-in-out infinite;
        }

        .hc-emoji { font-size: 20px; }

        .card-sub-1 { top: 40px; right: 10px; animation-delay: -1s; }
        .card-sub-2 { bottom: 100px; left: 0; animation-delay: -3s; }
        .card-sub-3 { right: 20px; bottom: 60px; animation-delay: -5s; }

        .pet-paw {
          position: absolute;
          font-size: 16px;
          opacity: 0.15;
          animation: float 4s ease-in-out infinite;
          animation-delay: calc(var(--i) * -0.7s);
          pointer-events: none;
        }

        .pet-paw:nth-child(1) { top: 10%; left: 5%; font-size: 14px; }
        .pet-paw:nth-child(2) { top: 5%; right: 15%; font-size: 18px; }
        .pet-paw:nth-child(3) { top: 40%; right: 0; font-size: 12px; }
        .pet-paw:nth-child(4) { bottom: 20%; left: 5%; font-size: 20px; }
        .pet-paw:nth-child(5) { bottom: 5%; right: 30%; font-size: 14px; }
        .pet-paw:nth-child(6) { top: 60%; left: 0; font-size: 16px; }

        /* Wave divider */
        .hero-wave {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          line-height: 0;
        }

        .hero-wave svg {
          width: 100%;
          height: 70px;
        }

        @media (max-width: 1024px) {
          .hero-title { font-size: 42px; }
          .hero-illustration { width: 400px; height: 400px; }
        }

        @media (max-width: 768px) {
          .hero { min-height: auto; padding-top: calc(var(--header-height) + 20px); }

          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
            padding-top: 20px;
          }

          .hero-text { text-align: center; }
          .hero-title { font-size: 36px; }
          .hero-desc { font-size: 15px; }
          .hero-actions { justify-content: center; flex-wrap: wrap; }
          .hero-stats { justify-content: center; flex-wrap: wrap; gap: 24px; }

          .hero-visual { display: none; }

          .hero-wave svg { height: 40px; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 30px; }
          .hero-stats { gap: 16px; }
          .stat-num { font-size: 22px; }
        }
      `}</style>
    </section>
  )
}
