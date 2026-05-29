import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, MapPin, ChevronDown, X, SlidersHorizontal, Filter } from 'lucide-react'
import { api } from '../../utils/api'

interface Sitter {
  id: string
  name: string
  avatar: string
  bgColor: string
  rating: number
  reviews: number
  distance: string
  price: number
  tags: string[]
  level: string
  online: boolean
}

const categories = ['全部', '遛狗', '上门喂猫', '宠物清洁', '宠物医疗', '宠物寄养', '宠物美容', '宠物训练']

const bgColors = ['#FFF0EB', '#E8F8F4', '#FFF8E0', '#F0E6FF', '#FFE0EC', '#E0F0FF']

const levelLabels: Record<number, string> = {
  1: '金牌',
  2: '银牌',
  3: '铜牌',
}

const searchHistoryKey = 'petcare_search_history'

export default function OwnerMarket() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('综合')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(searchHistoryKey) || '[]') } catch { return [] }
  })
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [sitters, setSitters] = useState<Sitter[]>([])
  const [loading, setLoading] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  const fetchSitters = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== '全部') params.set('category', category)
      if (search) params.set('keyword', search)
      if (priceRange[0] > 0) params.set('priceMin', String(priceRange[0]))
      if (priceRange[1] < 500) params.set('priceMax', String(priceRange[1]))
      if (minRating > 0) params.set('minRating', String(minRating))
      if (sortBy === '评分最高') params.set('sortBy', 'rating')
      else if (sortBy === '价格最低') params.set('sortBy', 'price')
      params.set('pageSize', '50')

      const res = await api.get<{ items: any[] }>(`/sitters?${params.toString()}`)
      const items = (res as any)?.items || []
      setSitters(items.map((s: any, i: number) => ({
        id: s.id,
        name: s.name || '',
        avatar: s.avatar || '👩',
        bgColor: bgColors[i % bgColors.length],
        rating: s.rating || 0,
        reviews: s.reviews || 0,
        distance: '',
        price: s.price || 0,
        tags: s.tags || [],
        level: levelLabels[s.level] || `Lv.${s.level}`,
        online: s.online || false,
      })))
    } catch (err) {
      console.error('Failed to load sitters:', err)
      setSitters([])
    } finally {
      setLoading(false)
    }
  }, [category, search, priceRange, minRating, sortBy])

  useEffect(() => {
    const timer = setTimeout(fetchSitters, 300)
    return () => clearTimeout(timer)
  }, [fetchSitters])

  const doSearch = (val: string) => {
    setSearch(val)
    if (val.trim()) {
      const next = [val, ...history.filter(h => h !== val)].slice(0, 6)
      setHistory(next)
      localStorage.setItem(searchHistoryKey, JSON.stringify(next))
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(searchHistoryKey)
  }

  return (
    <div className="om-page">
      {/* Search Bar */}
      <div className="om-search-wrap">
        <div className={`om-search ${search ? 'has-value' : ''}`}>
          <Search size={16} />
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setShowHistory(true)} placeholder="搜索服务者、服务类型..." />
          {search && <button className="om-search-clear" onClick={() => { setSearch(''); setShowHistory(false) }}><X size={16} /></button>}
        </div>
        <button className={`om-filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Search History */}
      {showHistory && !search && history.length > 0 && (
        <div className="om-history" onClick={() => setShowHistory(false)}>
          <div className="om-history-panel" onClick={e => e.stopPropagation()}>
            <div className="om-history-top">
              <span className="om-history-title">搜索历史</span>
              <button className="om-history-clear" onClick={clearHistory}>清除</button>
            </div>
            <div className="om-history-list">
              {history.map(h => (
                <button key={h} className="om-history-item" onClick={() => { doSearch(h); setShowHistory(false) }}>
                  <ClockIcon size={14} /> {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="om-filter-overlay" onClick={() => setShowFilters(false)}>
          <div className="om-filter-panel" onClick={e => e.stopPropagation()}>
            <div className="om-filter-header">
              <h3>筛选</h3>
              <button className="om-filter-reset" onClick={() => { setPriceRange([0, 500]); setMinRating(0) }}>重置</button>
            </div>
            <div className="om-filter-body">
              <div className="om-filter-section">
                <label>价格范围</label>
                <div className="om-price-range">
                  <span>¥{priceRange[0]}</span>
                  <input type="range" min={0} max={500} step={10} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} />
                  <span>¥{priceRange[1]}</span>
                </div>
              </div>
              <div className="om-filter-section">
                <label>最低评分</label>
                <div className="om-rating-select">
                  {[0, 3, 3.5, 4, 4.5].map(r => (
                    <button key={r} className={`om-rating-btn ${minRating === r ? 'active' : ''}`} onClick={() => setMinRating(r)}>
                      {r === 0 ? '不限' : `${r}★以上`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button className="om-filter-apply" onClick={() => setShowFilters(false)}>应用筛选</button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="om-categories">
        {categories.map(c => (
          <button key={c} className={`om-cat ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Sort Bar */}
      <div className="om-sort-bar">
        <span className="om-sort-result">共 {sitters.length} 位服务者</span>
        <div className="om-sort-options">
          {['综合', '距离最近', '评分最高', '价格最低'].map(s => (
            <button key={s} className={`om-sort-btn ${sortBy === s ? 'active' : ''}`} onClick={() => setSortBy(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Sitter Cards */}
      {loading ? (
        <div className="om-empty">
          <Search size={40} />
          <p>加载中...</p>
        </div>
      ) : sitters.length === 0 ? (
        <div className="om-empty">
          <Search size={40} />
          <p>换个关键词试试</p>
          <button className="om-empty-btn" onClick={() => { setSearch(''); setCategory('全部'); setPriceRange([0, 500]); setMinRating(0) }}>清除筛选</button>
        </div>
      ) : (
        <div className="om-grid">
          {sitters.map(sitter => (
            <div key={sitter.id} className="om-card" onClick={() => navigate(`/services/${sitter.id}`)}>
              <div className="om-card-top">
                <div className="om-card-avatar" style={{ background: sitter.bgColor }}>
                  {sitter.avatar}
                  {sitter.online && <span className="om-online-dot" />}
                </div>
                <div className="om-card-info">
                  <div className="om-card-name-row">
                    <span className="om-card-name">{sitter.name}</span>
                    <span className="om-card-level">{sitter.level}</span>
                  </div>
                  <div className="om-card-rating">
                    <Star size={12} weight="fill" /> {sitter.rating}
                    <span className="om-card-reviews">({sitter.reviews}单)</span>
                  </div>
                </div>
                <button className="om-card-fav" onClick={e => { e.stopPropagation(); alert('已收藏') }}>
                  <HeartIcon size={16} />
                </button>
              </div>
              <div className="om-card-tags">
                {sitter.tags.map(t => <span key={t} className="om-card-tag">{t}</span>)}
              </div>
              <div className="om-card-bottom">
                <span className="om-card-distance"><MapPin size={12} /> {sitter.distance}</span>
                <span className="om-card-price">¥{sitter.price}<span className="om-card-unit">/次起</span></span>
              </div>
              <button className="om-card-book">立即预约</button>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {sitters.length > 0 && (
        <div className="om-load-more">
          <button className="om-load-btn">加载更多</button>
        </div>
      )}

      <style>{`
        .om-page { }
        .om-search-wrap { display: flex; gap: 10px; margin-bottom: 12px; }
        .om-search { display: flex; align-items: center; gap: 10px; flex: 1; padding: 10px 16px; border-radius: var(--radius-md); background: #fff; border: 1.5px solid var(--color-border); transition: all 0.25s; }
        .om-search:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,125,90,0.08); }
        .om-search.has-value { border-color: var(--color-primary); }
        .om-search input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .om-search input::placeholder { color: var(--color-text-muted); }
        .om-search-clear { color: var(--color-text-muted); padding: 2px; }
        .om-filter-btn { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--color-border); color: var(--color-text-secondary); transition: all 0.25s; background: #fff; }
        .om-filter-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,125,90,0.06); }
        .om-filter-btn:hover { border-color: var(--color-primary); }
        .om-history { position: fixed; inset: 0; z-index: 200; }
        .om-history-panel { position: absolute; top: 64px; left: 16px; right: 16px; background: #fff; border-radius: var(--radius-md); box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 16px; max-width: 500px; margin: 0 auto; }
        .om-history-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .om-history-title { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .om-history-clear { font-size: 12px; color: var(--color-text-muted); }
        .om-history-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .om-history-item { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 100px; font-size: 13px; background: var(--color-bg); color: var(--color-text-secondary); }
        .om-filter-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.3); display: flex; align-items: flex-end; }
        .om-filter-panel { width: 100%; max-width: 500px; margin: 0 auto; background: #fff; border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: 20px 24px 24px; animation: slideUp 0.3s ease; }
        .om-filter-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .om-filter-header h3 { font-size: 18px; font-weight: 700; margin: 0; }
        .om-filter-reset { font-size: 13px; color: var(--color-primary); font-weight: 600; }
        .om-filter-body { display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px; }
        .om-filter-section label { font-size: 14px; font-weight: 600; color: var(--color-text); display: block; margin-bottom: 10px; }
        .om-price-range { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: var(--color-primary); }
        .om-price-range input { flex: 1; accent-color: var(--color-primary); }
        .om-rating-select { display: flex; gap: 8px; flex-wrap: wrap; }
        .om-rating-btn { padding: 6px 14px; border-radius: 100px; font-size: 13px; border: 1px solid var(--color-border); transition: all 0.2s; }
        .om-rating-btn.active { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,125,90,0.06); }
        .om-filter-apply { width: 100%; padding: 12px; border-radius: var(--radius-sm); background: var(--color-primary); color: #fff; font-size: 15px; font-weight: 700; border: none; }
        .om-categories { display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px; }
        .om-cat { padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; white-space: nowrap; border: 1px solid var(--color-border); transition: all 0.2s; }
        .om-cat.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .om-sort-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .om-sort-result { font-size: 12px; color: var(--color-text-muted); }
        .om-sort-options { display: flex; gap: 4px; }
        .om-sort-btn { padding: 4px 10px; border-radius: 4px; font-size: 12px; color: var(--color-text-muted); transition: all 0.2s; }
        .om-sort-btn.active { color: var(--color-primary); font-weight: 600; background: rgba(255,125,90,0.08); }
        .om-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--color-text-muted); }
        .om-empty p { margin: 0; font-size: 14px; }
        .om-empty-btn { padding: 8px 20px; border-radius: 100px; font-size: 13px; background: var(--color-primary); color: #fff; border: none; }
        .om-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .om-card { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 14px; transition: all 0.25s; cursor: pointer; }
        .om-card:hover { border-color: var(--color-primary); box-shadow: 0 4px 16px rgba(255,125,90,0.1); transform: translateY(-2px); }
        .om-card-top { display: flex; gap: 10px; margin-bottom: 10px; }
        .om-card-avatar { width: 44px; height: 44px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative; flex-shrink: 0; }
        .om-online-dot { position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; background: #45B7A0; border: 2px solid #fff; }
        .om-card-info { flex: 1; min-width: 0; }
        .om-card-name-row { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
        .om-card-name { font-size: 14px; font-weight: 700; color: var(--color-text); }
        .om-card-level { font-size: 10px; padding: 1px 6px; border-radius: 100px; background: #FFF0EB; color: var(--color-primary); font-weight: 600; }
        .om-card-rating { display: flex; align-items: center; gap: 2px; font-size: 12px; font-weight: 600; color: #F59E0B; }
        .om-card-reviews { font-size: 11px; color: var(--color-text-muted); font-weight: 400; margin-left: 2px; }
        .om-card-fav { width: 28px; height: 28px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; }
        .om-card-fav:hover { background: #FFF0F0; color: #FF6B6B; }
        .om-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .om-card-tag { padding: 2px 8px; border-radius: 100px; font-size: 11px; background: var(--color-bg); color: var(--color-text-secondary); }
        .om-card-bottom { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .om-card-distance { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 3px; }
        .om-card-price { font-size: 16px; font-weight: 700; color: var(--color-primary); }
        .om-card-unit { font-size: 11px; font-weight: 400; color: var(--color-text-muted); }
        .om-card-book { width: 100%; padding: 8px; border-radius: var(--radius-sm); background: var(--color-primary); color: #fff; font-size: 13px; font-weight: 600; border: none; transition: all 0.25s; }
        .om-card-book:hover { opacity: 0.9; }
        .om-load-more { text-align: center; padding: 20px 0; }
        .om-load-btn { padding: 8px 32px; border-radius: 100px; border: 1px solid var(--color-border); font-size: 13px; color: var(--color-text-secondary); background: #fff; }
        @media (max-width: 480px) { .om-grid { grid-template-columns: 1fr; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}

function ClockIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

function HeartIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
