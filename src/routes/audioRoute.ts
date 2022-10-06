import { Router } from 'express'
import {
    addAudio,
    uploadAudioErrorHandler,
} from '@/controllers/audioController'
import { auth, authEditorOrAdmin } from '@/middleware/auth'

const router = Router()

router
    .route('/audios')
    .post(auth, authEditorOrAdmin, uploadAudioErrorHandler, addAudio)

export default router
