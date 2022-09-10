import { Router } from 'express'
import { getNotebooks } from '@/controllers/notebookController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/notebooks').get(auth, getNotebooks)

export default router
