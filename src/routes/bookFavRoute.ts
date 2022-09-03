import { Router } from 'express'
import {
    addBookFav,
    deleteBookFav,
    getBookFavs,
    checkIsBookFav,
} from '@/controllers/bookFavController'
import { auth } from '@/middleware/auth'

const router = Router()

router
    .route('/bookFav/:bookId')
    .post(auth, addBookFav)
    .delete(auth, deleteBookFav)
    .get(auth, checkIsBookFav)

router.route('/bookFav').get(auth, getBookFavs)

export default router
