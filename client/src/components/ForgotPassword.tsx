import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PawPrint, Phone, Lock, CheckCircle2, XCircle, Loader2, Smartphone, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { sendVerificationCode } from '../utils/auth'
import { api } from '../utils/api'

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (p: string): { level: number; label: string; color: string } => {
    let level = 0
    if (p.length >= 8) level++
    if (/(?=.*[a-zA-Z])/.test(p)) level++
    if (/(?=.*\d)/.test(p)) level++
    if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(p)) level++
    const map = [
      { level: 0, label: '', color: 'transparent' },
      { level: 1, label: '弱', color: '#FF6B6B' },
      { level: 2, label: '中', color: '#FFA94D' },
      { level: 3, label: '强', color: '#45B7A0' },
      { level: 4, label: '很强', color: '#2ECC71' },
    ]
    return map[level] || map[0]
  }
  const s = useMemo(() => getStrength(password), [password])
  if (!password) return null
  return <span className="ps-label" style={{ color: s.color }}>{s.label}</span>
}

function Toast({ message, type, duration = 3000, onClose }: { message: string; type: 'success' | 'error'; duration?: number; onClose: () => void }) {
  const cb = useRef(onClose)
  cb.current = onClose
  useEffect(() => { const t = setTimeout(() => cb.current(), duration); return () => clearTimeout(t) }, [duration])
  return (
    <div className={`fp-toast fp-toast-${type}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {message}
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error'; duration?: number } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d{0,4})(\d{0,4})/, (_, a, b, c) => b ? `${a} ${b}${c ? ` ${c}` : ''}` : a)

  const sendCode = async () => {
    const raw = phone.replace(/\s/g, '')
    if (!/^1\d{10}$/.test(raw)) { setErrors({ phone: '请输入正确手机号' }); return }
    setErrors({})
    setLoading(true)
    try {
      const result = await sendVerificationCode(raw)
      if (result.code) setToast({ msg: `开发环境验证码: ${result.code}（30秒后关闭）`, type: 'success', duration: 30000 })
      else setToast({ msg: '验证码已发送', type: 'success' })
      setCountdown(60)
      const id = setInterval(() => {
        setCountdown(prev => { if (prev <= 1) { clearInterval(id); return 0 }; return prev - 1 })
      }, 1000)
    } catch {
      setToast({ msg: '发送失败，请稍后再试', type: 'error' })
    } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    const errs: Record<string, string> = {}
    const raw = phone.replace(/\s/g, '')
    if (!/^1\d{10}$/.test(raw)) errs.phone = '请输入正确手机号'
    if (!/^\d{6}$/.test(code)) errs.code = '请输入6位验证码'
    if (!password) errs.password = '请设置密码'
    else if (password.length < 8) errs.password = '密码至少8位'
    else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) errs.password = '需包含字母和数字'
    if (password !== confirmPwd) errs.confirm = '两次密码不一致'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { phone: raw, code, password })
      setSuccess(true)
    } catch (err: any) {
      setToast({ msg: err.message || '重置失败', type: 'error' })
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="fp-page">
        <div className="fp-card fp-card-success">
          <div className="fp-success-icon"><CheckCircle2 size={48} /></div>
          <h2 className="fp-title">密码重置成功</h2>
          <p className="fp-desc">请使用新密码登录</p>
          <button className="fp-btn" onClick={() => navigate('/login')}>返回登录</button>
        </div>
        <style>{`
          .fp-card-success { text-align: center; }
          .fp-success-icon { color: var(--color-primary); margin-bottom: 16px; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-logo">
          <div className="fp-logo-icon"><PawPrint size={22} weight="fill" /></div>
          <span className="fp-logo-text">PetCare</span>
        </div>
        <div className="fp-title-row">
          <button className="fp-back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <h2 className="fp-title">忘记密码</h2>
        </div>
        <p className="fp-desc">输入手机号获取验证码，重置密码</p>

        <div className={`fp-field ${errors.phone ? 'error' : ''}`}>
          <div className="fp-icon"><Phone size={18} /></div>
          <input type="tel" placeholder="手机号" value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))} />
          {errors.phone && <span className="fp-err">{errors.phone}</span>}
        </div>

        <div className={`fp-field ${errors.code ? 'error' : ''}`}>
          <div className="fp-icon"><Smartphone size={18} /></div>
          <input type="text" placeholder="验证码" maxLength={6} value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          <button type="button" className="fp-code-btn" onClick={sendCode} disabled={loading || countdown > 0}>
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </button>
          {errors.code && <span className="fp-err">{errors.code}</span>}
        </div>

        <div className={`fp-field ${errors.password ? 'error' : ''}`}>
          <div className="fp-icon"><Lock size={18} /></div>
          <input type={showPwd ? 'text' : 'password'} placeholder="设置新密码（至少8位）" value={password}
            onChange={e => setPassword(e.target.value)} />
          <button type="button" className="fp-toggle" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && <span className="fp-err">{errors.password}</span>}
          <PasswordStrength password={password} />
        </div>

        <div className={`fp-field ${errors.confirm ? 'error' : ''}`}>
          <div className="fp-icon"><Lock size={18} /></div>
          <input type={showConfirmPwd ? 'text' : 'password'} placeholder="确认新密码" value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)} />
          <button type="button" className="fp-toggle" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
            {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.confirm && <span className="fp-err">{errors.confirm}</span>}
        </div>

        <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 size={20} className="spin" /> : '重置密码'}
        </button>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} duration={toast.duration} onClose={() => setToast(null)} />}

      <style>{`
        .fp-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #F8F9FB 0%, #FFF5F0 50%, #F0F8F6 100%);
          padding: 24px 16px;
        }
        .fp-card {
          width: 100%; max-width: 400px;
          background: rgba(255,255,255,0.97); backdrop-filter: blur(20px);
          border-radius: 20px; padding: 40px 32px 32px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.8);
          position: relative;
        }
        .fp-title-row { display: flex; align-items: center; gap: 10px; justify-content: center; }
        .fp-back {
          width: 36px; height: 36px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          cursor: pointer; transition: all 0.2s;
        }
        .fp-back:hover { background: #f5f5f5; }
        .fp-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; }
        .fp-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #FF7D5A, #FF9F7A);
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .fp-logo-text { font-size: 20px; font-weight: 800; color: var(--color-text); letter-spacing: -0.3px; }
        .fp-title { text-align: center; font-size: 22px; font-weight: 700; color: var(--color-text); margin-bottom: 8px; }
        .fp-desc { text-align: center; font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px; }
        .fp-field {
          display: flex; align-items: center; flex-wrap: wrap;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-sm); margin-bottom: 18px;
          background: var(--color-bg);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .fp-field:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.08); }
        .fp-field.error { border-color: var(--color-error); }
        .fp-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; }
        .fp-field input { flex: 1; height: 44px; border: none; background: transparent; font-size: 14px; color: var(--color-text); outline: none; padding-right: 8px; min-width: 0; }
        .fp-field input::placeholder { color: var(--color-text-muted); }
        .fp-err { width: 100%; padding: 4px 44px 6px; font-size: 12px; color: var(--color-error); }
        .ps-label { font-size: 11px; font-weight: 600; margin-left: auto; padding: 0 8px 6px 0; }
        .fp-toggle, .fp-code-btn { flex-shrink: 0; }
        .fp-toggle { width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .fp-code-btn { height: 36px; padding: 0 14px; margin-right: 4px; border-radius: 6px; font-size: 13px; font-weight: 600; color: var(--color-primary); white-space: nowrap; }
        .fp-code-btn:disabled { color: var(--color-text-muted); cursor: not-allowed; }
        .fp-btn {
          width: 100%; height: 48px; border-radius: var(--radius-sm);
          background: linear-gradient(135deg, #FF7D5A, #FF9F7A); color: #fff;
          font-size: 16px; font-weight: 700; letter-spacing: 2px;
          box-shadow: 0 4px 15px rgba(255,125,90,0.3);
          transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;
          margin-top: 8px;
        }
        .fp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,125,90,0.4); }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-success-icon { text-align: center; color: var(--color-primary); margin-bottom: 16px; }
        .fp-toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; display: flex; align-items: center; gap: 10px;
          padding: 14px 24px; border-radius: var(--radius-md);
          font-size: 14px; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: fadeInUp 0.35s ease; max-width: 90vw;
        }
        .fp-toast-success { background: #E8F8F4; color: #3A9E89; border: 1px solid #45B7A0; }
        .fp-toast-error { background: #FFF0F0; color: #E86A4A; border: 1px solid #FF6B6B; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  )
}