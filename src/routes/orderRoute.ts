import { Router } from 'express'

import {
    createOrder,
    getOrder,
    receiveNoticeHandler,
} from '@/controllers/orderController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/orders').post(auth, createOrder).get(auth, getOrder)
router.route('/orders/notify').post(receiveNoticeHandler)

export default router
