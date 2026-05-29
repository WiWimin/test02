import { Router } from 'express'
import {
  getDashboard, listUsers, banUser, listSittersByAdmin, approveSitter, rejectSitter,
  listOrdersByAdmin, getFinanceStats, getSettings, updateSettings,
  listAdmins, createAdmin, deleteAdmin,
  listBanners, createBanner, updateBanner, deleteBanner,
  listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  listFaqs, createFaq, updateFaq, deleteFaq,
} from '../controllers/admin'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/role'

const router = Router()

router.use(auth, requireRole('admin'))

router.get('/dashboard', getDashboard)

router.get('/users', listUsers)
router.put('/users/:id/ban', banUser)

router.get('/sitters', listSittersByAdmin)
router.put('/sitters/:id/approve', approveSitter)
router.put('/sitters/:id/reject', rejectSitter)

router.get('/orders', listOrdersByAdmin)

router.get('/finance', getFinanceStats)

router.get('/settings', getSettings)
router.put('/settings', updateSettings)

router.get('/admins', listAdmins)
router.post('/admins', createAdmin)
router.delete('/admins/:id', deleteAdmin)

router.get('/banners', listBanners)
router.post('/banners', createBanner)
router.put('/banners/:id', updateBanner)
router.delete('/banners/:id', deleteBanner)

router.get('/announcements', listAnnouncements)
router.post('/announcements', createAnnouncement)
router.put('/announcements/:id', updateAnnouncement)
router.delete('/announcements/:id', deleteAnnouncement)

router.get('/faqs', listFaqs)
router.post('/faqs', createFaq)
router.put('/faqs/:id', updateFaq)
router.delete('/faqs/:id', deleteFaq)

export default router
