import { Request, Response, NextFunction } from 'express'
import { fail } from '../utils/response'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err)
  if (err.code === 'P2002') {
    console.error('[Prisma P2002]', JSON.stringify(err.meta))
    return fail(res, 'DUPLICATE', '数据已存在', 409, err.meta)
  }
  if (err.code === 'P2025') {
    return fail(res, 'NOT_FOUND', '数据不存在', 404)
  }
  fail(res, 'INTERNAL_ERROR', err.message || '服务器内部错误', 500)
}
