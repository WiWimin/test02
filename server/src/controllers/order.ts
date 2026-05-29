import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

const statusTransitions: Record<string, string[]> = {
  pending_pay: ['cancelled', 'pending_accept'],
  pending_accept: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: ['reviewed', 'refunding'],
  refunding: ['refunded', 'disputed'],
  cancelled: [],
  reviewed: [],
  disputed: [],
  refunded: [],
}

function canTransition(from: string, to: string): boolean {
  return (statusTransitions[from] || []).includes(to)
}

async function addTimeline(orderId: string, status: string, label: string) {
  await prisma.orderTimeline.create({ data: { order_id: orderId, status, label } })
}

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sitter_id, pet_ids, address_id, service_ids, service_date, service_time, note } = req.body

    const sitter = await prisma.user.findFirst({ where: { id: sitter_id, role: 'sitter', status: 'active' }, include: { sitter_profile: true } })
    if (!sitter || !sitter.sitter_profile || sitter.sitter_profile.status !== 'approved') return fail(res, 'BAD_REQUEST', '服务者不存在或未通过审核', 400)

    const [userPets, userAddr] = await Promise.all([
      prisma.pet.findMany({ where: { id: { in: pet_ids }, owner_id: req.user!.id }, select: { id: true } }),
      prisma.address.findFirst({ where: { id: address_id, user_id: req.user!.id }, select: { id: true } }),
    ])
    if (userPets.length !== pet_ids.length) return fail(res, 'BAD_REQUEST', '宠物信息不匹配', 400)
    if (!userAddr) return fail(res, 'BAD_REQUEST', '地址信息不匹配', 400)

    const services = await prisma.service.findMany({ where: { id: { in: service_ids } } })
    const total = services.reduce((sum, s) => sum + s.price, 0)

    const order = await prisma.$transaction(async (tx) => {
      const count = await tx.order.count()
      const order_no = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(4, '0')}`

      const config = await tx.systemConfig.findFirst()
      const acceptTimeout = config?.accept_timeout || 15

      const created = await tx.order.create({
        data: {
          order_no,
          owner_id: req.user!.id,
          sitter_id,
          address_id,
          status: 'pending_pay',
          total,
          note: note || '',
          service_date: new Date(service_date),
          service_time,
          accept_deadline: new Date(Date.now() + acceptTimeout * 60 * 1000),
          services: { create: services.map(s => ({ service_id: s.id, name: s.name, price: s.price, duration: s.duration })) },
          pets: { create: pet_ids.map((pid: string) => ({ pet_id: pid })) },
        },
        include: { services: true, pets: true },
      })

      await tx.orderTimeline.create({ data: { order_id: created.id, status: 'created', label: '订单已创建' } })
      const ownerName = req.user!.name
      await tx.notification.create({ data: { user_id: sitter_id, type: 'new_order', title: '新订单', content: `${ownerName} 创建了新订单 #${order_no}`, link: `/sitter/orders/${created.id}` } })

      return created
    })

    success(res, order, 201)
  } catch (err) { next(err) }
}

export async function listOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, status, search, page = '1', pageSize = '20' } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)

    const where: any = role === 'sitter' ? { sitter_id: req.user!.id } : { owner_id: req.user!.id }
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { order_no: { contains: search } },
        { services: { some: { name: { contains: search } } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (p - 1) * ps, take: ps,
        include: {
          services: true,
          pets: { include: { pet: { select: { name: true, avatar: true, type: true } } } },
          owner: { select: { id: true, name: true, phone: true, avatar: true } },
          sitter: { select: { id: true, name: true, phone: true, avatar: true } },
          timeline: { orderBy: { created_at: 'asc' } },
        },
      }),
      prisma.order.count({ where }),
    ])

    success(res, { items: orders, total, page: p, pageSize: ps })
  } catch (err) { next(err) }
}

export async function getOrderDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        services: true,
        pets: { include: { pet: true } },
        owner: { select: { id: true, name: true, phone: true, avatar: true } },
        sitter: { select: { id: true, name: true, phone: true, avatar: true } },
        timeline: { orderBy: { created_at: 'asc' } },
        payment: true,
        review: true,
        address: true,
      },
    })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.owner_id !== req.user!.id && order.sitter_id !== req.user!.id) {
      return fail(res, 'FORBIDDEN', '无权查看此订单', 403)
    }
    success(res, order)
  } catch (err) { next(err) }
}

export async function payOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.owner_id !== req.user!.id) return fail(res, 'FORBIDDEN', '无权操作', 403)
    if (!canTransition(order.status, 'pending_accept')) return fail(res, 'INVALID_STATUS', '当前状态不可支付')

    await prisma.order.update({ where: { id: order.id }, data: { status: 'pending_accept', paid_at: new Date() } })
    await prisma.payment.create({ data: { order_id: order.id, amount: order.total, status: 'success', paid_at: new Date() } })
    await addTimeline(order.id, 'paid', '支付成功')

    await prisma.notification.create({ data: { user_id: order.sitter_id, type: 'order_paid', title: '订单已支付', content: `订单 #${order.order_no} 已支付 ¥${order.total}`, link: `/sitter/orders/${order.id}` } })

    success(res, { message: '支付成功' })
  } catch (err) { next(err) }
}

