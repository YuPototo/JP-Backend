import { Router } from 'express'

import { createOrder } from '@/controllers/orderController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/orders').post(auth, createOrder)

export default router
