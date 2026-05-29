import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PawPrint, Bell, Menu, X, User as UserIcon, LogOut } from 'lucide-react'
import { isLoggedIn, logout } from '../utils/auth'

export default function Header() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  const cached = (() => { try { return JSON.parse(localStorage.getItem('petcare_user') || 'null') } catch { return null } })()
  const displayName = cached?.name || cached?.username || ''
  const userRole = cached?.role || ''

  const handleLogout = () => { logout(); setLoggedIn(false); navigate('/') }

  useEffect(() => {
    setLoggedIn(isLoggedIn())
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner container">
        <a href="/" className="header-logo">
          <div className="logo-icon">
            <PawPrint size={22} weight="fill" />
          </div>
          <span className="logo-text">PetCare</span>
        </a>

        <nav className={`header-nav ${mobileOpen ? 'nav-open' : ''}`}>
          <a href="#services" className="nav-link" onClick={() => setMobileOpen(false)}>服务</a>
          <a href="#sitters" className="nav-link" onClick={() => setMobileOpen(false)}>服务者</a>
          <a href="#guarantees" className="nav-link" onClick={() => setMobileOpen(false)}>保障</a>
          <a href="#reviews" className="nav-link" onClick={() => setMobileOpen(false)}>评价</a>
          <div className="nav-auth">
            {loggedIn ? (
              <>
                <span className="nav-user-info">
                  <UserIcon size={16} />
                  <span>{displayName}</span>
                  {userRole && <span className="nav-user-role">{userRole === 'admin' ? '管理员' : userRole === 'sitter' ? '服务者' : '主人'}</span>}
                </span>
                <button className="nav-link nav-logout" onClick={handleLogout}><LogOut size={14} /> 退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link nav-login">登录</Link>
                <Link to="/register" className="btn btn-primary nav-register">免费注册</Link>
              </>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <button className="icon-btn" aria-label="通知">
            <Bell size={20} />
            <span className="notif-dot" />
          </button>
          <button className="icon-btn menu-btn" aria-label="菜单" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--header-height);
          transition: all 0.35s ease;
          background: transparent;
        }

        .header-scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border);
          box-shadow: 0 1px 8px rgba(0,0,0,0.04);
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1001;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--color-primary-gradient);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: transform 0.3s ease;
        }

        .header-logo:hover .logo-icon {
          transform: rotate(-10deg) scale(1.05);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-text);
          letter-spacing: -0.5px;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-radius: var(--radius-sm);
          transition: all 0.25s ease;
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%;
          height: 2px;
          background: var(--color-primary);
          border-radius: 1px;
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          color: var(--color-text);
          background: rgba(0,0,0,0.03);
        }

        .nav-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 16px;
          padding-left: 16px;
          border-left: 1px solid var(--color-border);
        }

        .nav-user-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
        }

        .nav-user-role {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-primary);
          background: var(--color-primary-light);
          padding: 1px 8px;
          border-radius: 100px;
        }

        .nav-logout {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .nav-logout:hover { color: var(--color-error) !important; }

        .nav-login {
          color: var(--color-text);
          font-weight: 600;
        }

        .nav-register {
          padding: 8px 20px;
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1001;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          transition: all 0.25s ease;
          position: relative;
        }

        .icon-btn:hover {
          background: rgba(0,0,0,0.05);
          color: var(--color-text);
        }

        .notif-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 7px;
          height: 7px;
          background: var(--color-error);
          border-radius: 50%;
          border: 2px solid transparent;
        }

        .header-scrolled .notif-dot {
          border-color: rgba(255,255,255,0.92);
        }

        .menu-btn {
          display: none;
        }

        .mobile-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .menu-btn {
            display: flex;
          }

          .header-nav {
            position: fixed;
            top: 0;
            right: -100%;
            width: 280px;
            height: 100vh;
            background: #fff;
            flex-direction: column;
            align-items: flex-start;
            padding: calc(var(--header-height) + 16px) 24px 24px;
            gap: 4px;
            box-shadow: -8px 0 30px rgba(0,0,0,0.1);
            transition: right 0.35s ease;
            z-index: 1000;
          }

          .header-nav.nav-open {
            right: 0;
          }

          .header-nav .nav-link {
            width: 100%;
            padding: 12px 16px;
            font-size: 15px;
          }

          .header-nav .nav-link::after {
            display: none;
          }

          .nav-auth {
            flex-direction: column;
            width: 100%;
            margin-left: 0;
            padding-left: 0;
            border-left: none;
            border-top: 1px solid var(--color-border);
            margin-top: 12px;
            padding-top: 16px;
            gap: 8px;
          }

          .nav-auth .nav-link,
          .nav-auth .btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }

          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.3);
            z-index: 999;
            animation: fadeIn 0.25s ease;
          }
        }
      `}</style>
    </header>
  )
}
