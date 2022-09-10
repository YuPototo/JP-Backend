import { Router } from 'express'
import { getNotebooks, createNotebook } from '@/controllers/notebookController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/notebooks').get(auth, getNotebooks).post(auth, createNotebook)

export default router
