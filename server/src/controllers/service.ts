import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function listMyServices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const services = await prisma.service.findMany({
      where: { sitter_id: req.user!.id },
      orderBy: { completed_orders: 'desc' },
    })
    success(res, services)
  } catch (err) { next(err) }
}

export async function createService(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.sitterProfile.findUnique({ where: { user_id: req.user!.id } })
    if (!profile) return fail(res, 'NOT_FOUND', '请先完成入驻', 400)

    const service = await prisma.service.create({ data: { ...req.body, sitter_id: req.user!.id } })
    success(res, service, 201)
  } catch (err) { next(err) }
}

export async function updateService(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.service.findFirst({ where: { id: req.params.id, sitter_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '服务不存在', 404)
    const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body })
    success(res, service)
  } catch (err) { next(err) }
}

export async function toggleService(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.service.findFirst({ where: { id: req.params.id, sitter_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '服务不存在', 404)
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { status: existing.status === 'active' ? 'inactive' : 'active' },
    })
    success(res, service)
  } catch (err) { next(err) }
}

export async function deleteService(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.service.findFirst({ where: { id: req.params.id, sitter_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '服务不存在', 404)
    await prisma.service.delete({ where: { id: req.params.id } })
    success(res, { message: '已删除' })
  } catch (err) { next(err) }
}
