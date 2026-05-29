import { Response } from 'express'

export function success(res: Response, data: any, status = 200) {
  return res.status(status).json({ ok: true, data })
}

export function fail(res: Response, code: string, message: string, status = 400, details?: any) {
  return res.status(status).json({ ok: false, error: { code, message, details } })
}

export function paginated(res: Response, data: any[], total: number, page: number, pageSize: number) {
  return res.json({ ok: true, data, total, page, pageSize })
}
