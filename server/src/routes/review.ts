import { Router } from 'express'
import { createReview } from '../controllers/review'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import { reviewSchema } from '../validators'

const router = Router()

router.post('/orders/:id/review', auth, requireRole('owner'), validate(reviewSchema), createReview)

export default router
