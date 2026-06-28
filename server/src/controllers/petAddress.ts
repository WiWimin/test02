import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function listPets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pets = await prisma.pet.findMany({ where: { owner_id: req.user!.id }, orderBy: { created_at: 'desc' } })
    success(res, pets)
  } catch (err) { next(err) }
}

export async function createPet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pet = await prisma.pet.create({ data: { ...req.body, owner_id: req.user!.id } })
    success(res, pet, 201)
  } catch (err) { next(err) }
}

export async function updatePet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.pet.findFirst({ where: { id: req.params.id, owner_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '宠物不存在', 404)
    const pet = await prisma.pet.update({ where: { id: req.params.id }, data: req.body })
    success(res, pet)
  } catch (err) { next(err) }
}

export async function deletePet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.pet.findFirst({ where: { id: req.params.id, owner_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '宠物不存在', 404)
    await prisma.pet.delete({ where: { id: req.params.id } })
    success(res, { message: '已删除' })
  } catch (err) { next(err) }
}

export async function listAddresses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const addresses = await prisma.address.findMany({ where: { user_id: req.user!.id, deleted_at: null }, orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }] })
    success(res, addresses)
  } catch (err) { next(err) }
}

export async function createAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const address = req.body.is_default
      ? await prisma.$transaction(async (tx) => {
          await tx.address.updateMany({ where: { user_id: req.user!.id }, data: { is_default: false } })
          return tx.address.create({ data: { ...req.body, user_id: req.user!.id } })
        })
      : await prisma.address.create({ data: { ...req.body, user_id: req.user!.id } })
    success(res, address, 201)
  } catch (err) { next(err) }
}

export async function updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, user_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '地址不存在', 404)
    const address = req.body.is_default
      ? await prisma.$transaction(async (tx) => {
          await tx.address.updateMany({ where: { user_id: req.user!.id }, data: { is_default: false } })
          return tx.address.update({ where: { id: req.params.id }, data: req.body })
        })
      : await prisma.address.update({ where: { id: req.params.id }, data: req.body })
    success(res, address)
  } catch (err) { next(err) }
}

export async function deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, user_id: req.user!.id } })
    if (!existing) return fail(res, 'NOT_FOUND', '地址不存在', 404)
    await prisma.address.update({ where: { id: req.params.id }, data: { deleted_at: new Date() } })
    success(res, { message: '已删除' })
  } catch (err) { next(err) }
}

export async function setDefaultAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.$transaction([
      prisma.address.updateMany({ where: { user_id: req.user!.id }, data: { is_default: false } }),
      prisma.address.update({ where: { id: req.params.id }, data: { is_default: true } }),
    ])
    success(res, { message: '已设为默认' })
  } catch (err) { next(err) }
}
