import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Check, X, Upload, Plus, Trash2, MapPin, Clock,
  ChevronRight, ChevronLeft, AlertCircle, Info, Home, Star,
  Camera, FileText, HelpCircle, ShieldCheck
} from 'lucide-react'
import { api } from '../../utils/api'

/* ── Types ── */

type StepKey = 'basic' | 'certs' | 'service' | 'review'

interface FormData {
  name: string; phone: string; city: string; wechat: string; bio: string
  certs: { key: string; label: string; required: boolean; uploaded: boolean; fileName: string }[]
  areas: string[]; maxDistance: number; workdayStart: string; workdayEnd: string
  weekendStart: string; weekendEnd: string
}

const STORAGE_KEY = 'petcare_sitter_apply'

const cityList = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆', '天津', '苏州']

const areaList = ['望京', '三元桥', '亮马桥', '国贸', '中关村', '亚运村', '西二旗', '五道口', '双井', '大望路']

const defaultForm: FormData = {
  name: '', phone: '', city: '', wechat: '', bio: '',
  certs: [
    { key: 'id_card', label: '身份证正反面', required: true, uploaded: false, fileName: '' },
    { key: 'pet_care', label: '宠物护理培训证书', required: true, uploaded: false, fileName: '' },
    { key: 'police', label: '无犯罪记录证明', required: false, uploaded: false, fileName: '' },
    { key: 'first_aid', label: '动物急救证', required: false, uploaded: false, fileName: '' },
  ],
  areas: [], maxDistance: 5,
  workdayStart: '09:00', workdayEnd: '20:00',
  weekendStart: '10:00', weekendEnd: '18:00',
}

const steps: { key: StepKey; icon: string; label: string }[] = [
  { key: 'basic', icon: '📋', label: '基本信息' },
  { key: 'certs', icon: '📷', label: '资质上传' },
  { key: 'service', icon: '🗺️', label: '服务设置' },
  { key: 'review', icon: '✅', label: '确认提交' },
]

/* ── Submission status page ── */

