import { Router } from 'express'
import {
    wxLoginHandler,
    reduceQuizChanceHandler,
    getUserInfoHandler,
    adminLoginHandler,
    addMemberHandler,
} from '@/controllers/userController'
import { auth, authAdmin } from '@/middleware/auth'

const router = Router()

router.route('/users/login/wx/:loginPlatform').post(wxLoginHandler)
router.route('/users/login/admin').post(adminLoginHandler)
router.route('/users/reduceQuizChance').put(auth, reduceQuizChanceHandler)
router.route('/users').get(auth, getUserInfoHandler)
router.route('/users/addMember').post(auth, authAdmin, addMemberHandler)

export default router
