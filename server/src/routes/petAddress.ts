import { Router } from 'express'
import { listPets, createPet, updatePet, deletePet, listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/petAddress'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { petSchema, addressSchema } from '../validators'

const router = Router()

router.get('/pets', auth, listPets)
router.post('/pets', auth, validate(petSchema), createPet)
router.put('/pets/:id', auth, validate(petSchema), updatePet)
router.delete('/pets/:id', auth, deletePet)

router.get('/addresses', auth, listAddresses)
router.post('/addresses', auth, validate(addressSchema), createAddress)
router.put('/addresses/:id', auth, validate(addressSchema), updateAddress)
router.delete('/addresses/:id', auth, deleteAddress)
router.put('/addresses/:id/default', auth, setDefaultAddress)

export default router
