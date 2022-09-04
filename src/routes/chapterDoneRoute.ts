import { Router } from 'express'
import {
    addChapterDone,
    getChapterDone,
    deleteChapterDone,
} from '@/controllers/chapterDoneController'
import { auth } from '@/middleware/auth'

const router = Router()

router
    .route('/chapterDone/:bookId')
    .get(auth, getChapterDone)
    .delete(auth, deleteChapterDone)
    .post(auth, addChapterDone)

export default router
