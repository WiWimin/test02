import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayOrders, todayRevenue, newUsers, pendingSitters, orders, revenueData, pendings] = await Promise.all([
      prisma.order.count({ where: { created_at: { gte: today, lt: tomorrow } } }),
      prisma.order.aggregate({ where: { status: 'completed', paid_at: { gte: today, lt: tomorrow } }, _sum: { total: true } }),
      prisma.user.count({ where: { created_at: { gte: today, lt: tomorrow } } }),
      prisma.sitterProfile.count({ where: { status: 'pending' } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { created_at: { gte: new Date(Date.now() - 7 * 86400000) } },
        select: { total: true, created_at: true, status: true },
        orderBy: { created_at: 'asc' },
      }),
      Promise.all([
        prisma.order.count({ where: { status: 'refunding' } }),
        prisma.sitterProfile.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'disputed' } }),
      ]),
    ])

    const chartData: { day: string; value: number }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - 6 + i)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      const val = revenueData.filter(o => {
        const od = new Date(o.created_at)
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
      }).reduce((s, o) => s + (o.status === 'completed' ? (o.total || 0) : 0), 0)
      chartData.push({ day: key, value: Math.round(val) })
    }

    success(res, {
      stats: {
        todayOrders, todayRevenue: todayRevenue._sum.total || 0,
        newUsers, pendingSitters, totalOrders: orders,
      },
      chartData,
      pendingItems: [
        { type: 'refund', label: '退款申请待审核', count: pendings[0], severity: 'medium' },
        { type: 'sitter', label: '服务者入驻待审核', count: pendings[1], severity: 'medium' },
        { type: 'complaint', label: '纠纷投诉待处理', count: pendings[2], severity: 'high' },
      ].filter(p => p.count > 0),
    })
  } catch (err) { next(err) }
}

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', pageSize = '20', search, role, status } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)
    const where: any = {}
    if (role && role !== 'all') where.role = role
    if (status && status !== 'all') where.status = status
    if (search) where.OR = [{ name: { contains: search } }, { phone: { contains: search } }]

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, orderBy: { created_at: 'desc' }, skip: (p - 1) * ps, take: ps,
        select: { id: true, name: true, phone: true, role: true, status: true, avatar: true, created_at: true, _count: { select: { pets: true, orders_as_owner: true } } },
      }),
      prisma.user.count({ where }),
    ])
    success(res, { items: users, total, page: p, pageSize: ps })
  } catch (err) { next(err) }
}

export async function banUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return fail(res, 'NOT_FOUND', '用户不存在', 404)
    const newStatus = user.status === 'banned' ? 'active' : 'banned'
    await prisma.user.update({ where: { id: req.params.id }, data: { status: newStatus } })
    success(res, { status: newStatus, message: newStatus === 'banned' ? '已封禁' : '已解封' })
  } catch (err) { next(err) }
}

export async function listSittersByAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', pageSize = '20', status } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)
    const where: any = {}
    if (status && status !== 'all') where.status = status

    const [sitters, total] = await Promise.all([
      prisma.sitterProfile.findMany({
        where, orderBy: { created_at: 'desc' }, skip: (p - 1) * ps, take: ps,
        include: { user: { select: { id: true, name: true, phone: true, avatar: true } }, certs: true },
      }),
      prisma.sitterProfile.count({ where }),
    ])
    success(res, {
      items: sitters.map(s => ({
        id: s.user.id, name: s.user.name, avatar: s.user.avatar, phone: s.user.phone,
        rating: s.rating, orders: s.total_orders, level: s.level, status: s.status,
        certifications: s.certs.filter(c => c.status === 'verified').map(c => c.label),
        joinDate: s.created_at?.toISOString().slice(0, 10), city: s.city, intro: s.bio,
        pending: s.status === 'pending',
      })), total, page: p, pageSize: ps,
    })
  } catch (err) { next(err) }
}

export async function approveSitter(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.sitterProfile.findUnique({ where: { user_id: req.params.id } })
    if (!profile) return fail(res, 'NOT_FOUND', '服务者不存在', 404)
    await prisma.sitterProfile.update({ where: { user_id: req.params.id }, data: { status: 'active' } })
    success(res, { message: '审核通过' })
  } catch (err) { next(err) }
}

export async function rejectSitter(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { reason } = req.body
    await prisma.sitterProfile.update({
      where: { user_id: req.params.id },
      data: { status: 'rejected', rejected_reason: reason || '审核未通过' },
    })
    success(res, { message: '已拒绝' })
  } catch (err) { next(err) }
}

export async function listOrdersByAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', pageSize = '20', status, search } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)
    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (search) where.OR = [{ order_no: { contains: search } }]

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, orderBy: { created_at: 'desc' }, skip: (p - 1) * ps, take: ps,
        include: { owner: { select: { name: true } }, sitter: { select: { name: true } }, services: true, payment: true },
      }),
      prisma.order.count({ where }),
    ])
    success(res, {
      items: orders.map(o => ({
        id: o.id, orderNo: o.order_no, user: o.owner.name, sitter: o.sitter.name,
        service: o.services[0]?.name || '', amount: o.total, status: o.status,
        time: o.created_at.toISOString().slice(0, 16).replace('T', ' '),
        payment: o.payment?.method || '', address: '',
      })), total, page: p, pageSize: ps,
    })
  } catch (err) { next(err) }
}

