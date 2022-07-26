import { Router } from 'express'
import { getBooks } from '@/controllers/bookController'

const router = Router()

router.route('/books').get(getBooks)

export default router
