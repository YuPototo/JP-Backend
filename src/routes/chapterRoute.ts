import { Router } from 'express'
import { getChapter } from '@/controllers/chapterController'

const router = Router()

router.route('/chapters/:chapterId').get(getChapter)

export default router
