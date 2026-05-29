import { Router } from 'express'
import { getWalletStats, getTransactions, getTrend, withdraw } from '../controllers/wallet'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import { withdrawSchema } from '../validators'

const router = Router()

router.get('/', auth, requireRole('sitter'), getWalletStats)
router.get('/transactions', auth, requireRole('sitter'), getTransactions)
router.get('/trend', auth, requireRole('sitter'), getTrend)
router.post('/withdraw', auth, requireRole('sitter'), validate(withdrawSchema), withdraw)

export default router