export async function getFinanceStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await prisma.transaction.findMany({
      where: { type: 'income', settled: true },
      orderBy: { created_at: 'asc' },
    })

    const monthlyMap: Record<string, any> = {}
    for (const t of tx) {
      const key = `${t.created_at.getFullYear()}-${String(t.created_at.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, commission: 0, payout: 0, orders: 0 }
      monthlyMap[key].revenue += t.amount
      monthlyMap[key].commission += t.commission
      monthlyMap[key].payout += (t.payout || 0)
      monthlyMap[key].orders += 1
    }

    const monthlyData = Object.entries(monthlyMap).map(([month, d]) => ({ month, ...d }))

    const recentTx = await prisma.transaction.findMany({
      orderBy: { created_at: 'desc' }, take: 20,
      include: { sitter: { select: { name: true } } },
    })

    success(res, {
      summary: {
        totalRevenue: tx.reduce((s, t) => s + t.amount, 0),
        totalCommission: tx.reduce((s, t) => s + t.commission, 0),
        totalOrders: tx.length,
      },
      monthlyData,
      recentTransactions: recentTx.map(t => ({
        id: t.id, sitter: t.sitter.name, amount: t.amount,
        commission: t.commission, payout: t.payout, status: t.settled ? 'settled' : 'pending',
        date: t.created_at.toISOString().slice(0, 10),
      })),
    })
  } catch (err) { next(err) }
}

export async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let config = await prisma.systemConfig.findFirst()
    if (!config) {
      config = await prisma.systemConfig.create({ data: {} })
    }
    success(res, config)
  } catch (err) { next(err) }
}

export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let config = await prisma.systemConfig.findFirst()
    if (!config) {
      config = await prisma.systemConfig.create({ data: req.body })
    } else {
      config = await prisma.systemConfig.update({ where: { id: config.id }, data: req.body })
    }
    success(res, config)
  } catch (err) { next(err) }
}

export async function listAdmins(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const admins = await prisma.adminUser.findMany({
      include: { user: { select: { id: true, name: true, account: true, avatar: true } } },
    })
    success(res, admins.map(a => ({
      id: a.id, name: a.user.name, account: a.user.account, role: a.role,
      lastLogin: a.created_at.toISOString().slice(0, 16).replace('T', ' '), avatar: a.user.avatar,
    })))
  } catch (err) { next(err) }
}

export async function createAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, account, password, role } = req.body
    const password_hash = await (await import('../utils/password')).hashPassword(password)
    const user = await prisma.user.create({
      data: { name, account, phone: `admin_${Date.now()}`, password_hash, role: 'admin' },
    })
    await prisma.adminUser.create({ data: { user_id: user.id, role: role || 'admin' } })
    success(res, { message: '管理员已创建' }, 201)
  } catch (err) { next(err) }
}
export async function deleteAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const admin = await prisma.adminUser.findUnique({ where: { user_id: req.params.id } })
    if (!admin) return fail(res, 'NOT_FOUND', '管理员不存在', 404)
    await prisma.adminUser.delete({ where: { user_id: req.params.id } })
    success(res, { message: '管理员已移除' })
  } catch (err) { next(err) }
}

export async function listBanners(req: AuthRequest, res: Response, next: NextFunction) {
  try { const items = await prisma.banner.findMany({ orderBy: { sort: 'asc' } }); success(res, items) }
  catch (err) { next(err) }
}
export async function createBanner(req: AuthRequest, res: Response, next: NextFunction) {
  try { const item = await prisma.banner.create({ data: req.body }); success(res, item, 201) }
  catch (err) { next(err) }
}
export async function updateBanner(req: AuthRequest, res: Response, next: NextFunction) {
  try { const item = await prisma.banner.update({ where: { id: req.params.id }, data: req.body }); success(res, item) }
  catch (err) { next(err) }
}
export async function deleteBanner(req: AuthRequest, res: Response, next: NextFunction) {
  try { await prisma.banner.delete({ where: { id: req.params.id } }); success(res, { message: '已删除' }) }
  catch (err) { next(err) }
}

export async function listAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
  try { const items = await prisma.announcement.findMany({ orderBy: [{ pinned: 'desc' }, { created_at: 'desc' }] }); success(res, items) }
  catch (err) { next(err) }
}
export async function createAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
  try { const item = await prisma.announcement.create({ data: req.body }); success(res, item, 201) }
  catch (err) { next(err) }
}
export async function updateAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
  try { const item = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body }); success(res, item) }
  catch (err) { next(err) }
}
export async function deleteAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
  try { await prisma.announcement.delete({ where: { id: req.params.id } }); success(res, { message: '已删除' }) }
  catch (err) { next(err) }
}

export async function listFaqs(req: AuthRequest, res: Response, next: NextFunction) {
  try { const items = await prisma.faq.findMany({ where: { status: 'published' }, orderBy: { sort: 'asc' } }); success(res, items) }
  catch (err) { next(err) }
}
export async function createFaq(req: AuthRequest, res: Response, next: NextFunction) {
  try { const item = await prisma.faq.create({ data: req.body }); success(res, item, 201) }
  catch (err) { next(err) }
}
export async function updateFaq(req: AuthRequest, res: Response, next: NextFunction) {
  try { const item = await prisma.faq.update({ where: { id: req.params.id }, data: req.body }); success(res, item) }
  catch (err) { next(err) }
}
export async function deleteFaq(req: AuthRequest, res: Response, next: NextFunction) {
  try { await prisma.faq.delete({ where: { id: req.params.id } }); success(res, { message: '已删除' }) }
  catch (err) { next(err) }
}
