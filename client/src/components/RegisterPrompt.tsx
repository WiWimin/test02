import { Link } from 'react-router-dom'
import { UserPlus, ChevronRight, Sparkles } from 'lucide-react'

interface RegisterPromptProps {
  variant?: 'banner' | 'card' | 'inline'
}

export default function RegisterPrompt({ variant = 'banner' }: RegisterPromptProps) {
  if (variant === 'card') {
    return (
      <div className="rp-card">
        <div className="rp-card-bg" />
        <div className="rp-card-content">
          <Sparkles size={20} />
          <span>注册后享受更完整服务</span>
          <Link to="/register" className="rp-card-link">
            立即注册 <ChevronRight size={14} />
          </Link>
        </div>
        <style>{`
          .rp-card {
            position: relative; border-radius: var(--radius-md); overflow: hidden;
            margin-top: 16px;
          }
          .rp-card-bg {
            position: absolute; inset: 0;
            background: linear-gradient(135deg, #FF7D5A 0%, #FF9F7A 100%);
            opacity: 0.1;
          }
          .rp-card-content {
            position: relative; display: flex; align-items: center; gap: 8px;
            padding: 12px 16px; color: var(--color-primary); font-size: 13px; font-weight: 600;
            z-index: 1;
          }
          .rp-card-link {
            margin-left: auto; display: flex; align-items: center; gap: 2px;
            color: var(--color-primary); font-weight: 700; font-size: 13px;
          }
          .rp-card-link:hover { opacity: 0.8; }
        `}</style>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="rp-inline">
        <Sparkles size={14} />
        <span>注册后享受更完整服务</span>
        <Link to="/register" className="rp-inline-link">去注册 →</Link>
        <style>{`
          .rp-inline {
            display: flex; align-items: center; gap: 6px;
            padding: 8px 14px; border-radius: var(--radius-sm);
            background: linear-gradient(135deg, #FFF5F0, #FFF0EB);
            color: var(--color-primary); font-size: 12px; font-weight: 500;
            margin-bottom: 16px;
          }
          .rp-inline-link {
            margin-left: auto; font-weight: 700; font-size: 12px; color: var(--color-primary);
            text-decoration: underline; text-underline-offset: 2px;
          }
        `}</style>
      </div>
    )
  }

  /* banner variant (default) */
  return (
    <section className="rp-banner">
      <div className="rp-banner-bg" />
      <div className="rp-banner-content container">
        <div className="rp-banner-text">
          <h2 className="rp-banner-title">注册后享受更完整服务</h2>
          <p className="rp-banner-desc">预约上门、在线沟通、订单追踪，解锁所有宠物服务</p>
        </div>
        <Link to="/register" className="rp-banner-btn">
          <UserPlus size={18} /> 免费注册 <ChevronRight size={16} />
        </Link>
      </div>
      <style>{`
        .rp-banner {
          position: relative; overflow: hidden;
          padding: 48px 0;
        }
        .rp-banner-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        .rp-banner-content {
          position: relative; display: flex; align-items: center;
          justify-content: space-between; gap: 24px; z-index: 1;
        }
        .rp-banner-text { flex: 1; }
        .rp-banner-title {
          font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 8px;
        }
        .rp-banner-desc {
          font-size: 15px; color: rgba(255,255,255,0.7); margin: 0;
        }
        .rp-banner-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: var(--radius-sm);
          background: var(--color-primary); color: #fff;
          font-size: 15px; font-weight: 700; white-space: nowrap;
          transition: all 0.3s ease; flex-shrink: 0;
        }
        .rp-banner-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,125,90,0.4); }
        @media (max-width: 640px) {
          .rp-banner { padding: 32px 16px; }
          .rp-banner-content { flex-direction: column; text-align: center; }
          .rp-banner-title { font-size: 20px; }
          .rp-banner-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  )
}
