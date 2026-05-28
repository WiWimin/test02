import { useNavigate } from 'react-router-dom'
import {
  MapPin, Calendar, ChevronRight, Star, Clock, ShieldCheck,
  Dog, Plus, MessageCircle, Heart, ClipboardList
} from 'lucide-react'
import { getCurrentUser } from '../../utils/auth'

const todaySchedule = [
  { id: 'O20240528001', sitter: '张阿姨', avatar: '👩', service: '上门遛狗', time: '10:00-11:00', address: '望京SOHO T3 1808', status: '进行中' },
  { id: 'O20240528004', sitter: '李阿姨', avatar: '👩', service: '上门喂猫', time: '14:00-14:30', address: '融泽嘉园12号院', status: '待服务' },
]

const recentOrders = [
  { id: 'O20240528001', sitter: '张阿姨', service: '上门喂养 - 猫咪', date: '2024-05-28', time: '10:00-11:00', status: '进行中', amount: 88, avatar: '👩' },
  { id: 'O20240527002', sitter: '李阿姨', service: '遛狗', date: '2024-05-27', time: '14:00-14:30', status: '已完成', amount: 49, avatar: '👩' },
  { id: 'O20240525003', sitter: '小王', service: '上门喂养 - 狗狗', date: '2024-05-25', time: '09:00-10:00', status: '已完成', amount: 128, avatar: '🧑' },
]

const myPets = [
  { id: 1, name: '咪咪', type: 'cat', breed: '英短', age: '2岁', avatar: '🐱', color: '#FFE0D5' },
  { id: 2, name: '旺财', type: 'dog', breed: '柯基', age: '1岁', avatar: '🐶', color: '#D5F0EB' },
]

const favoriteSitters = [
  { id: 1, name: '张阿姨', avatar: '👩', level: '金牌服务者', score: 4.9, orders: 328, tags: ['经验丰富', '耐心细致'], price: 88 },
  { id: 2, name: '李阿姨', avatar: '👩', level: '银牌服务者', score: 4.8, orders: 215, tags: ['喜欢小动物', '时间灵活'], price: 49 },
]

function PetAvatar({ name, avatar, color }: { name: string; avatar: string; color: string }) {
  return (
    <div className="oh-pet-card">
      <div className="oh-pet-avatar" style={{ background: color }}>{avatar}</div>
      <div className="oh-pet-info"><span className="oh-pet-name">{name}</span></div>
      <button className="oh-pet-msg"><MessageCircle size={14} /></button>
    </div>
  )
}

function SitterCard({ sitter }: { sitter: typeof favoriteSitters[0] }) {
  const navigate = useNavigate()
  return (
    <div className="oh-sitter-card" onClick={() => navigate(`/services/${sitter.id}`)}>
      <div className="oh-sc-top">
        <div className="oh-sc-avatar">{sitter.avatar}</div>
        <div className="oh-sc-info">
          <span className="oh-sc-name">{sitter.name}</span>
          <span className="oh-sc-level">{sitter.level}</span>
        </div>
        <button className="oh-sc-fav" onClick={e => { e.stopPropagation(); alert('已收藏/取消收藏') }}><Heart size={16} /></button>
      </div>
      <div className="oh-sc-stats">
        <span><Star size={12} /> {sitter.score}</span>
        <span><ShieldCheck size={12} /> {sitter.orders}单</span>
        <span>¥{sitter.price}/次起</span>
      </div>
      <div className="oh-sc-tags">{sitter.tags.map(t => <span key={t} className="oh-sc-tag">{t}</span>)}</div>
    </div>
  )
}

