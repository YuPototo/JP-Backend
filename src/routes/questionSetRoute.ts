import { Router } from 'express'
import {
    getQuestionSet,
    addQuestionSet,
    updateQuestionSet,
} from '@/controllers/questionSetController'
import { auth, authEditorOrAdmin, optionalAuth } from '@/middleware/auth'

const router = Router()

router
    .route('/questionSets/:questionSetId')
    .get(optionalAuth, getQuestionSet)
    .patch(auth, authEditorOrAdmin, updateQuestionSet)
router.route('/questionSets').post(auth, authEditorOrAdmin, addQuestionSet)

export default router
