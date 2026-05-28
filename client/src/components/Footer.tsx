import { PawPrint, Mail, Phone, MapPin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,100 1080,0 1440,40 L1440,80 L0,80 Z" fill="#1A1A2E" />
        </svg>
      </div>
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="fl-icon">
                  <PawPrint size={20} weight="fill" />
                </div>
                <span>PetCare</span>
              </div>
              <p className="footer-about">
                专业的宠物上门服务平台。我们严格筛选每一位服务者，用心守护您和毛孩的每一次托付。
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="微信">💬</a>
                <a href="#" className="social-link" aria-label="微博">📱</a>
                <a href="#" className="social-link" aria-label="抖音">🎵</a>
                <a href="#" className="social-link" aria-label="小红书">📕</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>服务</h4>
              <a href="#">遛狗服务</a>
              <a href="#">上门喂猫</a>
              <a href="#">宠物清洁</a>
              <a href="#">医疗陪护</a>
              <a href="#">上门喂食</a>
            </div>

            <div className="footer-col">
              <h4>关于</h4>
              <a href="#">关于我们</a>
              <a href="/sitter/apply">服务者入驻</a>
              <a href="#">帮助中心</a>
              <a href="#">服务条款</a>
              <a href="#">隐私政策</a>
            </div>

            <div className="footer-col">
              <h4>联系我们</h4>
              <div className="footer-contact">
                <span><Mail size={14} /> hello@petcare.com</span>
                <span><Phone size={14} /> 400-888-8888</span>
                <span><MapPin size={14} /> 北京市朝阳区望京SOHO</span>
              </div>
              <div className="footer-worktime">
                客服时间：周一至周日 9:00-21:00
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <span>&copy; 2026 PetCare. All rights reserved.</span>
            <span className="footer-made">
              Made with <Heart size={12} className="heart-icon" /> for pets
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          position: relative;
          background: #1A1A2E;
          color: rgba(255,255,255,0.7);
        }

        .footer-wave {
          position: relative;
          line-height: 0;
          margin-bottom: -1px;
        }

        .footer-wave svg {
          width: 100%;
          height: 60px;
          display: block;
        }

        .footer-main {
          padding: 60px 0 40px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 48px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .fl-icon {
          width: 32px;
          height: 32px;
          background: var(--color-primary-gradient);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .footer-logo span {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .footer-about {
          font-size: 13px;
          line-height: 1.8;
          color: rgba(255,255,255,0.5);
          margin-bottom: 20px;
          max-width: 320px;
        }

        .footer-social {
          display: flex;
          gap: 8px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: var(--color-primary);
          transform: translateY(-2px);
        }

        .footer-col h4 {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .footer-col a {
          display: block;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          padding: 6px 0;
          transition: all 0.25s ease;
        }

        .footer-col a:hover {
          color: var(--color-primary);
          padding-left: 4px;
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        .footer-contact span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-worktime {
          margin-top: 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: var(--radius-sm);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 20px 0;
        }

        .footer-bottom-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }

        .footer-made {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .heart-icon {
          color: var(--color-primary);
          animation: pulse 1.5s ease infinite;
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .footer-wave svg { height: 30px; }

          .footer-bottom-inner {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  )
}
