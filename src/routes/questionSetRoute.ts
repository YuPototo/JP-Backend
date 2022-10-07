import { Router } from 'express'
import {
    getQuestionSet,
    addQuestionSet,
} from '@/controllers/questionSetController'
import { auth, authEditorOrAdmin, optionalAuth } from '@/middleware/auth'

const router = Router()

router.route('/questionSets/:questionSetId').get(optionalAuth, getQuestionSet)
router.route('/questionSets').post(auth, authEditorOrAdmin, addQuestionSet)

export default router
