import { Router } from 'express'
import { getQuestionSet } from '@/controllers/questionSetController'

const router = Router()

router.route('/questionSets/:questionSetId').get(getQuestionSet)

export default router
