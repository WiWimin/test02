import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, MapPin, Clock, Heart, Search, X, ChevronRight } from 'lucide-react'

interface FavSitter {
  id: number
  name: string
  avatar: string
  level: string
  score: number
  orders: number
  tags: string[]
  price: number
  distance: string
  serviceCount: number
}

const mockFavorites: FavSitter[] = [
  { id: 1, name: '张阿姨', avatar: '👩', level: '金牌服务者', score: 4.9, orders: 328, tags: ['经验丰富', '耐心细致', '好评如潮'], price: 88, distance: '1.2km', serviceCount: 5 },
  { id: 2, name: '李阿姨', avatar: '👩', level: '银牌服务者', score: 4.8, orders: 215, tags: ['喜欢小动物', '时间灵活'], price: 49, distance: '2.5km', serviceCount: 3 },
  { id: 3, name: '小王', avatar: '🧑', level: '铜牌服务者', score: 4.7, orders: 156, tags: ['年轻有活力', '大型犬经验'], price: 69, distance: '0.8km', serviceCount: 4 },
  { id: 4, name: '赵阿姨', avatar: '👩', level: '金牌服务者', score: 4.9, orders: 412, tags: ['宠物医生背景', '营养配餐'], price: 128, distance: '3.1km', serviceCount: 6 },
]

export default function OwnerFavorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<FavSitter[]>(mockFavorites)
  const [search, setSearch] = useState('')

  const filtered = favorites.filter(f =>
    f.name.includes(search) || f.tags.some(t => t.includes(search))
  )

  const toggleFav = (id: number) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="of-page">
      <div className="of-header">
        <h2>我的收藏</h2>
        <span className="of-count">{favorites.length}位服务者</span>
      </div>

      {/* Search */}
      <div className="of-search">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索服务者..." />
        {search && <button className="of-search-clear" onClick={() => setSearch('')}><X size={16} /></button>}
      </div>

      {filtered.length === 0 ? (
        <div className="of-empty">
          <Heart size={48} />
          <p>{search ? '没有找到匹配的服务者' : '还没有收藏任何服务者'}</p>
          {!search && <button className="of-browse-btn" onClick={() => navigate('/')}>去浏览服务</button>}
        </div>
      ) : (
        <div className="of-list">
          {filtered.map(sitter => (
            <div key={sitter.id} className="of-card" onClick={() => navigate(`/services/${sitter.id}`)}>
              <div className="of-card-avatar">{sitter.avatar}</div>
              <div className="of-card-info">
                <div className="of-card-top">
                  <span className="of-card-name">{sitter.name}</span>
                  <span className="of-card-level">{sitter.level}</span>
                  <button className="of-card-fav active" onClick={e => { e.stopPropagation(); toggleFav(sitter.id) }}>
                    <Heart size={14} weight="fill" />
                  </button>
                </div>
                <div className="of-card-stats">
                  <span><Star size={12} /> {sitter.score}</span>
                  <span><ShieldCheck size={12} /> {sitter.orders}单</span>
                  <span><MapPin size={12} /> {sitter.distance}</span>
                </div>
                <div className="of-card-tags">
                  {sitter.tags.map(t => <span key={t} className="of-card-tag">{t}</span>)}
                </div>
                <div className="of-card-bottom">
                  <span className="of-card-price">¥{sitter.price}<span className="of-card-unit">/次起</span></span>
                  <span className="of-card-services"><Clock size={12} /> {sitter.serviceCount}种服务</span>
                </div>
              </div>
              <ChevronRight size={16} className="of-card-arrow" />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .of-page { }
        .of-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
        .of-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
        .of-count { font-size: 13px; color: var(--color-text-muted); }

        /* Search */
        .of-search {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; border-radius: var(--radius-md);
          background: #fff; border: 1px solid var(--color-border);
          margin-bottom: 16px;
        }
        .of-search input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .of-search input::placeholder { color: var(--color-text-muted); }
        .of-search-clear { color: var(--color-text-muted); padding: 2px; }

        /* Empty */
        .of-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--color-text-muted); }
        .of-empty p { margin: 0; font-size: 14px; }
        .of-browse-btn { padding: 10px 24px; border-radius: 100px; background: var(--color-primary); color: #fff; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }

        /* List */
        .of-list { display: flex; flex-direction: column; gap: 12px; }
        .of-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 16px; border-radius: var(--radius-md);
          background: #fff; border: 1px solid var(--color-border);
          cursor: pointer; transition: all 0.25s; position: relative;
        }
        .of-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .of-card-avatar { width: 48px; height: 48px; border-radius: var(--radius-full); background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .of-card-info { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .of-card-top { display: flex; align-items: center; gap: 8px; }
        .of-card-name { font-size: 15px; font-weight: 700; color: var(--color-text); }
        .of-card-level { font-size: 11px; padding: 1px 8px; border-radius: 100px; background: #FFF0EB; color: var(--color-primary); font-weight: 600; }
        .of-card-fav {
          margin-left: auto; width: 28px; height: 28px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: #FF6B6B; transition: all 0.2s;
        }
        .of-card-fav:hover { background: #FFF0F0; }
        .of-card-stats { display: flex; gap: 12px; font-size: 12px; color: var(--color-text-muted); }
        .of-card-stats span { display: flex; align-items: center; gap: 4px; }
        .of-card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .of-card-tag { padding: 2px 10px; border-radius: 100px; font-size: 11px; background: var(--color-bg); color: var(--color-text-secondary); }
        .of-card-bottom { display: flex; align-items: center; justify-content: space-between; }
        .of-card-price { font-size: 16px; font-weight: 700; color: var(--color-primary); }
        .of-card-unit { font-size: 11px; font-weight: 400; color: var(--color-text-muted); }
        .of-card-services { font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
        .of-card-arrow { color: var(--color-text-muted); align-self: center; flex-shrink: 0; }
      `}</style>
    </div>
  )
}
