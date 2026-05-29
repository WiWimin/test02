import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function createReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.owner_id !== req.user!.id) return fail(res, 'FORBIDDEN', '无权评价', 403)
    if (order.status !== 'completed') return fail(res, 'INVALID_STATUS', '订单未完成，不可评价')

    const existing = await prisma.review.findUnique({ where: { order_id: order.id } })
    if (existing) return fail(res, 'ALREADY_REVIEWED', '已评价过此订单')

    const { rating, on_time, attitude, professional, text, is_anonymous, images } = req.body

    const review = await prisma.review.create({
      data: {
        order_id: order.id,
        owner_id: req.user!.id,
        sitter_id: order.sitter_id,
        rating, on_time: on_time || rating, attitude: attitude || rating, professional: professional || rating,
        text: text || '',
        is_anonymous: is_anonymous || false,
        images: images || '',
      },
    })

    await prisma.order.update({ where: { id: order.id }, data: { status: 'reviewed' } })
    await prisma.orderTimeline.create({ data: { order_id: order.id, status: 'reviewed', label: '已评价' } })

    const stats = await prisma.review.aggregate({ where: { sitter_id: order.sitter_id }, _avg: { rating: true } })
    const count = await prisma.review.count({ where: { sitter_id: order.sitter_id } })
    await prisma.sitterProfile.update({
      where: { user_id: order.sitter_id },
      data: { rating: stats._avg.rating || 0 },
    })

    success(res, review, 201)
  } catch (err) { next(err) }
}
