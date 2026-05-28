import { useEffect, useRef, useState } from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: '豆豆妈',
    avatar: '👩',
    role: '金毛主人',
    rating: 5,
    text: '第一次用就爱上了！张阿姨特别细心，不仅按时遛了豆豆，还发了好多照片给我。豆豆玩得特别开心，以后就用这个平台了！',
    service: '遛狗 60分钟',
    bgColor: '#FFF0EB',
  },
  {
    name: '咪咪爸爸',
    avatar: '👨',
    role: '英短主人',
    rating: 5,
    text: '因为出差需要人上门喂猫，朋友推荐了这个平台。服务者小王非常专业，准时到达，还陪咪咪玩了半小时，强烈推荐！',
    service: '上门喂猫',
    bgColor: '#E8F8F4',
  },
  {
    name: '可乐妈妈',
    avatar: '👩',
    role: '柯基主人',
    rating: 5,
    text: '平台的服务者都经过严格筛选，让人很放心。我家的可乐有点怕生，但服务者很有耐心，慢慢就熟悉了。清洁做得特别干净！',
    service: '宠物清洁',
    bgColor: '#FFF8E0',
  },
  {
    name: '团团爸',
    avatar: '👨',
    role: '布偶猫主人',
    rating: 5,
    text: '有了这个平台再也不用担心出差没人照顾团团了。实时定位功能很实用，可以看到服务者到家的时间，沟通也很顺畅。',
    service: '上门喂食',
    bgColor: '#F0EBFF',
  },
]

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % testimonials.length)
      }, 4000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPaused])

  const goTo = (index: number) => {
    setCurrent(index)
    clearInterval(intervalRef.current)
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % testimonials.length)
      }, 4000)
    }
  }

  return (
    <section ref={ref} className="section testimonials-section" id="reviews">
      <div className="container">
        <div className={`section-title ${isVisible ? 'visible' : ''}`}>
          <h2>主人真实评价</h2>
          <p>来自宠物主人的真实反馈</p>
          <span className="accent-line" />
        </div>

        <div
          className={`testimonial-carousel ${isVisible ? 'visible' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="testimonial-card">
            <div className="tc-bg-pattern" />
            <div className="tc-quote">
              <Quote size={36} />
            </div>
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="tc-star" fill="#FFD93D" color="#FFD93D" />
              ))}
            </div>
            <p className="tc-text">{testimonials[current].text}</p>
            <div className="tc-author">
              <div className="tc-avatar" style={{ background: testimonials[current].bgColor }}>
                <span>{testimonials[current].avatar}</span>
              </div>
              <div className="tc-info">
                <span className="tc-name">{testimonials[current].name}</span>
                <span className="tc-role">{testimonials[current].role} · {testimonials[current].service}</span>
              </div>
            </div>
          </div>

          <div className="tc-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`tc-dot ${i === current ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`第 ${i + 1} 条评价`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-section {
          background: var(--color-bg-alt);
          overflow: hidden;
        }

        .testimonial-carousel {
          max-width: 640px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .testimonial-carousel.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .testimonial-card {
          position: relative;
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 48px 40px;
          text-align: center;
          border: 1px solid var(--color-border);
          overflow: hidden;
        }

        .tc-bg-pattern {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,125,90,0.06), transparent 70%);
        }

        .tc-quote {
          position: absolute;
          top: 20px;
          left: 24px;
          color: var(--color-primary);
          opacity: 0.12;
        }

        .tc-stars {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-bottom: 24px;
        }

        .tc-star {
          animation: bounceIn 0.5s ease;
        }

        .tc-text {
          font-size: 17px;
          line-height: 1.8;
          color: var(--color-text-secondary);
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
          min-height: 80px;
          transition: opacity 0.3s ease;
        }

        .tc-author {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .tc-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .tc-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .tc-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text);
        }

        .tc-role {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .tc-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }

        .tc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-border);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .tc-dot.active {
          width: 24px;
          border-radius: 4px;
          background: var(--color-primary-gradient);
        }

        .tc-dot:hover:not(.active) {
          background: var(--color-text-muted);
        }

        @media (max-width: 640px) {
          .testimonial-card { padding: 32px 20px; }
          .tc-text { font-size: 15px; min-height: 100px; }
        }
      `}</style>
    </section>
  )
}
