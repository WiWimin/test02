import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  PawPrint, Phone, Lock, Eye, EyeOff, Loader2,
  ShieldCheck, ArrowLeft, CheckCircle2, XCircle,
  MessageCircle, Smartphone, CreditCard, User as UserIcon
} from 'lucide-react'
import { login, register, UserRole } from '../utils/auth'

const roleLabels: Record<UserRole, string> = {
  owner: '宠物主人',
  sitter: '服务商',
  admin: '管理员',
}

interface AuthPageProps {
  mode: 'login' | 'register'
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`auth-toast auth-toast-${type}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {message}
      <style>{`
        .auth-toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; display: flex; align-items: center; gap: 10px;
          padding: 14px 24px; border-radius: var(--radius-md);
          font-size: 14px; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: fadeInUp 0.35s ease; max-width: 90vw;
        }
        .auth-toast-success { background: #E8F8F4; color: #3A9E89; border: 1px solid #45B7A0; }
        .auth-toast-error { background: #FFF0F0; color: #E86A4A; border: 1px solid #FF6B6B; }
      `}</style>
    </div>
  )
}

function AuthBg() {
  return (
    <div className="auth-bg">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="auth-bg-paw" style={{
          '--i': i,
          left: `${10 + (i * 11) % 80}%`,
          top: `${5 + (i * 13 + 7) % 85}%`,
          fontSize: `${16 + (i * 4) % 20}px`,
          animationDelay: `${i * 0.7}s`,
        } as React.CSSProperties}>🐾</span>
      ))}
      <div className="auth-bg-glow glow-1" />
      <div className="auth-bg-glow glow-2" />
      <style>{`
        .auth-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .auth-bg-paw { position: absolute; opacity: 0.06; animation: float 6s ease-in-out infinite; animation-delay: calc(var(--i) * 0.7s); }
        .auth-bg-glow { position: absolute; border-radius: 50%; filter: blur(60px); }
        .glow-1 { width: 300px; height: 300px; background: rgba(255,125,90,0.10); top: -80px; right: -60px; }
        .glow-2 { width: 250px; height: 250px; background: rgba(69,183,160,0.08); bottom: -60px; left: -60px; }
      `}</style>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (p: string): { level: number; label: string; color: string; pct: string } => {
    if (!p) return { level: 0, label: '', color: 'transparent', pct: '0%' }
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++
    if (/\d/.test(p)) score++
    if (/[^a-zA-Z0-9]/.test(p)) score++
    const map = [
      { level: 1, label: '弱', color: '#FF6B6B', pct: '25%' },
      { level: 2, label: '较弱', color: '#FFD93D', pct: '50%' },
      { level: 3, label: '中等', color: '#FF9F43', pct: '75%' },
      { level: 4, label: '强', color: '#45B7A0', pct: '100%' },
    ]
    return map[Math.min(score, map.length) - 1] || map[0]
  }
  const s = getStrength(password)
  if (!password) return null
  return (
    <div className="auth-pw-strength">
      <div className="aps-bar"><div className="aps-fill" style={{ width: s.pct, background: s.color }} /></div>
      <span className="aps-label" style={{ color: s.color }}>{s.label}</span>
      <style>{`
        .auth-pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .aps-bar { flex: 1; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
        .aps-fill { height: 100%; border-radius: 2px; transition: all 0.3s ease; }
        .aps-label { font-size: 11px; font-weight: 600; min-width: 28px; text-align: right; }
      `}</style>
    </div>
  )
}

/* ── Main Component ── */

export default function AuthPage({ mode: initialMode }: AuthPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const roleParam = searchParams.get('role') as UserRole | null
  const modeParam = searchParams.get('mode') as 'login' | 'register' | null
  const role: UserRole = roleParam || 'owner'
  const [mode, setMode] = useState<'login' | 'register'>(modeParam || initialMode)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  /* Login state */
  const [loginAccount, setLoginAccount] = useState('')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPwd, setLoginPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})

  /* Register state */
  const [regPhone, setRegPhone] = useState('')
  const [regCode, setRegCode] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [assignedAccount, setAssignedAccount] = useState('')

  /* ── Validation ── */

  const formatPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d{0,4})(\d{0,4})/, (_, a, b, c) => b ? `${a} ${b}${c ? ` ${c}` : ''}` : a)

  const validateLogin = useCallback(() => {
    const errs: Record<string, string> = {}
    if (role === 'owner') {
      const raw = loginPhone.replace(/\s/g, '')
      if (!raw) errs.account = '请输入手机号'
      else if (!/^1\d{10}$/.test(raw)) errs.account = '手机号格式不正确'
    } else {
      if (!loginAccount) errs.account = '请输入账号'
    }
    if (!loginPwd) errs.password = '请输入密码'
    else if (loginPwd.length < 6) errs.password = '密码长度不足'
    setLoginErrors(errs)
    return Object.keys(errs).length === 0
  }, [loginPhone, loginAccount, loginPwd, role])

  const validateRegister = useCallback(() => {
    const errs: Record<string, string> = {}
    const raw = regPhone.replace(/\s/g, '')
    if (!raw) errs.phone = '请输入手机号'
    else if (!/^1\d{10}$/.test(raw)) errs.phone = '手机号格式不正确'
    if (!regCode) errs.code = '请输入验证码'
    else if (!/^\d{6}$/.test(regCode)) errs.code = '验证码为6位数字'
    if (!regPwd) errs.password = '请设置密码'
    else if (regPwd.length < 8) errs.password = '密码至少8位'
    else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(regPwd)) errs.password = '需包含字母和数字'
    if (regPwd !== regConfirm) errs.confirm = '两次密码不一致'
    if (!agree) errs.agree = '请阅读并同意服务条款'
    setRegErrors(errs)
    return Object.keys(errs).length === 0
  }, [regPhone, regCode, regPwd, regConfirm, agree])

  /* ── Handlers ── */

  const doRedirect = () => {
    const pending = sessionStorage.getItem('pendingBooking')
    if (pending && role === 'owner') {
      sessionStorage.removeItem('pendingBooking')
      const state = JSON.parse(pending)
      navigate('/booking/new', { state })
    } else if (redirectTo) {
      navigate(redirectTo)
    } else if (role === 'owner') {
      navigate('/home/owner')
    } else if (role === 'sitter') {
      navigate('/sitter/dashboard')
    } else if (role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return
    setLoading(true)
    try {
      const accountId = role === 'owner' ? loginPhone.replace(/\s/g, '') : loginAccount
      await login(accountId, loginPwd)
      setToast({ msg: '登录成功，欢迎回来！', type: 'success' })
      doRedirect()
    } catch (err: any) {
      setToast({ msg: err.message || '登录失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return
    setLoading(true)
    try {
      const result = await register({
        phone: regPhone.replace(/\s/g, ''),
        password: regPwd,
        name: '用户' + regPhone.replace(/\s/g, '').slice(-4),
        role,
      })
      if (result.user.account) setAssignedAccount(result.user.account)
      setToast({ msg: '注册成功！', type: 'success' })
      doRedirect()
    } catch (err: any) {
      setToast({ msg: err.message || '注册失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const sendCode = () => {
    const raw = regPhone.replace(/\s/g, '')
    if (!/^1\d{10}$/.test(raw)) { setRegErrors(prev => ({ ...prev, phone: '请输入正确手机号' })); return }
    setCodeCountdown(60)
    const id = setInterval(() => {
      setCodeCountdown(prev => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => { if (modeParam) setMode(modeParam); else setMode(initialMode) }, [initialMode, modeParam])

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    const params = new URLSearchParams(searchParams)
    params.set('mode', newMode)
    navigate({ search: params.toString() }, { replace: true })
  }

  const goBackRoleSelect = () => {
    let path = role === 'admin' ? '/login' : `/login`
    if (redirectTo) path += `?redirect=${encodeURIComponent(redirectTo)}`
    navigate(path)
  }

  const isOwner = role === 'owner'
  const isSitter = role === 'sitter'
  const isAdmin = role === 'admin'
  const showRegisterTab = !isAdmin
  const showSocialLogin = isOwner
  const showSwitchToRegister = !isAdmin
  const showSwitchToLogin = !isAdmin

  return (
    <div className="auth-page">
      <AuthBg />
      <button className="auth-mobile-back" onClick={goBackRoleSelect}>
        <ArrowLeft size={20} />
      </button>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon"><PawPrint size={22} weight="fill" /></div>
            <span className="auth-logo-text">PetCare</span>
          </div>

          <div className="auth-title-row">
            <button className="auth-role-back" onClick={goBackRoleSelect} title="切换身份">
              <ArrowLeft size={18} />
            </button>
            <h1 className="auth-title">{mode === 'login' ? '欢迎回来' : '创建账号'}</h1>
          </div>
          <p className="auth-subtitle">
            {mode === 'login' ? `登录您的${roleLabels[role]}账号` : `注册${roleLabels[role]}账号`}
          </p>

          <div className="auth-role-badge">
            <span>{roleLabels[role]}</span>
            <button className="auth-role-change" onClick={goBackRoleSelect}>切换身份</button>
          </div>

          {/* Mode Tabs — hidden for admin */}
          {showRegisterTab && (
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>登录</button>
              <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>注册</button>
            </div>
          )}

          {/* ── Login Form ── */}
          <form className={`auth-form ${mode === 'login' ? 'visible' : 'hidden'}`} onSubmit={handleLogin} noValidate>
            {/* Account / Phone field — differs by role */}
            {isOwner ? (
              <div className={`auth-field ${loginErrors.account ? 'error' : ''}`}>
                <div className="af-icon"><Phone size={18} /></div>
                <input type="tel" placeholder="请输入手机号" autoComplete="tel"
                  value={loginPhone} onChange={e => setLoginPhone(formatPhone(e.target.value))}
                  onFocus={() => setLoginErrors(prev => { const { account, ...r } = prev; return r })} />
                {loginErrors.account && <span className="af-error">{loginErrors.account}</span>}
              </div>
            ) : (
              <div className={`auth-field ${loginErrors.account ? 'error' : ''}`}>
                <div className="af-icon"><UserIcon size={18} /></div>
                <input type="text" placeholder="请输入账号" autoComplete="username"
                  value={loginAccount} onChange={e => setLoginAccount(e.target.value)}
                  onFocus={() => setLoginErrors(prev => { const { account, ...r } = prev; return r })} />
                {loginErrors.account && <span className="af-error">{loginErrors.account}</span>}
              </div>
            )}

            {/* Password field */}
            <div className={`auth-field ${loginErrors.password ? 'error' : ''}`}>
              <div className="af-icon"><Lock size={18} /></div>
              <input type={showPwd ? 'text' : 'password'} placeholder="请输入密码" autoComplete="current-password"
                value={loginPwd} onChange={e => setLoginPwd(e.target.value)}
                onFocus={() => setLoginErrors(prev => { const { password, ...r } = prev; return r })} />
              <button type="button" className="af-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {loginErrors.password && <span className="af-error">{loginErrors.password}</span>}
            </div>

            {/* Remember me + forgot password — show for owner, forgot only for sitter */}
            <div className="auth-row">
              {isOwner && (
                <label className="auth-checkbox">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span className="ac-custom" />
                  <span>记住我</span>
                </label>
              )}
              <button type="button" className="auth-link" onClick={() => alert('忘记密码功能')}>忘记密码？</button>
            </div>

            <button type="submit" className={`auth-submit ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <Loader2 size={20} className="spin" /> : '登  录'}
            </button>

            {/* Social login — owner only */}
            {showSocialLogin && (
              <div className="auth-social">
                <div className="as-divider"><span>或使用以下方式登录</span></div>
                <div className="as-btns">
                  <button type="button" className="as-btn wechat"><MessageCircle size={20} /> 微信</button>
                  <button type="button" className="as-btn alipay"><CreditCard size={20} /> 支付宝</button>
                  <button type="button" className="as-btn sms"><Smartphone size={20} /> 短信</button>
                </div>
              </div>
            )}

            {/* Switch to register — not for admin */}
            {showSwitchToRegister && (
              <p className="auth-switch">
                还没有账号？
                <button type="button" className="auth-link" onClick={() => switchMode('register')}>立即注册 →</button>
              </p>
            )}
          </form>

          {/* ── Register Form — hidden for admin ── */}
          {showRegisterTab && (
            <form className={`auth-form ${mode === 'register' ? 'visible' : 'hidden'}`} onSubmit={handleRegister} noValidate>
              <div className={`auth-field ${regErrors.phone ? 'error' : ''}`}>
                <div className="af-icon"><Phone size={18} /></div>
                <input type="tel" placeholder="请输入手机号" autoComplete="tel"
                  value={regPhone} onChange={e => setRegPhone(formatPhone(e.target.value))}
                  onFocus={() => setRegErrors(prev => { const { phone, ...r } = prev; return r })} />
                {regErrors.phone && <span className="af-error">{regErrors.phone}</span>}
              </div>
              <div className={`auth-field ${regErrors.code ? 'error' : ''}`}>
                <div className="af-icon"><Smartphone size={18} /></div>
                <input type="text" placeholder="请输入验证码" autoComplete="one-time-code" maxLength={6}
                  value={regCode} onChange={e => setRegCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setRegErrors(prev => { const { code, ...r } = prev; return r })} />
                <button type="button" className="af-code-btn" onClick={sendCode} disabled={codeCountdown > 0}>
                  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </button>
                {regErrors.code && <span className="af-error">{regErrors.code}</span>}
              </div>
              <div className={`auth-field ${regErrors.password ? 'error' : ''}`}>
                <div className="af-icon"><Lock size={18} /></div>
                <input type={showRegPwd ? 'text' : 'password'} placeholder="设置密码（至少8位）" autoComplete="new-password"
                  value={regPwd} onChange={e => setRegPwd(e.target.value)}
                  onFocus={() => setRegErrors(prev => { const { password, ...r } = prev; return r })} />
                <button type="button" className="af-toggle" onClick={() => setShowRegPwd(!showRegPwd)}>
                  {showRegPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {regErrors.password && <span className="af-error">{regErrors.password}</span>}
                <PasswordStrength password={regPwd} />
              </div>
              <div className={`auth-field ${regErrors.confirm ? 'error' : ''}`}>
                <div className="af-icon"><Lock size={18} /></div>
                <input type={showRegConfirm ? 'text' : 'password'} placeholder="确认密码" autoComplete="new-password"
                  value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                  onFocus={() => setRegErrors(prev => { const { confirm, ...r } = prev; return r })} />
                <button type="button" className="af-toggle" onClick={() => setShowRegConfirm(!showRegConfirm)}>
                  {showRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {regErrors.confirm && <span className="af-error">{regErrors.confirm}</span>}
              </div>
              <div className={`auth-checkbox-wrap ${regErrors.agree ? 'error' : ''}`}>
                <label className="auth-checkbox">
                  <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
                  <span className="ac-custom" />
                  <span>我已阅读并同意 <button type="button" className="auth-link" onClick={() => alert('服务条款')}>《服务条款》</button> 和 <button type="button" className="auth-link" onClick={() => alert('隐私政策')}>《隐私政策》</button></span>
                </label>
                {regErrors.agree && <span className="af-error">{regErrors.agree}</span>}
              </div>
              <button type="submit" className={`auth-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? <Loader2 size={20} className="spin" /> : '注  册'}
              </button>

              {/* Sitter: show assigned account hint after registration */}
              {isSitter && assignedAccount && (
                <div className="auth-account-hint">
                  <CheckCircle2 size={14} /> 注册成功，您的账号为：<strong>{assignedAccount}</strong>
                </div>
              )}

              {showSwitchToLogin && (
                <p className="auth-switch">
                  已有账号？
                  <button type="button" className="auth-link" onClick={() => switchMode('login')}>立即登录 →</button>
                </p>
              )}
            </form>
          )}
        </div>

        <div className="auth-trust">
          <ShieldCheck size={14} /> 已通过公安部信息安全等级保护三级认证
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #F8F9FB 0%, #FFF5F0 50%, #F0F8F6 100%);
          position: relative; padding: 24px 16px;
        }
        .auth-mobile-back {
          position: fixed; top: 16px; left: 16px; z-index: 10;
          width: 40px; height: 40px; border-radius: var(--radius-full);
          display: none; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.9); color: var(--color-text-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .auth-container { position: relative; z-index: 1; width: 100%; max-width: 420px; }
        .auth-card {
          background: rgba(255,255,255,0.97); backdrop-filter: blur(20px);
          border-radius: 20px; padding: 40px 32px 32px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.8);
        }
        .auth-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; }
        .auth-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #FF7D5A, #FF9F7A);
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .auth-logo-text { font-size: 20px; font-weight: 800; color: var(--color-text); letter-spacing: -0.3px; }
        .auth-title-row { display: flex; align-items: center; gap: 10px; justify-content: center; }
        .auth-title { text-align: center; font-size: 24px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
        .auth-subtitle { text-align: center; font-size: 14px; color: var(--color-text-muted); margin-bottom: 4px; }
        .auth-role-back {
          width: 36px; height: 36px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          background: var(--auth-card-bg, #fff);
          color: var(--color-text-secondary);
          cursor: pointer; transition: all 0.2s ease;
        }
        .auth-role-back:hover { background: #f5f5f5; }
        .auth-role-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .auth-role-badge span {
          padding: 3px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
          background: rgba(255,125,90,0.12); color: var(--color-primary);
        }
        .auth-role-change { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-decoration: underline; text-underline-offset: 2px; }
        .auth-role-change:hover { color: var(--color-primary); }
        .auth-tabs {
          display: flex; background: var(--color-bg);
          border-radius: var(--radius-sm); padding: 4px;
          margin-bottom: 28px; position: relative;
        }
        .auth-tab {
          flex: 1; padding: 10px; text-align: center;
          font-size: 14px; font-weight: 600; color: var(--color-text-muted);
          border-radius: 6px; transition: all 0.3s ease; position: relative; z-index: 1;
        }
        .auth-tab.active { background: #fff; color: var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .auth-tab:not(.active):hover { color: var(--color-text-secondary); }
        .auth-form { transition: all 0.35s ease; }
        .auth-form.hidden { display: none; }
        .auth-form.visible { display: block; animation: fadeIn 0.35s ease; }
        .auth-field {
          position: relative; margin-bottom: 18px;
          display: flex; align-items: center; flex-wrap: wrap;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-bg);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .auth-field:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.08); }
        .auth-field.error { border-color: var(--color-error); box-shadow: 0 0 0 3px rgba(255,107,107,0.08); animation: shakeX 0.4s ease; }
        .af-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; transition: color 0.25s; }
        .auth-field:focus-within .af-icon { color: var(--color-primary); }
        .auth-field.error .af-icon { color: var(--color-error); }
        .auth-field input { flex: 1; height: 44px; border: none; background: transparent; font-size: 14px; color: var(--color-text); outline: none; padding-right: 8px; font-family: var(--font); }
        .auth-field input::placeholder { color: var(--color-text-muted); }
        .af-toggle { width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; transition: color 0.25s; }
        .af-toggle:hover { color: var(--color-text-secondary); }
        .af-code-btn { height: 36px; padding: 0 14px; margin-right: 4px; border-radius: 6px; font-size: 13px; font-weight: 600; color: var(--color-primary); white-space: nowrap; transition: all 0.25s; flex-shrink: 0; }
        .af-code-btn:hover:not(:disabled) { background: var(--color-primary-light); }
        .af-code-btn:disabled { color: var(--color-text-muted); cursor: not-allowed; }
        .af-error { width: 100%; padding: 6px 44px 6px; font-size: 12px; color: var(--color-error); line-height: 1.3; }
        .auth-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .auth-checkbox { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--color-text-secondary); }
        .auth-checkbox input { display: none; }
        .ac-custom { width: 18px; height: 18px; border-radius: 4px; border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; transition: all 0.25s; flex-shrink: 0; }
        .auth-checkbox input:checked + .ac-custom { background: var(--color-primary); border-color: var(--color-primary); }
        .auth-checkbox input:checked + .ac-custom::after { content: ''; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -1px; }
        .auth-checkbox-wrap.error .ac-custom { border-color: var(--color-error); }
        .auth-checkbox-wrap.error { margin-bottom: 18px; }
        .auth-checkbox-wrap .af-error { padding: 4px 0 0 0; }
        .auth-link { font-size: 13px; font-weight: 600; color: var(--color-primary); transition: opacity 0.25s; }
        .auth-link:hover { opacity: 0.8; }
        .auth-checkbox .auth-link { font-size: 13px; display: inline; }
        .auth-submit {
          width: 100%; height: 48px; border-radius: var(--radius-sm);
          background: linear-gradient(135deg, #FF7D5A, #FF9F7A); color: #fff;
          font-size: 16px; font-weight: 700; letter-spacing: 2px;
          box-shadow: 0 4px 15px rgba(255,125,90,0.3);
          transition: all 0.3s ease; display: flex;
          align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .auth-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,125,90,0.4); }
        .auth-submit:active:not(:disabled) { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-submit.loading { pointer-events: none; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes shakeX { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        .auth-social { margin-bottom: 24px; }
        .as-divider { text-align: center; font-size: 12px; color: var(--color-text-muted); position: relative; margin-bottom: 16px; }
        .as-divider::before, .as-divider::after { content: ''; position: absolute; top: 50%; width: 28%; height: 1px; background: var(--color-border); }
        .as-divider::before { left: 0; }
        .as-divider::after { right: 0; }
        .as-divider span { background: var(--auth-card-bg, #fff); padding: 0 12px; }
        .as-btns { display: flex; gap: 10px; }
        .as-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 13px; font-weight: 500; color: var(--color-text-secondary); transition: all 0.25s ease; }
        .as-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
        .as-btn.wechat:hover { background: #07C160; color: #fff; border-color: #07C160; }
        .as-btn.alipay:hover { background: #1677FF; color: #fff; border-color: #1677FF; }
        .as-btn.sms:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .auth-switch { text-align: center; font-size: 14px; color: var(--color-text-secondary); }
        .auth-switch .auth-link { font-size: 14px; }
        .auth-account-hint {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border-radius: var(--radius-sm);
          background: #E8F8F4; color: #3A9E89; font-size: 13px;
          margin-bottom: 16px;
        }
        .auth-trust { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; font-size: 12px; color: var(--color-text-muted); }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(8deg); } }
        @media (max-width: 480px) {
          .auth-card { padding: 28px 20px 24px; border-radius: 16px; }
          .auth-title { font-size: 22px; }
          .as-btns { flex-wrap: wrap; }
          .as-btn { min-width: calc(33.33% - 7px); }
          .auth-mobile-back { display: flex; }
        }
        @media (max-width: 360px) {
          .auth-card { padding: 24px 16px 20px; }
          .as-btn { font-size: 12px; padding: 8px 6px; gap: 4px; }
        }
      `}</style>
    </div>
  )
}
