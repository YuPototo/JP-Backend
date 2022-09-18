import { Router } from 'express'
import {
    getNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    getNotebookQuestionSets,
} from '@/controllers/notebookController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/notebooks').get(auth, getNotebooks).post(auth, createNotebook)
router
    .route('/notebooks/:notebookId')
    .patch(auth, updateNotebook)
    .delete(auth, deleteNotebook)

router
    .route('/notebooks/:notebookId/questionSets')
    .get(auth, getNotebookQuestionSets)

export default router
