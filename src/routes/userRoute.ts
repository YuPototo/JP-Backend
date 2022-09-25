import { Router } from 'express'
import {
    wxLoginHandler,
    reduceQuizChanceHandler,
    getUserInfoHandler,
} from '@/controllers/userController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/users/login/wx/:loginPlatform').post(wxLoginHandler)
router.route('/users/reduceQuizChance').put(auth, reduceQuizChanceHandler)
router.route('/users').get(auth, getUserInfoHandler)

export default router
