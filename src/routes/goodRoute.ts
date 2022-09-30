import { Router } from 'express'

import { getGoodsHandler } from '@/controllers/goodController'

const router = Router()

router.route('/goods').get(getGoodsHandler)

export default router
