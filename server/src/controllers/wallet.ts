import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function getWalletStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const profile = await prisma.sitterProfile.findUnique({ where: { user_id: req.user!.id } })

    const [todayTx, weekTx, monthTx, todayCount] = await Promise.all([
      prisma.transaction.aggregate({ where: { sitter_id: req.user!.id, type: 'income', settled: true, created_at: { gte: today } }, _sum: { payout: true } }),
      prisma.transaction.aggregate({ where: { sitter_id: req.user!.id, type: 'income', settled: true, created_at: { gte: weekStart } }, _sum: { payout: true } }),
      prisma.transaction.aggregate({ where: { sitter_id: req.user!.id, type: 'income', settled: true, created_at: { gte: monthStart } }, _sum: { payout: true } }),
      prisma.transaction.count({ where: { sitter_id: req.user!.id, created_at: { gte: today } } }),
    ])

    const transactions = await prisma.transaction.findMany({
      where: { sitter_id: req.user!.id, type: 'income' },
      orderBy: { created_at: 'desc' },
      take: 20,
    })

    const weeklyData = await prisma.transaction.findMany({
      where: { sitter_id: req.user!.id, type: 'income', settled: true, created_at: { gte: weekStart } },
      orderBy: { created_at: 'asc' },
    })

    const trend = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      const val = weeklyData.filter(t => {
        const td = new Date(t.created_at)
        return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
      }).reduce((sum, t) => sum + (t.payout || 0), 0)
      trend.push({ day: key, amount: val })
    }

    success(res, {
      balance: profile?.balance || 0,
      todayIncome: todayTx._sum.payout || 0,
      weekIncome: weekTx._sum.payout || 0,
      monthIncome: monthTx._sum.payout || 0,
      totalIncome: (profile?.balance || 0) + (todayTx._sum.payout || 0),
      todayOrders: todayCount,
      weekOrders: 0,
      monthOrders: 0,
      totalOrders: profile?.total_orders || 0,
      transactions: transactions.map(t => ({
        id: t.id, amount: t.amount, type: t.type,
        description: t.type === 'income' ? '服务收入' : '提现',
        createdAt: t.created_at,
      })),
      weeklyData: trend,
    })
  } catch (err) { next(err) }
}

export async function getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', pageSize = '20', type } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)
    const where: any = { sitter_id: req.user!.id }
    if (type) where.type = type

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (p - 1) * ps, take: ps,
      }),
      prisma.transaction.count({ where }),
    ])
    success(res, { items: transactions, total, page: p, pageSize: ps })
  } catch (err) { next(err) }
}

export async function getTrend(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { period = 'week' } = req.query as any
    const days = period === 'month' ? 30 : 7
    const start = new Date()
    start.setDate(start.getDate() - days)

    const tx = await prisma.transaction.findMany({
      where: { sitter_id: req.user!.id, type: 'income', settled: true, created_at: { gte: start } },
      orderBy: { created_at: 'asc' },
    })

    const trend: { day: string; value: number }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      const val = tx.filter(t => {
        const td = new Date(t.created_at)
        return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
      }).reduce((sum, t) => sum + (t.payout || 0), 0)
      trend.push({ day: key, value: val })
    }
    success(res, trend)
  } catch (err) { next(err) }
}

export async function withdraw(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { amount } = req.body

    const result = await prisma.sitterProfile.updateMany({
      where: { user_id: req.user!.id, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    })
    if (result.count === 0) return fail(res, 'INSUFFICIENT_BALANCE', '余额不足')

    const tx = await prisma.transaction.create({
      data: { sitter_id: req.user!.id, type: 'withdraw', amount: -amount, commission: 0, payout: 0, settled: true },
    })
    success(res, tx, 201)
  } catch (err) { next(err) }
}
