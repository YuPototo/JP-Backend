import type { RequestHandler } from 'express'
import BookFav from '@/models/bookFav'
import { logger } from '@/utils/logger/winstonLogger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import isMongoId from 'validator/lib/isMongoId'
import { MongoError } from 'mongodb'

export const addBookFav: RequestHandler = async (req, res, next) => {
    const bookId = req.params.bookId

    if (!isMongoId(bookId)) {
        const message = `${bookId} 不是合法的 mongoId`
        logger.error(message, addReqMetaData(req))
        return res.status(400).json({ message })
    }

    try {
        const bookFav = new BookFav({ user: req.user, book: bookId })
        await bookFav.save()
        return res.status(201).json({ message: 'success' })
    } catch (err) {
        if (err instanceof MongoError && err.code === 11000) {
            logger.warn('已经有这条书籍收藏记录了', addReqMetaData(req))
            return res.status(201).json({ message: 'success' })
        } else {
            return next(err)
        }
    }
}

export const deleteBookFav: RequestHandler = async (req, res, next) => {
    const bookId = req.params.bookId

    if (!isMongoId(bookId)) {
        const message = `${bookId} 不是合法的 mongoId`
        logger.error(message, addReqMetaData(req))
        return res.status(400).json({ message })
    }

    try {
        await BookFav.findOneAndDelete({
            user: req.user,
            book: bookId,
        })
        return res.status(200).json({ message: 'success' })
    } catch (err) {
        return next(err)
    }
}

export const getBookFavs: RequestHandler = async (req, res, next) => {
    try {
        const books = await BookFav.getBookIds(req.user.id)

        return res.status(200).json({ books })
    } catch (err) {
        return next(err)
    }
}

export const checkIsBookFav: RequestHandler = async (req, res, next) => {
    const bookId = req.params.bookId

    if (!isMongoId(bookId)) {
        const message = `${bookId} 不是合法的 mongoId`
        logger.error(message, addReqMetaData(req))
        return res.status(400).json({ message })
    }

    try {
        const bookFav = await BookFav.findOne({
            user: req.user,
            book: bookId,
        })

        return res.status(200).json({ isFav: !!bookFav })
    } catch (err) {
        return next(err)
    }
}
