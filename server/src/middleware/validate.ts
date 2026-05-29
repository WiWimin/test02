import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { fail } from '../utils/response'

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const details = result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
      return fail(res, 'VALIDATION_ERROR', '参数校验失败', 400, details)
    }
    req[source] = result.data
    next()
  }
}
