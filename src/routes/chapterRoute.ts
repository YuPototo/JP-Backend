import { Router } from 'express'
import {
    getChapter,
    updateChapter,
    addChapter,
} from '@/controllers/chapterController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router
    .route('/chapters/:chapterId')
    .get(getChapter)
    .patch(auth, authEditorOrAdmin, updateChapter)

router.route('/chapters').post(auth, authEditorOrAdmin, addChapter)

export default router
