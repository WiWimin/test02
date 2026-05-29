import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { success, fail } from '../utils/response'
import prisma from '../utils/prisma'

export async function listSitters(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { category, keyword, priceMin, priceMax, minRating, sortBy, page = '1', pageSize = '20' } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)
    const where: any = { status: 'active' }

    if (category && category !== '全部') {
      where.services = { some: { category, status: 'active' } }
    }

    let sitters = await prisma.sitterProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        services: { where: { status: 'active' }, select: { id: true, name: true, price: true, duration: true, icon: true, category: true } },
        certs: { where: { status: 'verified' }, select: { label: true } },
      },
    })

    sitters = sitters.filter(s => {
      if (keyword) {
        const kw = keyword.toLowerCase()
        const nameMatch = s.user.name.toLowerCase().includes(kw)
        const tagMatch = s.services.some(svc => svc.name.toLowerCase().includes(kw))
        if (!nameMatch && !tagMatch) return false
      }
      if (priceMin || priceMax) {
        const minPrice = s.services.length > 0 ? Math.min(...s.services.map(sv => sv.price)) : 0
        if (priceMin && minPrice < parseFloat(priceMin)) return false
        if (priceMax && minPrice > parseFloat(priceMax)) return false
      }
      if (minRating && s.rating < parseFloat(minRating)) return false
      return true
    })

    const total = sitters.length

    if (sortBy === 'price') sitters.sort((a, b) => (Math.min(...a.services.map(s => s.price)) || 0) - (Math.min(...b.services.map(s => s.price)) || 0))
    else if (sortBy === 'rating') sitters.sort((a, b) => b.rating - a.rating)
    else sitters.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0))

    const paged = sitters.slice((p - 1) * ps, p * ps)

    success(res, {
      items: paged.map(s => ({
        id: s.user.id,
        name: s.user.name,
        avatar: s.user.avatar,
        rating: s.rating,
        reviews: s.total_orders,
        price: s.services.length > 0 ? Math.min(...s.services.map(sv => sv.price)) : 0,
        tags: [...new Set(s.services.map(sv => sv.name))],
        level: s.level,
        online: s.online,
        badges: s.certs.map(c => c.label),
      })),
      total, page: p, pageSize: ps,
    })
  } catch (err) { next(err) }
}

export async function getSitterDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sitter = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        sitter_profile: {
          include: {
            services: { where: { status: 'active' } },
            certs: { where: { status: 'verified' } },
            areas: true,
          },
        },
      },
    })
    if (!sitter || !sitter.sitter_profile) return fail(res, 'NOT_FOUND', '服务者不存在', 404)

    const reviews = await prisma.review.findMany({
      where: { sitter_id: sitter.id },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: { owner: { select: { name: true, avatar: true } } },
    })

    success(res, {
      id: sitter.id,
      name: sitter.name,
      avatar: sitter.avatar,
      rating: sitter.sitter_profile.rating,
      reviews: sitter.sitter_profile.total_orders,
      badges: sitter.sitter_profile.certs.map(c => c.label),
      desc: sitter.sitter_profile.bio,
      services: sitter.sitter_profile.services,
      areas: sitter.sitter_profile.areas.map(a => a.area),
      level: sitter.sitter_profile.level,
      online: sitter.sitter_profile.online,
      reviewList: reviews.map(r => ({
        user: r.owner.name,
        avatar: r.owner.avatar,
        rating: r.rating,
        text: r.text,
        date: r.created_at.toISOString().slice(0, 10),
        images: r.images ? r.images.split(',').filter(Boolean).length : 0,
      })),
    })
  } catch (err) { next(err) }
}

export async function getSitterReviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', pageSize = '10' } = req.query as any
    const p = parseInt(page), ps = parseInt(pageSize)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { sitter_id: req.params.id },
        orderBy: { created_at: 'desc' },
        skip: (p - 1) * ps, take: ps,
        include: { owner: { select: { name: true, avatar: true } } },
      }),
      prisma.review.count({ where: { sitter_id: req.params.id } }),
    ])

    success(res, {
      items: reviews.map(r => ({
        id: r.id,
        user: r.owner.name,
        avatar: r.owner.avatar,
        rating: r.rating,
        on_time: r.on_time,
        attitude: r.attitude,
        professional: r.professional,
        text: r.text,
        date: r.created_at.toISOString().slice(0, 10),
        images: r.images ? r.images.split(',').filter(Boolean).length : 0,
      })),
      total, page: p, pageSize: ps,
    })
  } catch (err) { next(err) }
}

export async function toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { owner_id_sitter_id: { owner_id: req.user!.id, sitter_id: req.params.id } },
    })
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return success(res, { favorited: false })
    }
    await prisma.favorite.create({ data: { owner_id: req.user!.id, sitter_id: req.params.id } })
    success(res, { favorited: true })
  } catch (err) { next(err) }
}

export async function listFavorites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { owner_id: req.user!.id },
      include: {
        sitter: {
          include: {
            sitter_profile: { include: { services: { where: { status: 'active' } } } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })
    success(res, favorites.map(f => ({
      id: f.sitter.id,
      name: f.sitter.name,
      avatar: f.sitter.avatar,
      level: f.sitter.sitter_profile?.level || 1,
      score: f.sitter.sitter_profile?.rating || 0,
      orders: f.sitter.sitter_profile?.total_orders || 0,
      tags: f.sitter.sitter_profile?.services.map(s => s.name).slice(0, 3) || [],
      price: f.sitter.sitter_profile ? Math.min(...(f.sitter.sitter_profile.services.map(s => s.price) || [0])) : 0,
    })))
  } catch (err) { next(err) }
}

export async function submitApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.sitterProfile.findUnique({ where: { user_id: req.user!.id } })
    if (!profile) return fail(res, 'NOT_FOUND', '请先注册为服务者', 400)

    const { name, phone, city, wechat, bio, certs, areas, max_distance, workday_start, workday_end, weekend_start, weekend_end } = req.body

    await prisma.user.update({ where: { id: req.user!.id }, data: { name, phone } })
    await prisma.sitterProfile.update({
      where: { user_id: req.user!.id },
      data: { bio, city, wechat, max_distance, workday_start, workday_end, weekend_start, weekend_end, status: 'pending' },
    })

    await prisma.sitterCert.deleteMany({ where: { sitter_id: req.user!.id } })
    for (const c of certs) {
      await prisma.sitterCert.create({
        data: { sitter_id: req.user!.id, label: c.label, required: c.required, file_url: c.uploaded ? `${c.label}.jpg` : null, status: c.uploaded ? 'verified' : 'missing' },
      })
    }

    await prisma.sitterArea.deleteMany({ where: { sitter_id: req.user!.id } })
    if (areas.length > 0) {
      await prisma.sitterArea.createMany({ data: areas.map((a: string) => ({ sitter_id: req.user!.id, area: a })) })
    }

    success(res, { message: '申请已提交' })
  } catch (err) { next(err) }
}

export async function getApplicationStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.sitterProfile.findUnique({ where: { user_id: req.user!.id } })
    if (!profile) return fail(res, 'NOT_FOUND', '未找到申请记录', 404)
    success(res, { status: profile.status, rejected_reason: profile.rejected_reason })
  } catch (err) { next(err) }
}
