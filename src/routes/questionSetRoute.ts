import { Router } from 'express'
import { getQuestionSet } from '@/controllers/questionSetController'
import { optionalAuth } from '@/middleware/auth'

const router = Router()

router.route('/questionSets/:questionSetId').get(optionalAuth, getQuestionSet)

export default router
