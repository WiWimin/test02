import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Phone, MoreVertical, Send, Paperclip, Image as ImageIcon,
  Smile, Check, CheckCheck, Clock, ChevronDown
} from 'lucide-react'
import { api } from '../utils/api'
import { getCurrentUser } from '../utils/auth'
import { io, Socket } from 'socket.io-client'

type MessageSender = 'me' | 'other' | 'system'
type MessageType = 'text' | 'image' | 'system'

interface Message {
  id: string; sender: MessageSender; type: MessageType
  content: string; time: Date; images?: number
}

function formatMsgTime(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth())
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (d.getDate() === now.getDate() - 1)
    return `昨天 ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
}

function shouldShowTime(msg: Message, prev?: Message): boolean {
  if (!prev) return true
  return msg.time.getTime() - prev.time.getTime() > 300000
}

const quickReplies = ['收到 📩', '马上到 🚶', '已完成 ✅', '好的 👍', '再联系 😊']

export default function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const [meta, setMeta] = useState<any>({ name: '加载中...', avatar: '👤', role: '', online: false, orderStatus: '' })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchConversation = async () => {
      try {
        const convs = await api.get<any[]>('/conversations')
        const conv = convs?.find((c: any) => c.id === id)
        if (conv) {
          setMeta({
            name: conv.participantName || conv.name || '用户',
            avatar: conv.participantAvatar || conv.avatar || '👤',
            role: conv.role || '',
            online: conv.online || false,
            orderStatus: conv.orderStatus || '',
          })
        }
        const msgs = await api.get<any[]>(`/conversations/${id}/messages`)
        setMessages((msgs || []).map((m: any) => ({
          id: m.id,
          sender: m.senderId === currentUser?.id ? 'me' : (m.sender === 'system' ? 'system' as const : 'other' as const),
          type: m.type || 'text',
          content: m.content,
          time: new Date(m.createdAt),
          images: m.imageCount || m.images,
        })))
        await api.put(`/conversations/${id}/read`, {})
      } catch (err) {
        console.error('Failed to fetch conversation:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversation()
  }, [id])

  useEffect(() => {
    const token = localStorage.getItem('petcare_token')
    if (!token) return
    const socket = io('http://localhost:3001', { auth: { token } })
    socketRef.current = socket

    socket.on('new_message', (msg: any) => {
      if (msg.conversationId === id && msg.senderId !== currentUser?.id) {
        setMessages(prev => [...prev, {
          id: msg.id,
          sender: msg.sender === 'system' ? 'system' : 'other',
          type: msg.type || 'text',
          content: msg.content,
          time: new Date(msg.createdAt),
          images: msg.imageCount || msg.images,
        }])
        setTyping(false)
      }
    })

    socket.on('typing', (data: any) => {
      if (data.conversationId === id) {
        setTyping(data.isTyping)
      }
    })

    return () => { socket.disconnect() }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleSend = useCallback(async (text?: string) => {
    const content = (text || input).trim()
    if (!content || !id) return
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      type: 'text',
      content,
      time: new Date(),
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setShowQuickReplies(false)
    try {
      await api.post(`/conversations/${id}/messages`, { content })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }, [input, id])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const lastTime = useRef<Date | null>(null)

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-topbar">
          <div className="chat-topbar-inner">
            <button className="chat-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <div className="chat-top-user">
              <span className="cht-avatar">👤</span>
              <div className="cht-info">
                <span className="cht-name">加载中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      {/* ── Top Bar ── */}
      <div className="chat-topbar">
        <div className="chat-topbar-inner">
          <button className="chat-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-top-user">
            <span className="cht-avatar">{meta.avatar}</span>
            <div className="cht-info">
              <span className="cht-name">{meta.name}</span>
              <span className="cht-status">
                {meta.online ? <><span className="cht-online-dot" /> 在线</> : '离线'}
              </span>
            </div>
          </div>
          <div className="cht-order-status">{meta.orderStatus}</div>
          <div className="cht-actions">
            <button className="cht-btn" onClick={() => alert('拨打电话')}><Phone size={18} /></button>
            <button className="cht-btn" onClick={() => alert('更多')}><MoreVertical size={18} /></button>
          </div>
        </div>
      </div>

      {/* ── Scroll to bottom button ── */}
      <button className="chat-scroll-btn" onClick={scrollToBottom}>
        <ChevronDown size={18} />
      </button>

      {/* ── Message List ── */}
      <div className="chat-body" ref={listRef}>
        <div className="chat-messages">
          {messages.map((msg, i) => {
            const prev = i > 0 ? messages[i - 1] : undefined
            const showTime = shouldShowTime(msg, prev)
            const isSameSender = prev && prev.sender === msg.sender && !showTime
            if (showTime) lastTime.current = msg.time

            return (
              <div key={msg.id}>
                {showTime && <div className="chat-time">{formatMsgTime(msg.time)}</div>}

                {msg.type === 'system' ? (
                  <div className="chat-msg-system">
                    <div className="cms-content">{msg.content}</div>
                  </div>
                ) : (
                  <div className={`chat-msg ${msg.sender === 'me' ? 'msg-me' : 'msg-other'}`}>
                    {msg.sender === 'other' && !isSameSender && (
                      <span className="cm-avatar">{meta.avatar}</span>
                    )}
                    {msg.sender === 'other' && isSameSender && <div className="cm-avatar-spacer" />}
                    <div className={`cm-bubble-wrap ${!isSameSender && msg.sender === 'other' ? 'with-avatar' : ''}`}>
                      {msg.type === 'image' ? (
                        <div className="cm-image">
                          <div className="cmi-placeholder">
                            <ImageIcon size={24} />
                            <span>{msg.images || 1}张图片</span>
                          </div>
                          <span className="cmi-label">{msg.content}</span>
                        </div>
                      ) : (
                        <div className={`cm-bubble ${msg.sender === 'me' ? 'bubble-me' : 'bubble-other'}`}>
                          {msg.content}
                        </div>
                      )}
                      <span className="cm-time-inline">{formatMsgTime(msg.time)}</span>
                    </div>
                    {msg.sender === 'me' && (
                      <span className="cm-status">
                        {i === messages.length - 1 ? <CheckCheck size={14} /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Typing indicator */}
          {typing && (
            <div className="chat-msg msg-other">
              <span className="cm-avatar">{meta.avatar}</span>
              <div className="cm-bubble-wrap with-avatar">
                <div className="cm-typing">
                  <span className="cm-typing-dot" /><span className="cm-typing-dot" /><span className="cm-typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="chat-input-area">
        {showQuickReplies && (
          <div className="chat-quick-replies">
            {quickReplies.map(q => (
              <button key={q} className="cqr-btn" onClick={() => { handleSend(q); setShowQuickReplies(false) }}>
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <button className="cir-btn" onClick={() => alert('选择附件')}><Paperclip size={20} /></button>
          <button className="cir-btn" onClick={() => alert('选择图片')}><ImageIcon size={20} /></button>
          <div className="cir-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="cir-input"
              placeholder="输入消息..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="cir-btn" onClick={() => setShowQuickReplies(!showQuickReplies)}><Smile size={20} /></button>
          </div>
          <button
            className={`cir-send ${input.trim() ? 'active' : ''}`}
            disabled={!input.trim()}
            onClick={() => handleSend()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        .chat-page {
          display: flex; flex-direction: column; height: 100vh;
          background: var(--color-bg); overflow: hidden;
        }

        /* Top Bar */
        .chat-topbar {
          flex-shrink: 0; background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);
          z-index: 10;
        }
        .chat-topbar-inner {
          display: flex; align-items: center; height: 60px; padding: 0 12px; gap: 8px;
        }
        .chat-back {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-secondary); transition: all 0.25s;
        }
        .chat-back:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }

        .chat-top-user { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .cht-avatar { font-size: 28px; flex-shrink: 0; }
        .cht-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .cht-name { font-size: 14px; font-weight: 700; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cht-status {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--color-text-muted);
        }
        .cht-online-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-secondary); }

        .cht-order-status {
          font-size: 11px; font-weight: 500; color: var(--color-primary);
          padding: 3px 10px; border-radius: 100px;
          background: var(--color-primary-light); white-space: nowrap;
          display: none;
        }

        .cht-actions { display: flex; gap: 2px; }
        .cht-btn {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-secondary); transition: all 0.25s;
        }
        .cht-btn:hover { background: rgba(0,0,0,0.04); color: var(--color-text); }

        /* Scroll button */
        .chat-scroll-btn {
          position: fixed; bottom: 72px; right: 20px; z-index: 5;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.9); color: var(--color-text-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        .chat-scroll-btn:hover { background: #fff; color: var(--color-text); }

        /* Messages */
        .chat-body {
          flex: 1; overflow-y: auto; padding: 16px 12px;
          scroll-behavior: smooth;
        }
        .chat-messages { max-width: 720px; margin: 0 auto; }

        .chat-time {
          text-align: center; font-size: 11px; color: var(--color-text-muted);
          margin: 16px 0; position: relative;
        }
        .chat-time::before, .chat-time::after {
          content: ''; position: absolute; top: 50%; width: 30%;
          height: 1px; background: var(--color-border);
        }
        .chat-time::before { left: 0; }
        .chat-time::after { right: 0; }

        .chat-msg-system { display: flex; justify-content: center; margin: 12px 0; }
        .cms-content {
          padding: 6px 16px; border-radius: 100px;
          background: rgba(0,0,0,0.04); color: var(--color-text-muted);
          font-size: 12px; text-align: center; max-width: 80%;
        }

        .chat-msg {
          display: flex; align-items: flex-end; gap: 8px;
          margin-bottom: 4px; animation: fadeIn 0.3s ease;
        }
        .chat-msg.msg-me { justify-content: flex-end; }

        .cm-avatar { font-size: 28px; flex-shrink: 0; align-self: flex-end; }
        .cm-avatar-spacer { width: 28px; flex-shrink: 0; }

        .cm-bubble-wrap {
          display: flex; flex-direction: column; gap: 2px;
          max-width: 70%;
        }
        .cm-bubble-wrap.with-avatar { max-width: calc(70% - 36px); }

        .cm-bubble {
          padding: 10px 14px; font-size: 14px; line-height: 1.6;
          word-break: break-word; white-space: pre-wrap;
        }
        .bubble-me {
          background: var(--color-primary-gradient); color: #fff;
          border-radius: 16px 4px 16px 16px;
        }
        .bubble-other {
          background: #fff; color: var(--color-text);
          border-radius: 4px 16px 16px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .cm-time-inline {
          font-size: 10px; color: var(--color-text-muted);
          padding: 0 4px;
        }
        .msg-me .cm-time-inline { text-align: right; }
        .msg-other .cm-time-inline { text-align: left; }

        .cm-status {
          color: var(--color-primary); flex-shrink: 0;
          align-self: flex-end; margin-bottom: 2px;
        }

        .cm-image { display: flex; flex-direction: column; gap: 6px; }
        .cmi-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; width: 160px; height: 120px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, #E8F4F8, #F0EBFF);
          color: var(--color-text-muted); font-size: 12px; cursor: pointer;
          transition: transform 0.25s;
        }
        .cmi-placeholder:hover { transform: scale(1.02); }
        .cmi-label { font-size: 13px; color: var(--color-text-secondary); }

        .cm-typing {
          display: flex; gap: 4px; padding: 12px 16px; align-items: center;
        }
        .cm-typing-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--color-text-muted);
          animation: typingBounce 1.4s ease infinite;
        }
        .cm-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .cm-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .chat-input-area {
          flex-shrink: 0; background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px); border-top: 1px solid var(--color-border);
          padding: 8px 12px;
        }

        .chat-quick-replies {
          display: flex; gap: 8px; padding: 8px 0; overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .cqr-btn {
          flex-shrink: 0; padding: 6px 14px; border-radius: 100px;
          font-size: 13px; font-weight: 500; color: var(--color-primary);
          background: var(--color-primary-light); white-space: nowrap;
          transition: all 0.25s;
        }
        .cqr-btn:hover { background: var(--color-primary); color: #fff; }

        .chat-input-row {
          display: flex; align-items: center; gap: 8px;
        }
        .cir-btn {
          width: 36px; height: 36px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-muted); flex-shrink: 0;
          transition: all 0.25s;
        }
        .cir-btn:hover { color: var(--color-primary); background: var(--color-primary-light); }

        .cir-input-wrap {
          flex: 1; display: flex; align-items: center;
          background: var(--color-bg); border-radius: var(--radius-xl);
          border: 1px solid var(--color-border); padding: 0 4px;
          transition: border-color 0.25s;
        }
        .cir-input-wrap:focus-within { border-color: var(--color-primary); }
        .cir-input {
          flex: 1; height: 38px; border: none; background: transparent;
          padding: 0 8px; font-size: 14px; color: var(--color-text);
          outline: none; font-family: var(--font);
        }
        .cir-input::placeholder { color: var(--color-text-muted); }

        .cir-send {
          width: 38px; height: 38px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          background: var(--color-border); color: #fff; flex-shrink: 0;
          transition: all 0.25s;
        }
        .cir-send.active { background: var(--color-primary-gradient); }
        .cir-send.active:hover { box-shadow: 0 3px 10px rgba(255,125,90,0.3); }
        .cir-send:disabled { cursor: not-allowed; }

        @media (max-width: 480px) {
          .cm-bubble-wrap { max-width: 85%; }
          .cm-bubble-wrap.with-avatar { max-width: calc(85% - 36px); }
          .cht-order-status { display: block; }
        }
      `}</style>
    </div>
  )
}
