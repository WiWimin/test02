import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../utils/prisma'
import { hashPassword, comparePassword } from '../utils/password'
import { signToken } from '../utils/jwt'
import { success, fail } from '../utils/response'

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { phone, password, name, role } = req.body

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) return fail(res, 'PHONE_EXISTS', '该手机号已注册')

    const password_hash = await hashPassword(password)
    const count = await prisma.user.count()
    const prefix = role === 'sitter' ? 'S' : role === 'admin' ? 'A' : 'O'
    const account = `${prefix}${String(count + 1).padStart(6, '0')}`

    const createData: any = {
      phone, password_hash, name, role, account,
      status: 'active',
      sitter_status: role === 'sitter' ? 'pending' : undefined,
    }

    const user = await prisma.user.create({ data: createData })

    if (role === 'sitter') {
      await prisma.sitterProfile.create({ data: { user_id: user.id } })
      await prisma.userNotificationSettings.create({ data: { user_id: user.id } })
    }

    const token = signToken({ userId: user.id, role: user.role })
    success(res, {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar, account: user.account },
    }, 201)
  } catch (err) { next(err) }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { account, phone, password, loginMethod } = req.body
    let user
    if (loginMethod === 'phone') {
      user = await prisma.user.findUnique({ where: { phone } })
    } else {
      user = await prisma.user.findFirst({ where: { OR: [{ account }, { phone: account }] } })
    }

    if (!user) return fail(res, 'USER_NOT_FOUND', '用户不存在', 404)
    if (user.status === 'banned') return fail(res, 'BANNED', '账号已被禁用', 403)

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) return fail(res, 'WRONG_PASSWORD', '密码错误', 401)

    const token = signToken({ userId: user.id, role: user.role })
    success(res, {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar, account: user.account },
    })
  } catch (err) { next(err) }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, phone: true, role: true, avatar: true, account: true, status: true, sitter_status: true },
    })
    if (user?.role === 'sitter') {
      const profile = await prisma.sitterProfile.findUnique({ where: { user_id: user.id } })
      return success(res, { ...user, sitter_profile: profile })
    }
    success(res, user)
  } catch (err) { next(err) }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, avatar } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { ...(name !== undefined && { name }), ...(avatar !== undefined && { avatar }) },
      select: { id: true, name: true, phone: true, role: true, avatar: true },
    })
    success(res, user)
  } catch (err) { next(err) }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) return fail(res, 'NOT_FOUND', '用户不存在', 404)

    const valid = await comparePassword(oldPassword, user.password_hash)
    if (!valid) return fail(res, 'WRONG_PASSWORD', '原密码错误', 401)

    const password_hash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password_hash } })
    success(res, { message: '密码修改成功' })
  } catch (err) { next(err) }
}
