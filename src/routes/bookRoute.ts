import { Router } from 'express'
import { getBooks, getBookContent } from '@/controllers/bookController'

const router = Router()

router.route('/books').get(getBooks)
router.route('/books/:id/contents').get(getBookContent)

export default router
