import { Router } from 'express'
import { wxLoginHandler } from '@/controllers/userController'

const router = Router()

router.route('/users/login/wx/:loginPlatform').post(wxLoginHandler)

export default router
