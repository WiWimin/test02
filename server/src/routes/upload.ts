import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { uploadFile, uploadFiles, deleteUploadedFile } from '../controllers/upload'
import { auth } from '../middleware/auth'
import { fail } from '../utils/response'

const uploadDir = path.resolve(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('不支持的文件类型'))
  },
})

const router = Router()

router.post('/', auth, (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err) => {
    if (err) return fail(res, 'UPLOAD_ERROR', err.message, 400)
    next()
  })
}, uploadFile)

router.post('/multiple', auth, (req: Request, res: Response, next: NextFunction) => {
  upload.array('files', 9)(req, res, (err) => {
    if (err) return fail(res, 'UPLOAD_ERROR', err.message, 400)
    next()
  })
}, uploadFiles)

router.delete('/:filename', auth, deleteUploadedFile)

export default router
