import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, MapPin, MessageCircle, Heart, CheckCircle, ChevronRight } from 'lucide-react'

const guaranteeData: Record<string, {
  label: string; icon: any; color: string; gradient: string;
  sections: { title: string; content: string }[]; highlights: string[]
}> = {
  'real-name': {
    label: '实名认证', icon: ShieldCheck, color: '#FF7D5A', gradient: 'linear-gradient(135deg, #FFF0EB, #FFE0D6)',
    sections: [
      { title: '严格的身份审核流程', content: '所有服务者在入驻平台前，都必须提交真实身份信息进行实名认证。平台与公安部身份信息库对接，确保人与证一致。' },
      { title: '多重认证体系', content: '除实名认证外，我们还提供宠物护理证、无犯罪记录证明、营养师证等专业资质认证，帮助用户更全面地了解服务者。' },
      { title: '信息公示透明', content: '服务者的实名认证状态、专业资质证书均可在个人主页查看，让您在选择服务时更加放心。' },
    ],
    highlights: ['公安部身份信息库对接', '人证一致核验', '专业资质自愿认证', '认证信息公开可查'],
  },
  'insurance': {
    label: '宠物保险', icon: Heart, color: '#45B7A0', gradient: 'linear-gradient(135deg, #E8F8F4, #D4F5EC)',
    sections: [
      { title: '每单都有保障', content: '每笔订单自动附赠宠物意外保险，覆盖服务过程中的宠物意外受伤、走失等风险，最高赔付5000元。' },
      { title: '理赔流程简单', content: '如发生意外，只需在订单详情页提交理赔申请，上传相关凭证，我们将在3个工作日内完成审核并赔付。' },
      { title: '保险范围全面', content: '保险覆盖遛狗、上门喂猫、宠物清洁等所有平台服务类型，保障范围包括意外伤害、走失找寻、第三方责任等。' },
    ],
    highlights: ['每单自动投保', '最高赔付5000元', '3个工作日内赔付', '覆盖全部服务类型'],
  },
  'tracking': {
    label: '实时定位', icon: MapPin, color: '#4A90D9', gradient: 'linear-gradient(135deg, #EFF6FF, #E0EEFF)',
    sections: [
      { title: '服务过程实时追踪', content: '服务开始时，您可以在订单详情页实时查看服务者的位置，了解服务进度，让您随时掌握情况。' },
      { title: '电子围栏提醒', content: '可在服务区域设置电子围栏，当服务者进入或离开指定区域时，您将收到实时推送通知。' },
      { title: '轨迹回放', content: '服务结束后，您可查看服务者的完整服务轨迹回放，包括行走路线、停留点等详细信息。' },
    ],
    highlights: ['实时位置查看', '电子围栏提醒', '完整轨迹回放', '推送通知'],
  },
  'chat': {
    label: '在线沟通', icon: MessageCircle, color: '#9B59B6', gradient: 'linear-gradient(135deg, #F0EBFF, #E4DBFF)',
    sections: [
      { title: '即时消息沟通', content: '与服务者实时聊天，发送文字、图片、语音，沟通无障碍。所有消息加密传输，保障隐私安全。' },
      { title: '快捷短语与模板', content: '提供常见问题的快捷回复模板，如钥匙存放位置、宠物特殊习惯等，让沟通更加高效。' },
      { title: '消息已读回执', content: '支持消息已读/未读状态显示，了解服务者是否已查看您的消息，避免信息遗漏。' },
    ],
    highlights: ['文字/图片/语音', '消息加密传输', '快捷回复模板', '已读回执'],
  },
}

export default function GuaranteePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const data = guaranteeData[id || '']

  if (!data) {
    return (
      <div className="gp-page">
        <div className="gp-not-found">
          <h2>页面不存在</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>返回首页</button>
        </div>
      </div>
    )
  }

  const Icon = data.icon

  return (
    <div className="gp-page">
      <div className="gp-topbar">
        <div className="container gp-topbar-inner">
          <button className="gp-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /><span>返回</span></button>
          <span className="gp-topbar-title">服务保障</span>
          <div className="gp-topbar-spacer" />
        </div>
      </div>

      <div className="gp-hero" style={{ background: data.gradient }}>
        <div className="container gp-hero-inner">
          <div className="gp-hero-icon" style={{ color: data.color, background: `${data.color}20` }}><Icon size={40} /></div>
          <h1>{data.label}</h1>
          <p>PetCare 为您的每次托付保驾护航</p>
        </div>
      </div>

      <div className="gp-content container">
        <div className="gp-highlights">
          {data.highlights.map(h => (
            <div key={h} className="gp-hl-item"><CheckCircle size={16} color={data.color} /><span>{h}</span></div>
          ))}
        </div>

        {data.sections.map((s, i) => (
          <div key={i} className="gp-section">
            <h3>{s.title}</h3>
            <p>{s.content}</p>
          </div>
        ))}

        <div className="gp-cta">
          <p>为您的宠物选择最安心的服务</p>
          <button className="btn btn-primary" style={{ padding: '12px 36px', justifyContent: 'center' }} onClick={() => navigate('/')}>立即体验</button>
        </div>
      </div>

      <style>{`
        .gp-page { min-height: 100vh; background: var(--color-bg); }
        .gp-not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
        .gp-not-found h2 { font-size: 20px; color: var(--color-text); }

        .gp-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 56px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border); }
        .gp-topbar-inner { display: flex; align-items: center; height: 100%; gap: 12px; }
        .gp-back { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; color: var(--color-text-secondary); padding: 6px 12px; border-radius: var(--radius-sm); transition: all 0.25s; }
        .gp-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .gp-topbar-title { font-size: 15px; font-weight: 600; color: var(--color-text); }
        .gp-topbar-spacer { flex: 1; }

        .gp-hero { padding: 80px 0 48px; text-align: center; }
        .gp-hero-inner { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .gp-hero-icon { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
        .gp-hero h1 { font-size: 28px; font-weight: 800; color: var(--color-text); margin: 0; }
        .gp-hero p { font-size: 15px; color: var(--color-text-secondary); margin: 0; }

        .gp-content { max-width: 720px; margin: 0 auto; padding: 32px 16px 80px; }
        .gp-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 36px; }
        .gp-hl-item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--color-bg-alt); border-radius: var(--radius-md); border: 1px solid var(--color-border); font-size: 14px; font-weight: 500; color: var(--color-text); }

        .gp-section { margin-bottom: 28px; }
        .gp-section h3 { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 10px; }
        .gp-section p { font-size: 14px; color: var(--color-text-secondary); line-height: 1.8; margin: 0; }

        .gp-cta { text-align: center; padding: 36px; background: var(--color-bg-alt); border-radius: var(--radius-lg); border: 1px solid var(--color-border); margin-top: 8px; }
        .gp-cta p { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 16px; }

        @media (max-width: 600px) {
          .gp-hero { padding: 64px 0 32px; }
          .gp-hero h1 { font-size: 24px; }
          .gp-highlights { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
