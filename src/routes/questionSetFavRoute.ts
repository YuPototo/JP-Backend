import { Router } from 'express'
import {
    addQuestionSetFav,
    deleteQuestionSetFav,
} from '@/controllers/questionSetFavController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/questionSetFav').post(auth, addQuestionSetFav)

router
    .route('/questionSetFav/:questionSetId')
    .delete(auth, deleteQuestionSetFav)

export default router