function StatusPage({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const navigate = useNavigate()

  if (status === 'pending') {
    return (
      <div className="sa-status">
        <div className="sa-status-icon pending"><span>🎉</span></div>
        <h2>申请已成功提交！</h2>
        <div className="sa-status-timer">
          <div className="sa-timer-hdr">⏳ 预计 72 小时内完成审核</div>
          <div className="sa-timer-bar"><div className="sa-timer-fill" style={{ width: '45%' }} /></div>
          <span className="sa-timer-text">已等待 36 小时</span>
        </div>
        <div className="sa-status-steps">
          <div className="sa-ss-item done"><span className="sa-ss-dot">●</span>已提交 <span className="sa-ss-check">✅</span></div>
          <div className="sa-ss-item active"><span className="sa-ss-dot pulse">●</span>资质核验 <span className="sa-ss-tag">进行中</span></div>
          <div className="sa-ss-item"><span className="sa-ss-dot">○</span>平台审核</div>
          <div className="sa-ss-item"><span className="sa-ss-dot">○</span>审核完成</div>
        </div>
        <div className="sa-status-suggest">
          <p>在此期间您可以：</p>
          <div className="sa-suggest-grid">
            <button onClick={() => navigate('/')}><FileText size={16} /> 了解平台规则</button>
            <button onClick={() => navigate('/sitters')}><Star size={16} /> 看看其他服务者</button>
            <button onClick={() => navigate('/sitter/profile')}><ShieldCheck size={16} /> 完善个人资料</button>
            <button onClick={() => alert('联系客服')}><HelpCircle size={16} /> 联系客服</button>
          </div>
        </div>
        <div className="sa-status-actions">
          <button className="sa-btn outline" onClick={() => navigate('/')}>🏠 返回首页</button>
        </div>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className="sa-status">
        <div className="sa-status-icon approved"><span>🎊</span></div>
        <h2>恭喜！审核通过！</h2>
        <div className="sa-profile-card">
          <div className="sa-pc-avatar">👩</div>
          <div className="sa-pc-info">
            <span className="sa-pc-name">张阿姨</span>
            <span className="sa-pc-badge">🏅 金牌服务者</span>
            <span className="sa-pc-stats">⭐ 4.9 · 287单</span>
          </div>
        </div>
        <p className="sa-status-desc">您的服务者账号已激活，现在可以开始接单啦！</p>
        <div className="sa-status-suggest">
          <div className="sa-suggest-grid">
            <button onClick={() => navigate('/sitter/services')}><Plus size={16} /> 完善服务项目</button>
            <button onClick={() => navigate('/sitter/wallet')}><MapPin size={16} /> 设置价格</button>
            <button onClick={() => navigate('/sitter/schedule')}><Clock size={16} /> 查看今日排期</button>
          </div>
        </div>
        <button className="sa-btn primary large" onClick={() => navigate('/sitter/dashboard')} style={{ fontSize: 16, padding: '14px 32px', marginTop: 8 }}>
          🚀 进入服务者工作台
        </button>
        <div className="sa-checklist">
          <div className="sa-cl-item"><span className="sa-cl-check">☑</span> 设置服务项目和价格</div>
          <div className="sa-cl-item"><span className="sa-cl-check">☑</span> 完善个人资料和头像</div>
          <div className="sa-cl-item"><span className="sa-cl-check">☑</span> 开启接单通知</div>
        </div>
      </div>
    )
  }

  return (
    <div className="sa-status">
      <div className="sa-status-icon rejected"><span>😅</span></div>
      <h2>很抱歉，审核未通过</h2>
      <div className="sa-reject-card">
        <div className="sa-reject-item">
          <X size={16} color="#FF6B6B" />
          <div>
            <strong>宠物护理培训证书图片不清晰</strong>
            <p>请重新上传清晰的扫描件或拍照</p>
          </div>
        </div>
        <div className="sa-reject-item">
          <X size={16} color="#FF6B6B" />
          <div>
            <strong>个人介绍不足 10 字</strong>
            <p>请详细介绍您的宠物护理经验和特长</p>
          </div>
        </div>
      </div>
      <div className="sa-contact-card">
        <Info size={14} /> 如有疑问请联系客服：💬 在线客服 · 📞 400-888-8888
      </div>
      <div className="sa-status-actions">
        <button className="sa-btn outline" onClick={() => navigate('/')}>🏠 返回首页</button>
        <button className="sa-btn primary" onClick={() => navigate('/sitter/apply')}>🔄 重新提交审核</button>
      </div>
    </div>
  )
}

/* ── Main Component ── */

export default function SitterApplication() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [form, setForm] = useState<FormData>(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : defaultForm }
    catch { return defaultForm }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    api.get('/sitter/application').then((data: any) => {
      if (data?.status) setSubmitted(data.status)
    }).catch(() => {})
  }, [])

  const update = useCallback((patch: Partial<FormData>) => {
    setForm(p => ({ ...p, ...patch }))
    setErrors({})
  }, [])

  const formatPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d{0,4})(\d{0,4})/, (_, a, b, c) => b ? `${a} ${b}${c ? ` ${c}` : ''}` : a)

  /* ── Validation ── */

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 0) {
      if (!form.name.trim()) errs.name = '请输入真实姓名'
      else if (form.name.length < 2) errs.name = '姓名至少 2 个字符'
      const rawPhone = form.phone.replace(/\s/g, '')
      if (!rawPhone) errs.phone = '请输入手机号'
      else if (!/^1\d{10}$/.test(rawPhone)) errs.phone = '手机号格式不正确'
      if (!form.city) errs.city = '请选择所在城市'
      if (!form.bio.trim()) errs.bio = '请输入个人介绍'
      else if (form.bio.length < 10) errs.bio = '介绍至少 10 个字'
      else if (form.bio.length > 200) errs.bio = '介绍不超过 200 字'
    }
    if (s === 1) {
      form.certs.forEach(c => { if (c.required && !c.uploaded) errs[c.key] = `${c.label}为必填项` })
    }
    if (s === 2) {
      if (form.areas.length === 0) errs.areas = '请至少选择一个服务区域'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < 3) { setDirection('forward'); setStep(s => s + 1) }
  }

  const handleBack = () => {
    if (step > 0) { setDirection('back'); setStep(s => s - 1) }
    else navigate(-1)
  }

  const handleSubmit = () => {
    if (!agreed) return
    setSubmitting(true)
    api.post('/sitter/apply', form).then(() => {
      setSubmitting(false)
      localStorage.removeItem(STORAGE_KEY)
      setSubmitted('pending')
    }).catch(() => {
      setSubmitting(false)
    })
  }

  const toggleArea = (area: string) => {
    update({ areas: form.areas.includes(area) ? form.areas.filter(a => a !== area) : [...form.areas, area] })
  }

  const uploadCert = (key: string) => {
    setForm(p => ({ ...p, certs: p.certs.map(c => c.key === key ? { ...c, uploaded: true, fileName: `${c.label}.jpg` } : c) }))
  }

  const removeCert = (key: string) => {
    setForm(p => ({ ...p, certs: p.certs.map(c => c.key === key ? { ...c, uploaded: false, fileName: '' } : c) }))
  }

  const copyToWeekend = () => {
    update({ weekendStart: form.workdayStart, weekendEnd: form.workdayEnd })
  }

  if (submitted) return <StatusPage status={submitted} />

  const stepKey = steps[step].key

  return (
    <div className={`sa-page step-${stepKey}`}>
      <header className="sa-topbar">
        <div className="sa-topbar-inner">
          <button className="sa-top-back" onClick={handleBack}><ArrowLeft size={20} /></button>
          <h1>成为服务者</h1>
          <div className="sa-top-actions">
            <button className="sa-top-link" onClick={() => navigate('/')}>🏠 首页</button>
            <button className="sa-top-link" onClick={() => alert('帮助中心')}>❓ 帮助</button>
          </div>
        </div>
      </header>

      <div className={`sa-steps ${direction === 'back' ? 'back' : ''}`}>
        {steps.map((s, i) => {
          const isComplete = i < step; const isCurrent = i === step
          return (
            <div key={s.key} className={`sa-step ${isComplete ? 'done' : ''} ${isCurrent ? 'current' : ''} ${i > step ? 'pending' : ''}`}
              onClick={() => { if (i < step) { setDirection('back'); setStep(i) } }}>
              <div className="sa-step-icon">{isComplete ? <Check size={16} /> : <span>{s.icon}</span>}</div>
              <span className="sa-step-label">{s.label}</span>
              <span className="sa-step-num">STEP {i + 1}</span>
              {i < steps.length - 1 && <div className={`sa-step-line ${isComplete ? 'done' : ''}`} />}
            </div>
          )
        })}
      </div>

      <div className="sa-draft-saved">📄 草稿已自动保存</div>

      <main className="sa-content">
        {step === 0 && (
          <div className="sa-slide-in">
            <div className="sa-section-hdr"><span>📋</span> 基本信息 <span className="sa-section-time">⏱ 预计 2 分钟</span></div>
            <div className="sa-card">
              <div className="sa-field">
                <label>真实姓名 <span className="sa-req">*</span></label>
                <div className={`sa-input-wrap ${errors.name ? 'error' : ''}`}>
                  <span className="sa-input-icon">👤</span>
                  <input value={form.name} onChange={e => update({ name: e.target.value })} placeholder="请输入真实姓名" maxLength={20} />
                  {form.name && <span className="sa-input-valid"><Check size={14} /></span>}
                </div>
                {errors.name && <span className="sa-field-error">{errors.name}</span>}
              </div>
              <div className="sa-field">
                <label>手机号 <span className="sa-req">*</span></label>
                <div className={`sa-input-wrap ${errors.phone ? 'error' : ''}`}>
                  <span className="sa-input-icon">📱</span>
                  <input value={form.phone} onChange={e => update({ phone: formatPhone(e.target.value) })} placeholder="138 8888 8888" maxLength={13} />
                  {form.phone.replace(/\s/g, '').length === 11 && <span className="sa-input-valid"><Check size={14} /></span>}
                </div>
                {errors.phone && <span className="sa-field-error">{errors.phone}</span>}
              </div>
              <div className="sa-field-row">
                <div className="sa-field">
                  <label>所在城市 <span className="sa-req">*</span></label>
                  <div className={`sa-input-wrap sa-select-wrap ${errors.city ? 'error' : ''}`} onClick={() => setCityOpen(!cityOpen)}>
                    <span className="sa-input-icon">🏙️</span>
                    <span className={`sa-select-value ${!form.city ? 'placeholder' : ''}`}>{form.city || '请选择城市'}</span>
                    <ChevronRight size={14} className="sa-select-arrow" />
                  </div>
                  {errors.city && <span className="sa-field-error">{errors.city}</span>}
                  {cityOpen && (
                    <div className="sa-city-dropdown">
                      {cityList.map(c => <div key={c} className={`sa-city-item ${form.city === c ? 'active' : ''}`} onClick={() => { update({ city: c }); setCityOpen(false) }}>{c}</div>)}
                    </div>
                  )}
                </div>
                <div className="sa-field">
                  <label>微信号（选填）</label>
                  <div className="sa-input-wrap">
                    <span className="sa-input-icon">💬</span>
                    <input value={form.wechat} onChange={e => update({ wechat: e.target.value })} placeholder="选填" />
                  </div>
                </div>
              </div>
              <div className="sa-field">
                <label>个人介绍 <span className="sa-req">*</span></label>
                <div className={`sa-input-wrap ${errors.bio ? 'error' : ''}`}>
                  <textarea value={form.bio} onChange={e => update({ bio: e.target.value })} placeholder="介绍下你自己，你的宠物经验、性格特点..." rows={4} maxLength={200} />
                </div>
                <div className="sa-field-footer"><span className={`sa-bio-count ${form.bio.length < 10 ? 'warn' : ''}`}>{form.bio.length} / 200 字</span>{errors.bio && <span className="sa-field-error">{errors.bio}</span>}</div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="sa-slide-in">
            <div className="sa-section-hdr"><span>📷</span> 资质认证 <span className="sa-section-time">⏱ 预计 3 分钟</span></div>
            <div className="sa-tip">请上传清晰的照片或扫描件，支持 JPG/PNG/PDF，单文件不超过 10MB</div>
            <div className="sa-cert-grid">
              {form.certs.map(cert => (
                <div key={cert.key} className={`sa-cert-card ${cert.uploaded ? 'done' : ''} ${errors[cert.key] ? 'has-error' : ''}`}>
                  {cert.uploaded ? (
                    <>
                      <div className="sa-cert-preview">
                        <span className="sa-cert-file-icon">📄</span>
                        <span className="sa-cert-file-name">{cert.fileName}</span>
                      </div>
                      <span className="sa-cert-uploaded-date">已上传</span>
                      <button className="sa-cert-delete" onClick={() => removeCert(cert.key)}><Trash2 size={14} /></button>
                    </>
                  ) : (
                    <div className="sa-cert-empty" onClick={() => uploadCert(cert.key)}>
                      <span className="sa-cert-plus">＋</span>
                      <span className="sa-cert-upload-label">点击上传</span>
                    </div>
                  )}
                  <div className="sa-cert-footer">
                    <span className="sa-cert-label">{cert.label}</span>
                    {cert.required && <span className="sa-cert-req">必填</span>}
                    {!cert.required && <span className="sa-cert-req opt">选填</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="sa-notice"><Info size={14} /> 所有资质信息仅用于平台审核，不会公开展示。审核通过后部分资质将展示在您的个人主页。</div>
          </div>
        )}

        {step === 2 && (
          <div className="sa-slide-in">
            <div className="sa-section-hdr"><span>🗺️</span> 服务设置 <span className="sa-section-time">⏱ 预计 2 分钟</span></div>

            <div className="sa-card">
              <label className="sa-card-label">服务区域（可多选）<span className="sa-req">*</span></label>
              <div className="sa-area-grid">
                {areaList.map(a => (
                  <div key={a} className={`sa-area-tag ${form.areas.includes(a) ? 'active' : ''}`} onClick={() => toggleArea(a)}>
                    {form.areas.includes(a) && <span className="sa-area-check">✅</span>}
                    {a}
                  </div>
                ))}
              </div>
              {errors.areas && <span className="sa-field-error">{errors.areas}</span>}
            </div>

            <div className="sa-card">
              <label className="sa-card-label">最大服务距离</label>
              <div className="sa-slider-wrap">
                <span className="sa-slider-min">1km</span>
                <input type="range" min={1} max={10} step={1} value={form.maxDistance} onChange={e => update({ maxDistance: Number(e.target.value) })} className="sa-slider" />
                <span className="sa-slider-max">10km</span>
                <span className="sa-slider-value">{form.maxDistance}km</span>
              </div>
              <div className="sa-tip" style={{ margin: '8px 0 0' }}>当前设置可覆盖大部分城区</div>
            </div>

            <div className="sa-card">
              <label className="sa-card-label">可接单时段</label>
              <div className="sa-time-row">
                <span className="sa-time-day">周一 ~ 周五</span>
                <div className="sa-time-pickers">
                  <select value={form.workdayStart} onChange={e => update({ workdayStart: e.target.value })}>
                    {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(t => <option key={t}>{t}</option>)}
                  </select>
                  <span className="sa-time-sep">—</span>
                  <select value={form.workdayEnd} onChange={e => update({ workdayEnd: e.target.value })}>
                    {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button className="sa-copy-btn" onClick={copyToWeekend} title="复制到周末">📋</button>
              </div>
              <div className="sa-time-row">
                <span className="sa-time-day">周六 ~ 周日</span>
                <div className="sa-time-pickers">
                  <select value={form.weekendStart} onChange={e => update({ weekendStart: e.target.value })}>
                    {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(t => <option key={t}>{t}</option>)}
                  </select>
                  <span className="sa-time-sep">—</span>
                  <select value={form.weekendEnd} onChange={e => update({ weekendEnd: e.target.value })}>
                    {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="sa-slide-in">
            <div className="sa-section-hdr"><span>✅</span> 确认提交</div>

            <div className="sa-review-card">
              <div className="sa-rv-hdr"><span>📋 基本信息</span><button className="sa-rv-edit" onClick={() => { setDirection('back'); setStep(0) }}>✏️ 编辑</button></div>
              <div className="sa-rv-body">
                <div className="sa-rv-row"><span>👤 {form.name}</span><span>📱 {form.phone}</span></div>
                <div className="sa-rv-row"><span>🏙️ {form.city}</span><span>💬 {form.wechat || '未填写'}</span></div>
                <p className="sa-rv-bio">📝 {form.bio}</p>
              </div>
            </div>

            <div className="sa-review-card">
              <div className="sa-rv-hdr"><span>📷 资质认证</span><button className="sa-rv-edit" onClick={() => { setDirection('back'); setStep(1) }}>✏️ 编辑</button></div>
              <div className="sa-rv-body">
                {form.certs.map(c => (
                  <div key={c.key} className="sa-rv-cert"><span>{c.uploaded ? '✅' : '⬜'} {c.label}</span>{c.uploaded ? <span className="sa-rv-ok">✓</span> : <span className="sa-rv-missing">未上传</span>}</div>
                ))}
              </div>
            </div>

            <div className="sa-review-card">
              <div className="sa-rv-hdr"><span>🗺️ 服务设置</span><button className="sa-rv-edit" onClick={() => { setDirection('back'); setStep(2) }}>✏️ 编辑</button></div>
              <div className="sa-rv-body">
                <div className="sa-rv-row"><span>🗺️ {form.areas.join(' · ') || '未设置'}</span></div>
                <div className="sa-rv-row"><span>📏 最大距离 {form.maxDistance}km</span></div>
                <div className="sa-rv-row"><span>🕐 工作日 {form.workdayStart}-{form.workdayEnd}</span></div>
                <div className="sa-rv-row"><span>🕐 周末 {form.weekendStart}-{form.weekendEnd}</span></div>
              </div>
            </div>

            <div className="sa-agree-wrap">
              <label className="sa-agree">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>我已阅读并同意《PetCare 服务者入驻协议》</span>
              </label>
              <label className="sa-agree">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>我已阅读并同意《个人信息处理授权书》</span>
              </label>
            </div>
          </div>
        )}
      </main>

      <div className="sa-bottom-bar">
        <button className="sa-btn outline" onClick={handleBack}>
          <ChevronLeft size={16} /> 上一步
        </button>
        {step < 3 ? (
          <button className={`sa-btn primary ${step === 0 && !form.name ? 'disabled' : ''}`} onClick={handleNext}>
            下一步 <ChevronRight size={16} />
          </button>
        ) : (
          <button className={`sa-btn primary large ${!agreed || submitting ? 'disabled' : ''}`} disabled={!agreed || submitting} onClick={handleSubmit}>
            {submitting ? <span className="sa-spinner" /> : '📤'} {submitting ? '提交中...' : '提交审核'}
          </button>
        )}
      </div>

      <style>{`
        .sa-page { min-height: 100vh; background: var(--color-bg); padding-top: 60px; padding-bottom: 80px; }
        .sa-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 60px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border); }
        .sa-topbar-inner { display: flex; align-items: center; height: 100%; gap: 12px; max-width: 720px; margin: 0 auto; padding: 0 24px; }
        .sa-top-back { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); transition: all 0.25s; }
        .sa-top-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .sa-topbar-inner h1 { flex: 1; font-size: 16px; font-weight: 800; color: var(--color-text); margin: 0; }
        .sa-top-actions { display: flex; gap: 8px; }
        .sa-top-link { font-size: 13px; color: var(--color-text-muted); padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }
        .sa-top-link:hover { background: var(--color-bg-alt); color: var(--color-text); }

        /* Steps */
        .sa-steps { display: flex; align-items: flex-start; max-width: 720px; margin: 0 auto; padding: 20px 24px 16px; gap: 0; }
        .sa-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; cursor: default; }
        .sa-step.done { cursor: pointer; }
        .sa-step-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; background: var(--color-border); color: var(--color-text-muted); transition: all 0.3s ease; position: relative; z-index: 1; }
        .sa-step.done .sa-step-icon { background: var(--color-secondary); color: #fff; }
        .sa-step.current .sa-step-icon { background: var(--color-primary); color: #fff; box-shadow: 0 0 0 4px rgba(255,125,90,0.2); animation: saStepPulse 2s ease infinite; }
        .sa-step-label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); margin-top: 6px; white-space: nowrap; }
        .sa-step.done .sa-step-label { color: var(--color-secondary); }
        .sa-step.current .sa-step-label { color: var(--color-primary); font-weight: 700; }
        .sa-step-num { font-size: 10px; color: var(--color-text-muted); margin-top: 2px; }
        .sa-step-line { position: absolute; top: 18px; left: 60%; width: 80%; height: 3px; background: var(--color-border); z-index: 0; }
        .sa-step-line.done { background: var(--color-secondary); }
        @keyframes saStepPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,125,90,0.4); } 50% { box-shadow: 0 0 0 8px rgba(255,125,90,0); } }

        /* Draft saved */
        .sa-draft-saved { max-width: 720px; margin: 0 auto; padding: 8px 24px; font-size: 12px; color: var(--color-secondary); font-weight: 600; display: flex; align-items: center; gap: 6px; }

        /* Content */
        .sa-content { max-width: 720px; margin: 0 auto; padding: 0 24px 24px; }
        .sa-slide-in { animation: saSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes saSlideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        .sa-section-hdr { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: var(--color-text); margin-bottom: 16px; }
        .sa-section-time { font-size: 12px; font-weight: 500; color: var(--color-text-muted); margin-left: auto; }

        /* Card */
        .sa-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 20px; margin-bottom: 16px; }

        /* Fields */
        .sa-field { margin-bottom: 16px; }
        .sa-field:last-child { margin-bottom: 0; }
        .sa-field label { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 6px; }
        .sa-req { color: var(--color-error); }
        .sa-input-wrap { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); transition: all 0.25s; background: #fff; }
        .sa-input-wrap:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.1); }
        .sa-input-wrap.error { border-color: var(--color-error); box-shadow: 0 0 0 3px rgba(255,107,107,0.1); animation: saShake 0.3s ease; }
        @keyframes saShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .sa-input-icon { font-size: 16px; flex-shrink: 0; }
        .sa-input-wrap input, .sa-input-wrap textarea { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; font-family: inherit; }
        .sa-input-wrap input::placeholder, .sa-input-wrap textarea::placeholder { color: #C0C0D0; }
        .sa-input-wrap textarea { resize: vertical; min-height: 60px; line-height: 1.6; }
        .sa-input-valid { color: var(--color-secondary); }
        .sa-field-error { font-size: 12px; color: var(--color-error); margin-top: 4px; display: block; }
        .sa-field-footer { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
        .sa-bio-count { font-size: 12px; color: var(--color-text-muted); margin-left: auto; }
        .sa-bio-count.warn { color: var(--color-error); }

        .sa-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .sa-select-wrap { cursor: pointer; position: relative; }
        .sa-select-value { flex: 1; font-size: 14px; }
        .sa-select-value.placeholder { color: #C0C0D0; }
        .sa-select-arrow { transition: transform 0.25s; color: var(--color-text-muted); }
        .sa-city-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 10; background: #fff; border-radius: var(--radius-sm); border: 1px solid var(--color-border); box-shadow: 0 8px 30px rgba(0,0,0,0.08); max-height: 200px; overflow-y: auto; margin-top: 4px; }
        .sa-city-item { padding: 10px 14px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .sa-city-item:hover { background: var(--color-primary-light); }
        .sa-city-item.active { color: var(--color-primary); font-weight: 700; background: var(--color-primary-light); }

        /* Certificates */
        .sa-tip { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #FFF8E0; border-radius: var(--radius-sm); font-size: 13px; color: #8B6F00; margin-bottom: 16px; }
        .sa-cert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .sa-cert-card { border: 2px dashed var(--color-border); border-radius: var(--radius-md); padding: 20px; text-align: center; transition: all 0.3s ease; position: relative; min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .sa-cert-card.done { border-style: solid; border-color: var(--color-secondary); background: rgba(69,183,160,0.03); }
        .sa-cert-card.has-error { border-color: var(--color-error); }
        .sa-cert-card:hover:not(.done) { border-color: var(--color-primary); background: rgba(255,125,90,0.03); }
        .sa-cert-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; padding: 10px; }
        .sa-cert-plus { font-size: 32px; font-weight: 300; color: var(--color-text-muted); width: 48px; height: 48px; border-radius: 50%; border: 2px dashed var(--color-border); display: flex; align-items: center; justify-content: center; transition: all 0.25s; }
        .sa-cert-card:hover .sa-cert-plus { border-color: var(--color-primary); color: var(--color-primary); }
        .sa-cert-upload-label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); }
        .sa-cert-preview { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .sa-cert-file-icon { font-size: 32px; }
        .sa-cert-file-name { font-size: 12px; color: var(--color-text); font-weight: 600; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sa-cert-uploaded-date { font-size: 11px; color: var(--color-secondary); font-weight: 600; }
        .sa-cert-delete { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); transition: all 0.2s; }
        .sa-cert-delete:hover { background: #FFF0F0; color: var(--color-error); }
        .sa-cert-footer { margin-top: 12px; display: flex; align-items: center; gap: 6px; }
        .sa-cert-label { font-size: 12px; font-weight: 600; color: var(--color-text); }
        .sa-cert-req { font-size: 10px; padding: 1px 6px; border-radius: 4px; background: #FFF0F0; color: var(--color-error); font-weight: 600; }
        .sa-cert-req.opt { background: var(--color-bg-alt); color: var(--color-text-muted); }
        .sa-notice { display: flex; align-items: flex-start; gap: 8px; padding: 12px; background: #F0F8FF; border-radius: var(--radius-sm); font-size: 12px; color: #4A6FA5; line-height: 1.5; }

        /* Service areas */
        .sa-card-label { display: block; font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 10px; }
        .sa-area-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .sa-area-tag { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); background: var(--color-bg-alt); border: 1.5px solid transparent; transition: all 0.25s; cursor: pointer; }
        .sa-area-tag:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .sa-area-tag.active { background: rgba(255,125,90,0.1); border-color: var(--color-primary); color: var(--color-primary); }
        .sa-area-check { font-size: 12px; }

        /* Slider */
        .sa-slider-wrap { display: flex; align-items: center; gap: 12px; padding: 8px 0; position: relative; }
        .sa-slider-min, .sa-slider-max { font-size: 12px; color: var(--color-text-muted); min-width: 32px; }
        .sa-slider-max { text-align: right; }
        .sa-slider { flex: 1; -webkit-appearance: none; height: 6px; border-radius: 3px; background: linear-gradient(90deg, var(--color-primary) ${(form.maxDistance - 1) / 9 * 100}%, var(--color-border) ${(form.maxDistance - 1) / 9 * 100}%); outline: none; }
        .sa-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 2px solid var(--color-primary); box-shadow: 0 2px 8px rgba(255,125,90,0.2); cursor: pointer; transition: all 0.2s; }
        .sa-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .sa-slider-value { position: absolute; top: -8px; left: calc(${(form.maxDistance - 1) / 9 * 100}% + 24px); transform: translateX(-50%); font-size: 12px; font-weight: 700; color: var(--color-primary); background: #fff; padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }

        /* Time */
        .sa-time-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .sa-time-row:last-child { margin-bottom: 0; }
        .sa-time-day { font-size: 13px; font-weight: 600; color: var(--color-text); min-width: 80px; }
        .sa-time-pickers { display: flex; align-items: center; gap: 8px; }
        .sa-time-pickers select { padding: 6px 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; background: #fff; outline: none; cursor: pointer; }
        .sa-time-pickers select:focus { border-color: var(--color-primary); }
        .sa-time-sep { color: var(--color-text-muted); font-weight: 600; }
        .sa-copy-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--color-text-muted); transition: all 0.2s; }
        .sa-copy-btn:hover { background: var(--color-bg-alt); color: var(--color-primary); }

        /* Review */
        .sa-review-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 12px; overflow: hidden; }
        .sa-rv-hdr { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--color-bg-alt); border-bottom: 1px solid var(--color-border); font-size: 14px; font-weight: 700; color: var(--color-text); }
        .sa-rv-edit { font-size: 12px; color: var(--color-primary); font-weight: 600; padding: 4px 10px; border-radius: 6px; transition: all 0.2s; }
        .sa-rv-edit:hover { background: var(--color-primary-light); }
        .sa-rv-body { padding: 14px 16px; }
        .sa-rv-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: var(--color-text); }
        .sa-rv-row:last-child { margin-bottom: 0; }
        .sa-rv-bio { font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 8px 0 0; background: var(--color-bg-alt); padding: 10px; border-radius: var(--radius-sm); }
        .sa-rv-cert { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .sa-rv-ok { color: var(--color-secondary); font-weight: 700; }
        .sa-rv-missing { color: var(--color-text-muted); font-size: 12px; }

        /* Agreement */
        .sa-agree-wrap { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
        .sa-agree { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text); cursor: pointer; }
        .sa-agree input { width: 16px; height: 16px; accent-color: var(--color-primary); }

        /* Bottom bar */
        .sa-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-top: 1px solid var(--color-border); padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; max-width: 720px; margin: 0 auto; left: 50%; transform: translateX(-50%); width: 100%; gap: 12px; }
        .sa-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; transition: all 0.25s; cursor: pointer; white-space: nowrap; }
        .sa-btn.primary { background: var(--color-primary-gradient); color: #fff; border: none; box-shadow: 0 4px 14px rgba(255,125,90,0.25); }
        .sa-btn.primary:hover { box-shadow: 0 6px 24px rgba(255,125,90,0.35); transform: translateY(-1px); }
        .sa-btn.primary.disabled, .sa-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .sa-btn.outline { border: 1.5px solid var(--color-border); color: var(--color-text-secondary); background: #fff; }
        .sa-btn.outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .sa-btn.large { padding: 12px 32px; font-size: 15px; }
        .sa-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: saSpin 0.6s linear infinite; display: inline-block; }
        @keyframes saSpin { to { transform: rotate(360deg); } }

        /* Status page overrides */
        .sa-status { max-width: 520px; margin: 0 auto; padding: 40px 24px; text-align: center; }
        .sa-status-icon { font-size: 48px; margin-bottom: 16px; }
        .sa-status-icon span { display: inline-block; }
        .sa-status-icon.pending span { animation: saBounce 1s ease infinite; }
        .sa-status-icon.approved span { animation: saPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes saBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes saPopIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }
        .sa-status h2 { font-size: 22px; font-weight: 800; color: var(--color-text); margin: 0 0 8px; }
        .sa-status-desc { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
        .sa-status-timer { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 20px; margin: 0 auto 20px; max-width: 400px; }
        .sa-timer-hdr { font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 12px; }
        .sa-timer-bar { height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
        .sa-timer-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--color-primary), #FFB39A); animation: saShimmer 2s ease infinite; background-size: 200% 100%; }
        @keyframes saShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        .sa-timer-text { font-size: 12px; color: var(--color-text-muted); }
        .sa-status-steps { display: flex; flex-direction: column; gap: 12px; text-align: left; max-width: 320px; margin: 0 auto 20px; }
        .sa-ss-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
        .sa-ss-item.done { color: var(--color-secondary); }
        .sa-ss-item.active { color: var(--color-text); font-weight: 600; }
        .sa-ss-dot { font-size: 12px; }
        .sa-ss-dot.pulse { animation: saStepPulse 1.5s ease infinite; color: var(--color-primary); }
        .sa-ss-check { margin-left: auto; }
        .sa-ss-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(255,125,90,0.1); color: var(--color-primary); font-weight: 600; margin-left: auto; }
        .sa-status-suggest { text-align: left; margin-bottom: 20px; }
        .sa-status-suggest p { font-size: 13px; font-weight: 600; color: var(--color-text); margin: 0 0 10px; }
        .sa-suggest-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .sa-suggest-grid button { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: #fff; font-size: 12px; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; transition: all 0.25s; }
        .sa-suggest-grid button:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .sa-status-actions { display: flex; gap: 12px; justify-content: center; }
        .sa-profile-card { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 20px; margin: 16px auto; max-width: 340px; }
        .sa-pc-avatar { font-size: 48px; }
        .sa-pc-info { text-align: left; }
        .sa-pc-name { display: block; font-size: 18px; font-weight: 800; color: var(--color-text); }
        .sa-pc-badge { display: block; font-size: 13px; color: #D48806; font-weight: 600; margin: 2px 0; }
        .sa-pc-stats { display: block; font-size: 12px; color: var(--color-text-muted); }
        .sa-checklist { text-align: left; max-width: 300px; margin: 16px auto 0; }
        .sa-cl-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; color: var(--color-text); }
        .sa-cl-check { color: var(--color-secondary); font-weight: 700; }
        .sa-reject-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 16px; margin: 16px auto; max-width: 400px; text-align: left; }
        .sa-reject-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
        .sa-reject-item:last-child { border-bottom: none; }
        .sa-reject-item strong { display: block; font-size: 13px; color: var(--color-text); margin-bottom: 2px; }
        .sa-reject-item p { margin: 0; font-size: 12px; color: var(--color-text-muted); }
        .sa-contact-card { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #F0F8FF; border-radius: var(--radius-sm); font-size: 13px; color: #4A6FA5; margin: 0 auto 20px; max-width: 400px; }

        @media (max-width: 640px) {
          .sa-field-row { grid-template-columns: 1fr; }
          .sa-cert-grid { grid-template-columns: 1fr; }
          .sa-suggest-grid { grid-template-columns: 1fr; }
          .sa-time-row { flex-wrap: wrap; }
          .sa-step-label { font-size: 10px; }
          .sa-step-num { display: none; }
          .sa-bottom-bar { padding: 12px 16px; }
        }
      `}</style>
    </div>
  )
}
