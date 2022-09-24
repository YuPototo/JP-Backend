import {
    createWrongRecord,
    getWrongRecords,
    deleteWrongRecord,
} from '@/controllers/wongRecordController'
import { auth } from '@/middleware/auth'
import { Router } from 'express'

const router = Router()

router.route('/wrongRecords').get(auth, getWrongRecords)
router
    .route('/wrongRecords/:questionSetId')
    .post(auth, createWrongRecord)
    .delete(auth, deleteWrongRecord)

export default router
