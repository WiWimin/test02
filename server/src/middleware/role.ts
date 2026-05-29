import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { fail } from '../utils/response'

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'FORBIDDEN', '无操作权限', 403)
    }
    next()
  }
}