export default function OwnerHome() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const userName = user?.name || '用户'

  return (
    <div className="oh-page">
      {/* Welcome Banner */}
      <div className="oh-banner">
        <div className="oh-banner-bg" />
        <div className="oh-banner-content">
          <div>
            <h2 className="oh-banner-greeting">Hi, {userName} 👋</h2>
            <p className="oh-banner-text">今天毛孩子的心情怎么样？</p>
          </div>
          <div className="oh-banner-emoji">🐾</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="oh-quick-actions">
        <button className="oh-qa-item" onClick={() => navigate('/home/owner/market')}>
          <div className="oh-qa-icon" style={{ background: '#FFF0EB', color: '#FF7D5A' }}><Calendar size={22} /></div>
          <span>预约服务</span>
        </button>
        <button className="oh-qa-item" onClick={() => navigate('/home/owner/pets')}>
          <div className="oh-qa-icon" style={{ background: '#E8F8F4', color: '#45B7A0' }}><Dog size={22} /></div>
          <span>我的宠物</span>
        </button>
        <button className="oh-qa-item" onClick={() => navigate('/home/owner/orders')}>
          <div className="oh-qa-icon" style={{ background: '#FFF8E1', color: '#FFD93D' }}><ClipboardList size={22} /></div>
          <span>我的订单</span>
        </button>
        <button className="oh-qa-item" onClick={() => navigate('/home/owner/favorites')}>
          <div className="oh-qa-icon" style={{ background: '#F0E6FF', color: '#A855F7' }}><Heart size={22} /></div>
          <span>收藏夹</span>
        </button>
      </div>

      {/* Today Schedule */}
      {todaySchedule.length > 0 && (
        <section className="oh-section">
          <div className="oh-section-header">
            <h3>📅 今日安排</h3>
            <span className="oh-section-date">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="oh-schedule-list">
            {todaySchedule.map(item => (
              <div key={item.id} className="oh-schedule-card" onClick={() => navigate(`/home/owner/orders/${item.id}`)}>
                <div className="oh-sc-left">
                  <span className="oh-sc-avatar">{item.avatar}</span>
                </div>
                <div className="oh-sc-mid">
                  <div className="oh-sc-top-row">
                    <span className="oh-sc-sitter">{item.sitter}</span>
                    <span className={`oh-sc-badge ${item.status === '进行中' ? 'active' : ''}`}>{item.status}</span>
                  </div>
                  <span className="oh-sc-service">{item.service}</span>
                  <span className="oh-sc-meta"><Clock size={11} /> {item.time} · {item.address}</span>
                </div>
                <ChevronRight size={14} className="oh-sc-arrow" />
              </div>
            ))}
          </div>
          <button className="oh-section-link" onClick={() => navigate('/home/owner/orders')}>查看全部订单 →</button>
        </section>
      )}

      {/* My Orders */}
      <section className="oh-section">
        <div className="oh-section-header" onClick={() => navigate('/home/owner/orders')}>
          <h3>最近订单</h3>
          <button className="oh-section-more">查看全部 <ChevronRight size={14} /></button>
        </div>
        <div className="oh-order-list">
          {recentOrders.map(order => (
            <div key={order.id} className="oh-order-card" onClick={() => navigate(`/home/owner/orders/${order.id}`)}>
              <div className="oh-oc-left">
                <div className="oh-oc-avatar">{order.avatar}</div>
              </div>
              <div className="oh-oc-mid">
                <div className="oh-oc-top">
                  <span className="oh-oc-sitter">{order.sitter}</span>
                  <span className={`oh-oc-status ${order.status === '进行中' ? 'active' : 'done'}`}>{order.status}</span>
                </div>
                <span className="oh-oc-service">{order.service}</span>
                <span className="oh-oc-time"><Clock size={12} /> {order.date} {order.time}</span>
              </div>
              <div className="oh-oc-right">
                <span className="oh-oc-amount">¥{order.amount}</span>
                <ChevronRight size={14} className="oh-oc-arrow" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My Pets */}
      <section className="oh-section">
        <div className="oh-section-header" onClick={() => navigate('/home/owner/pets')}>
          <h3>我的宠物</h3>
          <button className="oh-section-more">管理 <ChevronRight size={14} /></button>
        </div>
        <div className="oh-pet-grid">
          {myPets.map(pet => <PetAvatar key={pet.id} name={pet.name} avatar={pet.avatar} color={pet.color} />)}
          <button className="oh-add-pet" onClick={() => navigate('/home/owner/pets')}>
            <Plus size={24} /><span>添加宠物</span>
          </button>
        </div>
      </section>

      {/* Favorite Sitters */}
      <section className="oh-section">
        <div className="oh-section-header" onClick={() => navigate('/home/owner/favorites')}>
          <h3>常驻服务者</h3>
          <button className="oh-section-more">查看全部 <ChevronRight size={14} /></button>
        </div>
        <div className="oh-sitter-grid">
          {favoriteSitters.map(s => <SitterCard key={s.id} sitter={s} />)}
        </div>
      </section>

      <style>{`
        .oh-page { display: flex; flex-direction: column; gap: 20px; }

        .oh-banner { position: relative; border-radius: var(--radius-lg); overflow: hidden; min-height: 120px; }
        .oh-banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #FF7D5A 0%, #FF9F7A 50%, #FFB89A 100%); }
        .oh-banner-content { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 24px 28px; z-index: 1; }
        .oh-banner-greeting { font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 4px; }
        .oh-banner-text { font-size: 14px; color: rgba(255,255,255,0.85); margin: 0; }
        .oh-banner-emoji { font-size: 48px; line-height: 1; }

        .oh-quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .oh-qa-item { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; border-radius: var(--radius-md); background: #fff; border: 1px solid var(--color-border); cursor: pointer; transition: all 0.25s; }
        .oh-qa-item:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
        .oh-qa-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .oh-qa-item span { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }

        .oh-section { margin-bottom: 0; }
        .oh-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; cursor: pointer; }
        .oh-section-header h3 { font-size: 16px; font-weight: 700; color: var(--color-text); margin: 0; }
        .oh-section-date { font-size: 13px; color: var(--color-text-muted); font-weight: 500; }
        .oh-section-more { display: flex; align-items: center; gap: 2px; font-size: 13px; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 0; }
        .oh-section-more:hover { color: var(--color-primary); }
        .oh-section-link { display: block; width: 100%; text-align: center; padding: 10px; font-size: 13px; color: var(--color-primary); font-weight: 600; margin-top: 8px; }

        /* Schedule */
        .oh-schedule-list { display: flex; flex-direction: column; gap: 8px; }
        .oh-schedule-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-md); background: #fff; border: 1px solid var(--color-border); cursor: pointer; transition: all 0.25s; }
        .oh-schedule-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .oh-sc-left { flex-shrink: 0; }
        .oh-sc-avatar { width: 36px; height: 36px; border-radius: var(--radius-full); background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .oh-sc-mid { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .oh-sc-top-row { display: flex; align-items: center; gap: 8px; }
        .oh-sc-sitter { font-size: 14px; font-weight: 600; }
        .oh-sc-badge { font-size: 10px; padding: 1px 8px; border-radius: 100px; background: var(--color-bg); color: var(--color-text-muted); font-weight: 600; }
        .oh-sc-badge.active { background: #FFF0EB; color: var(--color-primary); }
        .oh-sc-service { font-size: 12px; color: var(--color-text-muted); }
        .oh-sc-meta { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
        .oh-sc-arrow { color: var(--color-text-muted); }

        .oh-order-list { display: flex; flex-direction: column; gap: 10px; }
        .oh-order-card { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: var(--radius-md); background: #fff; border: 1px solid var(--color-border); cursor: pointer; transition: all 0.25s; }
        .oh-order-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .oh-oc-left { flex-shrink: 0; }
        .oh-oc-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .oh-oc-mid { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .oh-oc-top { display: flex; align-items: center; gap: 8px; }
        .oh-oc-sitter { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .oh-oc-status { font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 100px; }
        .oh-oc-status.active { background: #FFF0EB; color: var(--color-primary); }
        .oh-oc-status.done { background: #E8F8F4; color: var(--color-secondary); }
        .oh-oc-service { font-size: 12px; color: var(--color-text-muted); }
        .oh-oc-time { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
        .oh-oc-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .oh-oc-amount { font-size: 16px; font-weight: 700; color: var(--color-primary); }
        .oh-oc-arrow { color: var(--color-text-muted); }

        .oh-pet-grid { display: flex; gap: 10px; flex-wrap: wrap; }
        .oh-pet-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); background: var(--color-bg); border: 1px solid var(--color-border); cursor: pointer; transition: all 0.25s; }
        .oh-pet-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .oh-pet-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .oh-pet-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .oh-pet-name { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .oh-pet-msg { width: 28px; height: 28px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); transition: all 0.2s; }
        .oh-pet-msg:hover { background: var(--color-bg); color: var(--color-primary); }
        .oh-add-pet { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 80px; height: 80px; border-radius: var(--radius-md); border: 1.5px dashed var(--color-border); color: var(--color-text-muted); cursor: pointer; transition: all 0.25s; }
        .oh-add-pet:hover { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,125,90,0.04); }
        .oh-add-pet span { font-size: 11px; }

        .oh-sitter-card { padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: #fff; cursor: pointer; transition: all 0.25s; }
        .oh-sitter-card:hover { border-color: var(--color-primary); box-shadow: 0 4px 20px rgba(255,125,90,0.1); transform: translateY(-2px); }
        .oh-sc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .oh-sc-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .oh-sc-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .oh-sc-name { font-size: 14px; font-weight: 700; color: var(--color-text); }
        .oh-sc-level { font-size: 11px; color: var(--color-primary); font-weight: 600; }
        .oh-sc-fav { width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); transition: all 0.2s; }
        .oh-sc-fav:hover { background: #FFF0F0; color: #FF6B6B; }
        .oh-sc-stats { display: flex; gap: 16px; font-size: 12px; color: var(--color-text-muted); margin-bottom: 8px; }
        .oh-sc-stats span { display: flex; align-items: center; gap: 4px; }
        .oh-sc-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .oh-sc-tag { padding: 3px 10px; border-radius: 100px; font-size: 11px; background: var(--color-bg); color: var(--color-text-secondary); }
        .oh-sitter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (max-width: 480px) { .oh-sitter-grid { grid-template-columns: 1fr); } }
      `}</style>
    </div>
  )
}
