import { Server as SocketServer, Socket } from 'socket.io'
import prisma from '../utils/prisma'

export function setupSocket(io: SocketServer) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('未登录'))
    try {
      const { verifyToken } = await import('../utils/jwt')
      const payload = verifyToken(token)
      if (!payload) return next(new Error('令牌无效'))
      ;(socket as any).userId = payload.userId
      next()
    } catch { next(new Error('鉴权失败')) }
  })

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId
    console.log(`[Socket] User ${userId} connected`)
    socket.join(`user:${userId}`)

    socket.on('join:conversation', (convId: string) => {
      socket.join(`conv:${convId}`)
    })

    socket.on('leave:conversation', (convId: string) => {
      socket.leave(`conv:${convId}`)
    })

    socket.on('message:send', async (data: { conversationId: string; content: string; type?: string; images?: string }, callback) => {
      try {
        const conv = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
          include: { participants: { select: { user_id: true } } },
        })
        if (!conv || !conv.participants.some(p => p.user_id === userId)) return callback?.({ error: '无权操作' })

        const msg = await prisma.message.create({
          data: {
            conversation_id: data.conversationId,
            sender_id: userId,
            content: data.content,
            type: data.type || 'text',
            images: data.images || '',
          },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        })
        await prisma.conversation.update({ where: { id: data.conversationId }, data: { updated_at: new Date() } })

        io.to(`conv:${data.conversationId}`).emit('message:new', msg)
        callback?.({ ok: true, data: msg })
      } catch (err: any) {
        callback?.({ error: err.message })
      }
    })

    socket.on('typing', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('typing', { userId, conversationId: data.conversationId })
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`)
    })
  })
}
