import { Router } from 'express'
import { createAdReward } from '@/controllers/adRewardController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/adRewards').post(auth, createAdReward)

export default router
