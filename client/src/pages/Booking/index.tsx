import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Check, MapPin, Plus, ChevronDown,
  CreditCard, ShieldCheck, Clock, Home, Building, ChevronRight
} from 'lucide-react'
import { api } from '../../utils/api'
import { isLoggedIn } from '../../utils/auth'

const steps = [
  { num: 1, label: '选择宠物' },
  { num: 2, label: '服务地址' },
  { num: 3, label: '确认下单' },
]

export default function NewBooking() {
  const location = useLocation()
  const navigate = useNavigate()
  const [orderData] = useState<any>(() => {
    if (location.state) return location.state
    const pending = sessionStorage.getItem('pendingBooking')
    if (pending) {
      sessionStorage.removeItem('pendingBooking')
      return JSON.parse(pending)
    }
    return {}
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pets, setPets] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true })
      return
    }
    if (!orderData.sitterName) {
      navigate('/', { replace: true })
      return
    }
    const fetchData = async () => {
      try {
        const [petsData, addrData] = await Promise.all([
          api.get<any[]>('/pets'),
          api.get<any[]>('/addresses'),
        ])
        setPets(petsData || [])
        setAddresses(addrData || [])
        const defaultAddr = (addrData || []).find((a: any) => a.is_default)
        if (defaultAddr) setSelectedAddress(defaultAddr.id)
      } catch (err) {
        console.error('Failed to load pets/addresses:', err)
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const addrIcons: Record<string, any> = { home: Home, company: Building, other: Home }
  const getAddrIcon = (tag: string) => addrIcons[tag] || Home

  const canNext = () => {
    if (currentStep === 0) return selectedPets.length > 0
    if (currentStep === 1) return selectedAddress !== null
    return true
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canNext()) setCurrentStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/orders', {
        sitter_id: orderData.sitterId,
        pet_ids: selectedPets,
        address_id: selectedAddress,
        service_ids: orderData.selectedServices?.map((s: any) => s.id) || [],
        service_date: orderData.selectedDate || '',
        service_time: orderData.selectedTime || '',
        note: notes,
      })
      setShowSuccess(true)
    } catch (err: any) {
      setSubmitError(err.message || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const hasSitter = orderData.sitterName

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="nb-step-content">
          <p className="nb-step-desc">选择本次需要服务的毛孩子（可多选）</p>
          <div className="nb-pet-list">
            {dataLoading ? <p style={{color:'var(--color-text-muted)',padding:20}}>加载中...</p> : pets.length === 0 ? <p style={{color:'var(--color-text-muted)',padding:20}}>请先在"我的宠物"中添加宠物</p> : pets.map((pet: any) => {
              const selected = selectedPets.includes(pet.id)
              return (
                <button
                  key={pet.id}
                  className={`nb-pet-card ${selected ? 'selected' : ''}`}
                  onClick={() => setSelectedPets(prev =>
                    prev.includes(pet.id) ? prev.filter(id => id !== pet.id) : [...prev, pet.id]
                  )}
                >
                  <div className={`nb-pc-check ${selected ? 'checked' : ''}`}>
                    {selected && <Check size={13} />}
                  </div>
                  <span className="nb-pc-emoji">{pet.avatar || '🐾'}</span>
                  <div className="nb-pc-info">
                    <span className="nb-pc-name">{pet.name}</span>
                    <span className="nb-pc-breed">{pet.breed || ''}{pet.age ? ` · ${pet.age}` : ''}{pet.weight ? ` · ${pet.weight}` : ''}</span>
                    {pet.note && <span className="nb-pc-note">{pet.note}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )

      case 1: return (
        <div className="nb-step-content">
          <p className="nb-step-desc">选择服务地址</p>
          <div className="nb-addr-list">
            {dataLoading ? <p style={{color:'var(--color-text-muted)',padding:20}}>加载中...</p> : addresses.length === 0 ? <p style={{color:'var(--color-text-muted)',padding:20}}>请先在"我的地址"中添加地址</p> : addresses.map((addr: any) => {
              const selected = selectedAddress === addr.id
              const Icon = getAddrIcon(addr.tag || 'other')
              return (
                <button
                  key={addr.id}
                  className={`nb-addr-card ${selected ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(addr.id)}
                >
                  <div className="nb-ac-left">
                    <div className="nb-ac-icon"><Icon size={20} /></div>
                  </div>
                  <div className="nb-ac-body">
                    <div className="nb-ac-top">
                      <span className="nb-ac-label">{addr.label || addr.tag || '其他'}</span>
                      {addr.is_default && <span className="nb-ac-default">默认</span>}
                    </div>
                    <span className="nb-ac-detail">{addr.address} {addr.detail || ''}</span>
                  </div>
                  <div className={`nb-ac-radio ${selected ? 'checked' : ''}`}>
                    {selected && <div className="nb-ac-dot" />}
                  </div>
                </button>
              )
            })}
          </div>
          <button className="nb-add-addr">
            <Plus size={16} /> 添加新地址
          </button>
          <div className="nb-map-placeholder">
            <MapPin size={24} />
            <span>地图加载中...</span>
          </div>
        </div>
      )

      case 2: return (
        <div className="nb-step-content">
          <p className="nb-step-desc">添加备注信息并确认下单</p>
          <div className="nb-notes-section">
            <label className="nb-notes-label">备注（选填）</label>
            <textarea
              className="nb-notes-input"
              placeholder="例如：钥匙放在门口地毯下 / 宠物有特殊习惯..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          <div className="nb-confirm-card">
            <h4>订单确认</h4>
            <div className="nb-confirm-row">
              <span className="nb-cr-label">服务者</span>
              <span className="nb-cr-value">{orderData.sitterName || '—'}</span>
            </div>
            <div className="nb-confirm-row">
              <span className="nb-cr-label">宠物</span>
              <span className="nb-cr-value">
                {selectedPets.map(id => pets.find((p: any) => p.id === id)?.name).join('、') || '—'}
              </span>
            </div>
            <div className="nb-confirm-row">
              <span className="nb-cr-label">地址</span>
              <span className="nb-cr-value">
                {(addresses as any[]).find((a: any) => a.id === selectedAddress)?.address || '—'}
              </span>
            </div>
            <div className="nb-confirm-row">
              <span className="nb-cr-label">时间</span>
              <span className="nb-cr-value">{orderData.selectedDate || '—'} {orderData.selectedTime || ''}</span>
            </div>
            <div className="nb-confirm-row">
              <span className="nb-cr-label">支付方式</span>
              <span className="nb-cr-value">
                <CreditCard size={14} /> 微信支付 <ChevronRight size={12} />
              </span>
            </div>
          </div>
          {submitError && <p className="nb-error">{submitError}</p>}
        </div>
      )
    }
  }

  return (
    <div className="nb-page">
      {/* ── Top Bar ── */}
      <div className="nb-topbar">
        <div className="nb-topbar-inner container">
          <button className="nb-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <span className="nb-topbar-title">新建预约</span>
          <button className="nb-summary-toggle" onClick={() => setSummaryOpen(!summaryOpen)}>
            {summaryOpen ? '收起' : '摘要'} <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* ── Step Progress ── */}
      <div className="nb-progress-wrap">
        <div className="container">
          <div className="nb-progress">
            {steps.map((s, i) => (
              <div key={s.num} className="nb-progress-step">
                <div className={`nb-ps-circle ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}>
                  {i < currentStep ? <Check size={14} /> : s.num}
                </div>
                <span className={`nb-ps-label ${i <= currentStep ? 'active' : ''}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`nb-ps-line ${i < currentStep ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="nb-body">
        <div className="container">
          <div className="nb-layout">
            <div className="nb-main">
              <div className="nb-card">
                <div className="nb-card-header">
                  <h3>步骤 {currentStep + 1}：{steps[currentStep].label}</h3>
                </div>
                {renderStep()}
              </div>

              <div className="nb-actions">
                {currentStep > 0 ? (
                  <button className="btn btn-outline nb-btn" onClick={() => setCurrentStep(s => s - 1)}>
                    上一步
                  </button>
                ) : <div />}
                {currentStep < steps.length - 1 ? (
                  <button className={`btn btn-primary nb-btn ${!canNext() ? 'disabled' : ''}`}
                    disabled={!canNext()} onClick={handleNext}>
                    下一步
                  </button>
                ) : (
                  <button className={`btn btn-primary nb-btn ${!canNext() || submitting ? 'disabled' : ''}`}
                    disabled={!canNext() || submitting} onClick={handleSubmit}>
                    {submitting ? '提交中...' : '提交订单'}
                  </button>
                )}
              </div>
            </div>

            <div className="nb-sidebar">
              <div className={`nb-summary ${summaryOpen ? 'open' : ''}`}>
                <div className="nb-summary-header">
                  <h4>订单摘要</h4>
                </div>

                {hasSitter ? (
                  <div className="nb-summary-sitter">
                    <span className="nb-ss-avatar">{orderData.sitterAvatar || '👩'}</span>
                    <div>
                      <span className="nb-ss-name">{orderData.sitterName}</span>
                      <span className="nb-ss-label">服务者</span>
                    </div>
                  </div>
                ) : (
                  <div className="nb-ss-placeholder">请先选择服务</div>
                )}

                {orderData.selectedServices?.length > 0 && (
                  <div className="nb-summary-section">
                    <span className="nb-ss-title">服务项目</span>
                    {orderData.selectedServices.map((s: any) => (
                      <div key={s.id} className="nb-summary-row">
                        <span>{s.name}</span>
                        <span>¥{s.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPets.length > 0 && (
                  <div className="nb-summary-section">
                    <span className="nb-ss-title">宠物</span>
                    <div className="nb-summary-tags">
                      {selectedPets.map(id => {
                        const pet = (pets as any[]).find((p: any) => p.id === id)
                        return pet ? <span key={id} className="nb-summary-tag">{pet.avatar || '🐾'} {pet.name}</span> : null
                      })}
                    </div>
                  </div>
                )}

                {selectedAddress && (
                  <div className="nb-summary-section">
                    <span className="nb-ss-title">地址</span>
                    <span className="nb-summary-text">
                      <MapPin size={12} /> {(addresses as any[]).find((a: any) => a.id === selectedAddress)?.address}
                    </span>
                  </div>
                )}

                {orderData.selectedTime && (
                  <div className="nb-summary-section">
                    <span className="nb-ss-title">时间</span>
                    <span className="nb-summary-text">
                      <Clock size={12} /> {orderData.selectedDate} {orderData.selectedTime}
                    </span>
                  </div>
                )}

                <div className="nb-summary-divider" />

                <div className="nb-summary-total">
                  <span>合计</span>
                  <span className="nb-st-price">¥{orderData.total || 0}</span>
                </div>

                <div className="nb-summary-extra">
                  <ShieldCheck size={14} /> 已享平台保险保障
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="nb-modal-overlay" onClick={() => { setShowSuccess(false); navigate('/') }}>
          <div className="nb-modal" onClick={e => e.stopPropagation()}>
            <div className="nb-modal-icon">✅</div>
            <h3 className="nb-modal-title">预约成功！</h3>
            <p className="nb-modal-desc">
              已向服务者 {orderData.sitterName || '—'} 发送请求，<br />
              请等待确认。您可在「我的订单」中查看进展。
            </p>
            <div className="nb-modal-actions">
              <button className="btn btn-outline" onClick={() => navigate('/')}>返回首页</button>
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>查看订单</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nb-page { min-height: 100vh; background: var(--color-bg); padding-top: 56px; }

        .nb-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px; background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);
        }
        .nb-topbar-inner { display: flex; align-items: center; height: 100%; gap: 12px; }
        .nb-back {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 10px; border-radius: var(--radius-sm);
          color: var(--color-text-secondary); transition: all 0.25s ease;
        }
        .nb-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }
        .nb-topbar-title { font-size: 16px; font-weight: 600; color: var(--color-text); flex: 1; }
        .nb-summary-toggle {
          display: none; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 500; color: var(--color-primary);
          padding: 6px 12px; border-radius: var(--radius-sm);
          border: 1px solid var(--color-primary);
        }
        .nb-summary-toggle:hover { background: var(--color-primary-light); }

        .nb-progress-wrap {
          background: var(--color-bg-alt);
          border-bottom: 1px solid var(--color-border);
          padding: 20px 0;
        }
        .nb-progress {
          display: flex; align-items: center; justify-content: center; gap: 0;
          max-width: 480px; margin: 0 auto;
        }
        .nb-progress-step {
          display: flex; align-items: center; flex: 1;
        }
        .nb-ps-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          border: 2px solid var(--color-border);
          color: var(--color-text-muted);
          background: var(--color-bg-alt);
          transition: all 0.4s ease; flex-shrink: 0;
        }
        .nb-ps-circle.active {
          background: var(--color-primary); color: #fff;
          border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(255,125,90,0.15);
        }
        .nb-ps-circle.done {
          background: var(--color-secondary); color: #fff;
          border-color: var(--color-secondary);
        }
        .nb-ps-label {
          font-size: 12px; font-weight: 500; color: var(--color-text-muted);
          margin-left: 8px; white-space: nowrap; transition: color 0.3s;
        }
        .nb-ps-label.active { color: var(--color-text); }
        .nb-ps-line {
          flex: 1; height: 2px; background: var(--color-border);
          margin: 0 12px; transition: background 0.4s;
        }
        .nb-ps-line.done { background: var(--color-secondary); }

        .nb-body { padding: 24px 0 60px; }
        .nb-layout { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }

        .nb-main { min-width: 0; }
        .nb-card {
          background: var(--color-bg-alt); border-radius: var(--radius-lg);
          border: 1px solid var(--color-border); overflow: hidden;
        }
        .nb-card-header {
          padding: 20px 24px; border-bottom: 1px solid var(--color-border);
        }
        .nb-card-header h3 { font-size: 17px; font-weight: 700; color: var(--color-text); }

        .nb-step-content { padding: 24px; }
        .nb-step-desc { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 20px; }

        .nb-pet-list { display: flex; flex-direction: column; gap: 12px; }
        .nb-pet-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-radius: var(--radius-md);
          border: 2px solid var(--color-border);
          background: var(--color-bg); cursor: pointer;
          transition: all 0.3s ease; text-align: left; width: 100%;
        }
        .nb-pet-card:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
        .nb-pet-card.selected { border-color: var(--color-primary); background: var(--color-primary-light); }

        .nb-pc-check {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--color-border);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .nb-pc-check.checked { background: var(--color-primary-gradient); border-color: var(--color-primary); color: #fff; }

        .nb-pc-emoji { font-size: 32px; }
        .nb-pc-info { display: flex; flex-direction: column; gap: 2px; }
        .nb-pc-name { font-size: 15px; font-weight: 600; color: var(--color-text); }
        .nb-pc-breed { font-size: 12px; color: var(--color-text-muted); }
        .nb-pc-note { font-size: 12px; color: var(--color-text-secondary); }

        .nb-addr-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .nb-addr-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: var(--radius-md);
          border: 2px solid var(--color-border);
          background: var(--color-bg); cursor: pointer;
          transition: all 0.3s ease; text-align: left; width: 100%;
        }
        .nb-addr-card:hover { border-color: var(--color-primary); }
        .nb-addr-card.selected { border-color: var(--color-primary); }

        .nb-ac-icon {
          width: 40px; height: 40px; border-radius: var(--radius-sm);
          background: var(--color-primary-light); color: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
        }
        .nb-ac-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .nb-ac-top { display: flex; align-items: center; gap: 8px; }
        .nb-ac-label { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .nb-ac-default {
          font-size: 11px; font-weight: 500; color: var(--color-secondary);
          padding: 1px 8px; border-radius: 100px; background: var(--color-secondary-light);
        }
        .nb-ac-detail { font-size: 12px; color: var(--color-text-muted); }
        .nb-ac-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--color-border);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .nb-ac-radio.checked { border-color: var(--color-primary); }
        .nb-ac-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary); }

        .nb-add-addr {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--color-primary);
          padding: 8px 14px; border-radius: var(--radius-sm);
          transition: background 0.25s; margin-bottom: 16px;
        }
        .nb-add-addr:hover { background: var(--color-primary-light); }

        .nb-map-placeholder {
          height: 180px; border-radius: var(--radius-md);
          background: linear-gradient(135deg, #E8F4F8, #F0EBFF);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; color: var(--color-text-muted); font-size: 13px;
        }

        .nb-notes-section { margin-bottom: 20px; }
        .nb-notes-label {
          display: block; font-size: 14px; font-weight: 600;
          color: var(--color-text); margin-bottom: 8px;
        }
        .nb-notes-input {
          width: 100%; padding: 14px 16px; border-radius: var(--radius-sm);
          border: 1px solid var(--color-border); font-size: 14px;
          color: var(--color-text); background: var(--color-bg);
          resize: vertical; transition: border-color 0.25s;
          font-family: var(--font);
        }
        .nb-notes-input:focus { outline: none; border-color: var(--color-primary); }

        .nb-confirm-card {
          background: var(--color-bg); border-radius: var(--radius-md);
          padding: 20px; border: 1px solid var(--color-border);
        }
        .nb-confirm-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--color-text); }
        .nb-confirm-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid var(--color-border);
        }
        .nb-confirm-row:last-child { border-bottom: none; }
        .nb-cr-label { font-size: 13px; color: var(--color-text-muted); }
        .nb-cr-value {
          font-size: 13px; font-weight: 500; color: var(--color-text);
          display: flex; align-items: center; gap: 6px;
        }

        .nb-error {
          color: var(--color-error); font-size: 13px; margin-top: 12px; text-align: center;
        }

        .nb-actions {
          display: flex; justify-content: space-between; margin-top: 20px; gap: 12px;
        }
        .nb-btn { min-width: 120px; justify-content: center; }

        .nb-sidebar { position: sticky; top: 80px; }
        .nb-summary {
          background: var(--color-bg-alt); border-radius: var(--radius-lg);
          border: 1px solid var(--color-border); padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .nb-summary-header h4 { font-size: 16px; font-weight: 700; color: var(--color-text); }

        .nb-summary-sitter {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid var(--color-border);
        }
        .nb-ss-avatar { font-size: 32px; }
        .nb-ss-name { display: block; font-size: 14px; font-weight: 600; color: var(--color-text); }
        .nb-ss-label { font-size: 12px; color: var(--color-text-muted); }

        .nb-ss-placeholder { font-size: 13px; color: var(--color-text-muted); text-align: center; padding: 12px 0; }

        .nb-summary-section { display: flex; flex-direction: column; gap: 8px; }
        .nb-ss-title { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .nb-summary-row {
          display: flex; justify-content: space-between; font-size: 13px; color: var(--color-text-secondary);
        }
        .nb-summary-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .nb-summary-tag {
          font-size: 12px; padding: 3px 10px; border-radius: 100px;
          background: var(--color-primary-light); color: var(--color-primary);
        }
        .nb-summary-text {
          font-size: 13px; color: var(--color-text-secondary);
          display: flex; align-items: center; gap: 4px;
        }

        .nb-summary-divider { height: 1px; background: var(--color-border); }

        .nb-summary-total {
          display: flex; justify-content: space-between; align-items: center;
        }
        .nb-summary-total span:first-child { font-size: 14px; color: var(--color-text-secondary); }
        .nb-st-price { font-size: 24px; font-weight: 800; color: var(--color-primary); }

        .nb-summary-extra {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--color-secondary); padding: 8px 12px;
          background: var(--color-secondary-light); border-radius: var(--radius-sm);
        }

        .nb-modal-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.25s ease;
        }
        .nb-modal {
          background: #fff; border-radius: var(--radius-lg);
          padding: 40px 32px 28px; max-width: 380px; width: 90%;
          text-align: center; animation: expandIn 0.35s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .nb-modal-icon { font-size: 48px; margin-bottom: 16px; }
        .nb-modal-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--color-text); }
        .nb-modal-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px; }
        .nb-modal-actions { display: flex; gap: 12px; justify-content: center; }
        .nb-modal-actions .btn { min-width: 120px; justify-content: center; }

        @media (max-width: 900px) {
          .nb-layout { grid-template-columns: 1fr; }
          .nb-sidebar {
            position: fixed; top: auto; bottom: 0; left: 0; right: 0; z-index: 99;
            max-height: 0; overflow: hidden; transition: max-height 0.35s ease;
          }
          .nb-sidebar .nb-summary {
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          }
          .nb-sidebar .nb-summary.open { max-height: none; }
          .nb-summary-toggle { display: inline-flex; }
          .nb-body { padding-bottom: 0; }
        }

        @media (max-width: 600px) {
          .nb-progress { max-width: 100%; }
          .nb-ps-label { display: none; }
          .nb-step-content { padding: 16px; }
          .nb-card-header { padding: 16px 16px; }
          .nb-card-header h3 { font-size: 15px; }
        }
      `}</style>
    </div>
  )
}
