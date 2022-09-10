import { Router } from 'express'
import {
    getNotebooks,
    createNotebook,
    updateNotebook,
} from '@/controllers/notebookController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/notebooks').get(auth, getNotebooks).post(auth, createNotebook)
router.route('/notebooks/:notebookId').patch(auth, updateNotebook)

export default router
