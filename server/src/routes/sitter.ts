import { Router } from 'express'
import { listSitters, getSitterDetail, getSitterReviews, toggleFavorite, listFavorites, submitApplication, getApplicationStatus } from '../controllers/sitter'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import { sitterApplicationSchema } from '../validators'

const router = Router()

router.get('/', listSitters)
router.get('/favorites', auth, requireRole('owner'), listFavorites)
router.post('/:id/favorite', auth, requireRole('owner'), toggleFavorite)
router.get('/:id', getSitterDetail)
router.get('/:id/reviews', getSitterReviews)
router.post('/application', auth, requireRole('sitter'), validate(sitterApplicationSchema), submitApplication)
router.get('/application/status', auth, requireRole('sitter'), getApplicationStatus)

export default router
