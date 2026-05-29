import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { fail } from '../utils/response'
import prisma from '../utils/prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    name: string
    phone: string
    status: string
  }
}

export async function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'UNAUTHORIZED', '未登录', 401)
  }

  const token = header.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    return fail(res, 'TOKEN_EXPIRED', '令牌已过期，请重新登录', 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, name: true, phone: true, status: true },
  })

  if (!user || user.status === 'banned') {
    return fail(res, 'USER_BANNED', '账号已被禁用', 403)
  }

  req.user = user
  next()
}
