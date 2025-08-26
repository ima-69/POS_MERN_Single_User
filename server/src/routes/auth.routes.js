import { Router } from 'express'
import { registerCtrl, loginCtrl, meCtrl, logoutCtrl } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const router = Router()
router.post('/register', registerCtrl)
router.post('/login', loginCtrl)
router.get('/me', auth, meCtrl)
router.post('/logout', logoutCtrl)

export default router