export async function cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.owner_id !== req.user!.id && order.sitter_id !== req.user!.id) return fail(res, 'FORBIDDEN', '无权操作', 403)
    if (!canTransition(order.status, 'cancelled')) return fail(res, 'INVALID_STATUS', '当前状态不可取消')

    const { reason } = req.body || {}
    await prisma.order.update({ where: { id: order.id }, data: { status: 'cancelled', cancel_reason: reason || '用户取消' } })
    await addTimeline(order.id, 'cancelled', `订单已取消${reason ? `：${reason}` : ''}`)

    success(res, { message: '订单已取消' })
  } catch (err) { next(err) }
}

export async function acceptOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.sitter_id !== req.user!.id) return fail(res, 'FORBIDDEN', '无权操作', 403)
    if (!canTransition(order.status, 'accepted')) return fail(res, 'INVALID_STATUS', '当前状态不可接单')

    if (order.accept_deadline && new Date() > order.accept_deadline) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'cancelled', cancel_reason: '接单超时' } })
      return fail(res, 'TIMEOUT', '接单超时，订单已自动取消', 400)
    }

    await prisma.order.update({ where: { id: order.id }, data: { status: 'accepted', accepted_at: new Date() } })
    await addTimeline(order.id, 'accepted', '服务者已接单')

    await prisma.notification.create({ data: { user_id: order.owner_id, type: 'order_accepted', title: '已接单', content: `${req.user!.name} 已接单`, link: `/home/owner/orders/${order.id}` } })

    success(res, { message: '已接单' })
  } catch (err) { next(err) }
}

export async function startService(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.sitter_id !== req.user!.id) return fail(res, 'FORBIDDEN', '无权操作', 403)
    if (!canTransition(order.status, 'in_progress')) return fail(res, 'INVALID_STATUS', '当前状态不可开始服务')

    const { lat, lng } = req.body || {}
    await prisma.order.update({ where: { id: order.id }, data: { status: 'in_progress', started_at: new Date() } })
    await prisma.serviceSession.create({ data: { order_id: order.id, start_lat: lat || null, start_lng: lng || null, start_at: new Date() } })
    await addTimeline(order.id, 'started', '服务开始')

    await prisma.notification.create({ data: { user_id: order.owner_id, type: 'service_started', title: '服务已开始', content: `${req.user!.name} 已开始服务`, link: `/home/owner/orders/${order.id}` } })

    success(res, { message: '服务已开始' })
  } catch (err) { next(err) }
}

export async function completeService(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) return fail(res, 'NOT_FOUND', '订单不存在', 404)
    if (order.sitter_id !== req.user!.id) return fail(res, 'FORBIDDEN', '无权操作', 403)
    if (!canTransition(order.status, 'completed')) return fail(res, 'INVALID_STATUS', '当前状态不可完成')

    await prisma.order.update({ where: { id: order.id }, data: { status: 'completed', completed_at: new Date() } })
    await prisma.serviceSession.updateMany({ where: { order_id: order.id }, data: { end_at: new Date() } })
    await addTimeline(order.id, 'completed', '服务已完成')

    await prisma.sitterProfile.update({ where: { user_id: order.sitter_id }, data: { total_orders: { increment: 1 } } })

    const config = await prisma.systemConfig.findFirst()
    const rate = config?.commission_rate || 15
    const commission = order.total * rate / 100
    await prisma.transaction.create({ data: { sitter_id: order.sitter_id, order_id: order.id, amount: order.total, commission, payout: order.total - commission, rate, settled: true } })

    await prisma.notification.create({ data: { user_id: order.owner_id, type: 'service_completed', title: '服务已完成', content: `订单 #${order.order_no} 已完成，去评价吧`, link: `/home/owner/orders/${order.id}` } })

    success(res, { message: '服务已完成' })
  } catch (err) { next(err) }
}

export async function getTodaySchedule(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const orders = await prisma.order.findMany({
      where: {
        [req.user!.role === 'sitter' ? 'sitter_id' : 'owner_id']: req.user!.id,
        service_date: { gte: today, lt: tomorrow },
        status: { in: ['accepted', 'in_progress', 'completed'] },
      },
      include: {
        services: true,
        pets: { include: { pet: { select: { name: true, avatar: true } } } },
        owner: { select: { name: true, avatar: true } },
        sitter: { select: { name: true, avatar: true } },
      },
      orderBy: { service_time: 'asc' },
    })
    success(res, orders)
  } catch (err) { next(err) }
}
