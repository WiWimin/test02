import { Router } from 'express'
import { listMyServices, createService, updateService, toggleService, deleteService } from '../controllers/service'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import { serviceSchema } from '../validators'

const router = Router()

router.get('/', auth, requireRole('sitter'), listMyServices)
router.post('/', auth, requireRole('sitter'), validate(serviceSchema), createService)
router.put('/:id', auth, requireRole('sitter'), validate(serviceSchema), updateService)
router.put('/:id/toggle', auth, requireRole('sitter'), toggleService)
router.delete('/:id', auth, requireRole('sitter'), deleteService)

export default router
