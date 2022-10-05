import { Router } from 'express'
import {
    getBooks,
    getBookContent,
    updateBook,
    addBooks,
    updateBookCover,
    uploadCoverErrorHandler,
} from '@/controllers/bookController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router.route('/books').get(getBooks)
router.route('/books/:id/contents').get(getBookContent)
router.route('/books/:bookId').patch(auth, authEditorOrAdmin, updateBook)
router.route('/books').post(auth, authEditorOrAdmin, addBooks)
router
    .route('/books/:bookId/bookCover')
    .patch(auth, authEditorOrAdmin, uploadCoverErrorHandler, updateBookCover)

export default router
