import { Router } from 'express'
import { simpleTestController, createDummy } from '@/controllers/testController'

const router = Router()

router.route('/test/simpleTest').get(simpleTestController)
router.route('/test/dummies').post(createDummy)

export default router
