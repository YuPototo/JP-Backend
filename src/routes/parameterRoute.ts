import { Router } from 'express'

import { getParameter } from '@/controllers/parameterController'

const router = Router()

router.route('/parameters/:key').get(getParameter)

export default router
