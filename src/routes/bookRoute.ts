import { Router } from 'express'
import {
    getBooks,
    getBookContent,
    updateBook,
    addBooks,
} from '@/controllers/bookController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router.route('/books').get(getBooks)
router.route('/books/:id/contents').get(getBookContent)
router.route('/books/:bookId').patch(auth, authEditorOrAdmin, updateBook)
router.route('/books').post(auth, authEditorOrAdmin, addBooks)

export default router
