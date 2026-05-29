import { Router } from 'express'
import { createOrder, listOrders, getOrderDetail, payOrder, cancelOrder, acceptOrder, startService, completeService, getTodaySchedule } from '../controllers/order'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import { orderCreateSchema } from '../validators'

const router = Router()

router.post('/', auth, requireRole('owner'), validate(orderCreateSchema), createOrder)
router.get('/', auth, listOrders)
router.get('/today', auth, getTodaySchedule)
router.get('/:id', auth, getOrderDetail)
router.put('/:id/pay', auth, requireRole('owner'), payOrder)
router.put('/:id/cancel', auth, cancelOrder)
router.put('/:id/accept', auth, requireRole('sitter'), acceptOrder)
router.put('/:id/start', auth, requireRole('sitter'), startService)
router.put('/:id/complete', auth, requireRole('sitter'), completeService)

export default router
