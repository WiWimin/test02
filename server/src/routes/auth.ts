import { Router } from 'express'
import { register, login, getMe, updateProfile, changePassword, sendCode, forgotPassword, resetPassword } from '../controllers/auth'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, sendCodeSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.get('/me', auth, getMe)
router.put('/profile', auth, validate(updateProfileSchema), updateProfile)
router.put('/password', auth, validate(changePasswordSchema), changePassword)
router.post('/send-code', validate(sendCodeSchema), sendCode)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

export default router
