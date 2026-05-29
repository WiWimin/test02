import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PawPrint, ChevronRight, User, Briefcase, Shield, ArrowLeft, ShieldCheck } from 'lucide-react'
import { UserRole } from '../utils/auth'

interface RoleSelectProps {
  mode: 'login' | 'register'
}

const roleOptions: { role: UserRole; icon: typeof User; label: string; desc: string; color: string }[] = [
  { role: 'owner', icon: User, label: '宠物主人', desc: '为爱宠寻找专业服务', color: 'var(--color-primary)' },
  { role: 'sitter', icon: Briefcase, label: '服务商', desc: '提供宠物照料服务', color: 'var(--color-secondary)' },
  { role: 'admin', icon: Shield, label: '管理员', desc: '系统运营管理', color: '#FFD93D' },
]

export default function RoleSelect({ mode }: RoleSelectProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const handleSelect = (role: UserRole) => {
    let path = `/auth?mode=${mode}&role=${role}`
    if (redirectTo) path += `&redirect=${encodeURIComponent(redirectTo)}`
    navigate(path)
  }

  return (
    <div className="rs-page">
      <div className="rs-bg">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="rs-bg-paw" style={{
            '--i': i,
            left: `${10 + (i * 11) % 80}%`,
            top: `${5 + (i * 13 + 7) % 85}%`,
            fontSize: `${16 + (i * 4) % 20}px`,
            animationDelay: `${i * 0.7}s`,
          } as React.CSSProperties}>🐾</span>
        ))}
        <div className="rs-bg-glow glow-1" />
        <div className="rs-bg-glow glow-2" />
      </div>

      <button className="rs-mobile-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </button>

      <div className="rs-container">
        <div className="rs-card">
          <div className="rs-logo">
            <div className="rs-logo-icon"><PawPrint size={22} weight="fill" /></div>
            <span className="rs-logo-text">PetCare</span>
          </div>

          <h1 className="rs-title">选择身份</h1>
          <p className="rs-subtitle">请选择您的身份以继续</p>

          <div className="rs-role-step">
            {roleOptions.map(opt => {
              const Icon = opt.icon
              return (
                <button key={opt.role} className="rs-role-card" onClick={() => handleSelect(opt.role)}>
                  <div className="rrc-icon" style={{ background: opt.color + '18', color: opt.color }}>
                    <Icon size={28} />
                  </div>
                  <div className="rrc-info">
                    <span className="rrc-label">{opt.label}</span>
                    <span className="rrc-desc">{opt.desc}</span>
                  </div>
                  <ChevronRight size={20} className="rrc-arrow" />
                </button>
              )
            })}
          </div>

          <p className="rs-trust">
            <ShieldCheck size={14} /> 已通过公安部信息安全等级保护三级认证
          </p>
        </div>
      </div>

      <style>{`
        .rs-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #F8F9FB 0%, #FFF5F0 50%, #F0F8F6 100%);
          position: relative; padding: 24px 16px;
        }
        .rs-mobile-back {
          position: fixed; top: 16px; left: 16px; z-index: 10;
          width: 40px; height: 40px; border-radius: var(--radius-full);
          display: none; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.9); color: var(--color-text-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .rs-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .rs-bg-paw {
          position: absolute; opacity: 0.06;
          animation: float 6s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.7s);
        }
        .rs-bg-glow { position: absolute; border-radius: 50%; filter: blur(60px); }
        .glow-1 { width: 300px; height: 300px; background: rgba(255,125,90,0.10); top: -80px; right: -60px; }
        .glow-2 { width: 250px; height: 250px; background: rgba(69,183,160,0.08); bottom: -60px; left: -60px; }
        .rs-container { position: relative; z-index: 1; width: 100%; max-width: 420px; }
        .rs-card {
          background: rgba(255,255,255,0.97); backdrop-filter: blur(20px);
          border-radius: 20px; padding: 40px 32px 32px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.8);
        }
        .rs-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; }
        .rs-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #FF7D5A, #FF9F7A);
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .rs-logo-text { font-size: 20px; font-weight: 800; color: var(--color-text); letter-spacing: -0.3px; }
        .rs-title { text-align: center; font-size: 24px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
        .rs-subtitle { text-align: center; font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px; }
        .rs-role-step { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .rs-role-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: var(--radius-md);
          border: 1.5px solid var(--color-border);
          background: var(--auth-card-bg, #fff);
          cursor: pointer; transition: all 0.25s ease;
          text-align: left; width: 100%;
        }
        .rs-role-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 16px rgba(255,125,90,0.12);
          transform: translateY(-1px);
        }
        .rrc-icon { width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); }
        .rrc-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .rrc-label { font-size: 15px; font-weight: 600; color: var(--color-text); }
        .rrc-desc { font-size: 12px; color: var(--color-text-muted); }
        .rrc-arrow { color: var(--color-text-muted); }
        .rs-trust {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 12px; color: var(--color-text-muted);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }
        @media (max-width: 480px) {
          .rs-card { padding: 28px 20px 24px; border-radius: 16px; }
          .rs-title { font-size: 22px; }
          .rs-mobile-back { display: flex; }
        }
      `}</style>
    </div>
  )
}
