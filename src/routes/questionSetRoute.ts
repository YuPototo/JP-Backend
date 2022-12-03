import { Router } from 'express'
import {
    getQuestionSet,
    addQuestionSet,
    updateQuestionSet,
    uploadImageErrorHandler,
    uploadQuestionSetImage,
} from '@/controllers/questionSetController'
import { auth, authEditorOrAdmin, optionalAuth } from '@/middleware/auth'

const router = Router()

router
    .route('/questionSets/:questionSetId')
    .get(optionalAuth, getQuestionSet)
    .patch(auth, authEditorOrAdmin, updateQuestionSet)
router.route('/questionSets').post(auth, authEditorOrAdmin, addQuestionSet)
router
    .route('/questionSets/uploadImage')
    .post(
        auth,
        authEditorOrAdmin,
        uploadImageErrorHandler,
        uploadQuestionSetImage,
    )

export default router
