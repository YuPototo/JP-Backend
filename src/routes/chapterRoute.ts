import { Router } from 'express'
import { getChapter, updateChapter } from '@/controllers/chapterController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router
    .route('/chapters/:chapterId')
    .get(getChapter)
    .patch(auth, authEditorOrAdmin, updateChapter)

export default router
