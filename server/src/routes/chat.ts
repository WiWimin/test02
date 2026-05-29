import { Router } from 'express'
import { listConversations, getMessages, sendMessage, markRead, createConversation } from '../controllers/chat'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { messageSchema } from '../validators'

const router = Router()

router.get('/conversations', auth, listConversations)
router.post('/conversations', auth, createConversation)
router.get('/conversations/:id/messages', auth, getMessages)
router.post('/conversations/:id/messages', auth, validate(messageSchema), sendMessage)
router.put('/conversations/:id/read', auth, markRead)

export default router
