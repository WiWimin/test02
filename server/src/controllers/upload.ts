import { Request, Response, NextFunction } from 'express'
import { success, fail } from '../utils/response'
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve(__dirname, '../../uploads')

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, 'NO_FILE', '请选择文件', 400)
    const url = `/uploads/${req.file.filename}`
    success(res, { url, filename: req.file.filename, size: req.file.size })
  } catch (err) { next(err) }
}

export async function uploadFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) return fail(res, 'NO_FILE', '请选择文件', 400)
    const urls = files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename, size: f.size }))
    success(res, urls)
  } catch (err) { next(err) }
}

export async function deleteUploadedFile(req: Request, res: Response, next: NextFunction) {
  try {
    const filename = path.basename(req.params.filename)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return fail(res, 'BAD_REQUEST', '无效的文件名', 400)
    const filepath = path.join(uploadDir, filename)
    try { await fs.promises.unlink(filepath) } catch (err: any) { if (err.code === 'ENOENT') return fail(res, 'NOT_FOUND', '文件不存在', 404); throw err }
    success(res, { message: '已删除' })
  } catch (err) { next(err) }
}
