import { Router } from 'express'

import {
    createOrder,
    receiveNoticeHandler,
} from '@/controllers/orderController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/orders').post(auth, createOrder)
router.route('/orders/notify').post(receiveNoticeHandler)

export default router
