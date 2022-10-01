import { Router } from 'express'
import { updateSection } from '@/controllers/sectionController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router
    .route('/sections/:sectionId')
    .patch(auth, authEditorOrAdmin, updateSection)

export default router
