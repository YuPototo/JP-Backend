import { Router } from 'express'
import {
    getBooks,
    getBookContent,
    updateBook,
} from '@/controllers/bookController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router.route('/books').get(getBooks)
router.route('/books/:id/contents').get(getBookContent)
router.route('/books/:bookId').patch(auth, authEditorOrAdmin, updateBook)

export default router
