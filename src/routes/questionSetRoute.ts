import { Router } from 'express'
import { getBooks } from '@/controllers/bookController'

const router = Router()

router.route('/questionSets/:id').get(getBooks)

export default router
