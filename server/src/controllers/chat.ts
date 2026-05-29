import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function listConversations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const convs = await prisma.conversation.findMany({
      where: { participants: { some: { user_id: req.user!.id } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        messages: { orderBy: { created_at: 'desc' }, take: 1 },
      },
      orderBy: { updated_at: 'desc' },
    })
    success(res, convs.map(c => ({
      id: c.id,
      order_id: c.order_id,
      participants: c.participants.map(p => p.user),
      lastMessage: c.messages[0] || null,
      unread: 0,
      updatedAt: c.updated_at,
    })))
  } catch (err) { next(err) }
}

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { participants: { select: { user_id: true } } },
    })
    if (!conv) return fail(res, 'NOT_FOUND', '会话不存在', 404)
    if (!conv.participants.some(p => p.user_id === req.user!.id)) return fail(res, 'FORBIDDEN', '无权访问', 403)

    const { before, limit = '50' } = req.query as any
    const l = parseInt(limit)
    const where: any = { conversation_id: req.params.id }
    if (before) where.created_at = { lt: new Date(before) }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: l,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })

    success(res, messages.reverse())
  } catch (err) { next(err) }
}

export async function sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { participants: { select: { user_id: true } } },
    })
    if (!conv) return fail(res, 'NOT_FOUND', '会话不存在', 404)
    if (!conv.participants.some(p => p.user_id === req.user!.id)) return fail(res, 'FORBIDDEN', '无权操作', 403)

    const { content, type, images } = req.body
    const msg = await prisma.message.create({
      data: { conversation_id: req.params.id, sender_id: req.user!.id, content, type: type || 'text', images: images || '' },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })

    await prisma.conversation.update({ where: { id: req.params.id }, data: { updated_at: new Date() } })

    const receiverId = conv.participants.find(p => p.user_id !== req.user!.id)?.user_id
    if (receiverId) {
      await prisma.notification.create({ data: { user_id: receiverId, type: 'chat', title: '新消息', content: `${req.user!.name}: ${content.slice(0, 50)}`, link: `/chat/${req.params.id}` } })
    }

    success(res, msg, 201)
  } catch (err) { next(err) }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.message.updateMany({
      where: { conversation_id: req.params.id, sender_id: { not: req.user!.id }, read: false },
      data: { read: true },
    })
    success(res, { message: '已读' })
  } catch (err) { next(err) }
}

export async function createConversation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { order_id, participant_id } = req.body
    const existing = order_id
      ? await prisma.conversation.findUnique({ where: { order_id } })
      : null
    if (existing) return success(res, existing)

    const conv = await prisma.conversation.create({
      data: {
        order_id: order_id || null,
        participants: {
          create: [
            { user_id: req.user!.id },
            { user_id: participant_id },
          ],
        },
      },
      include: { participants: { include: { user: { select: { id: true, name: true, avatar: true } } } } },
    })
    success(res, conv, 201)
  } catch (err) { next(err) }
}
