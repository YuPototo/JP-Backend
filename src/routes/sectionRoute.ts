import { Router } from 'express'
import { updateSection, addSection } from '@/controllers/sectionController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router
    .route('/sections/:sectionId')
    .patch(auth, authEditorOrAdmin, updateSection)

router.route('/sections').post(auth, authEditorOrAdmin, addSection)

export default router
