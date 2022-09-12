import { Router } from 'express'
import {
    addQuestionSetFav,
    deleteQuestionSetFav,
} from '@/controllers/questionSetFavController'
import { auth } from '@/middleware/auth'

const router = Router()

router
    .route('/notebooks/:notebookId/questionSets/:questionSetId')
    .post(auth, addQuestionSetFav)

router
    .route('/notebooks/questionSets/:questionSetId')
    .delete(auth, deleteQuestionSetFav)

export default router
