import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, MapPin, Clock, Heart, Search, X, ChevronRight } from 'lucide-react'
import { api } from '../../utils/api'

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

const levelLabels: Record<number, string> = {
  1: '金牌服务者',
  2: '银牌服务者',
  3: '铜牌服务者',
}

export default function OwnerFavorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<FavSitter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchFavorites = async () => {
    try {
      const data = await api.get<any[]>('/sitters/favorites')
      setFavorites((data || []).map((f: any) => ({
        id: f.id,
        name: f.name || '',
        avatar: f.avatar || '👩',
        level: levelLabels[f.level] || `Lv.${f.level}`,
        score: f.score || 0,
        orders: f.orders || 0,
        tags: f.tags || [],
        price: f.price || 0,
        distance: '',
        serviceCount: (f.tags || []).length,
      })))
    } catch (err) {
      console.error('Failed to load favorites:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFavorites() }, [])

  const filtered = favorites.filter(f =>
    f.name.includes(search) || f.tags.some(t => t.includes(search))
  )

  const toggleFav = async (id: number) => {
    try {
      await api.post(`/sitters/${id}/favorite`, {})
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  if (loading) {
    return <div className="of-page" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>加载中...</div>
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
          {!search && <button className="of-browse-btn" onClick={() => navigate('/home/owner/market')}>去浏览服务</button>}
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
