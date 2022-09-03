import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import Book, { IBook } from '@/models/book'
import { logger } from '@/utils/logger/winstonLogger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import redis from '@/utils/redis/redisSingleton'
import { getErrorMessage } from '@/utils/errorUtil/errorHandler'

export const getBooks: RequestHandler = async (req, res, next) => {
    let books: IBook[]

    try {
        const jsonBooks = await redis.get('books')
        if (jsonBooks) {
            books = JSON.parse(jsonBooks) // 需要 check books 的格式吗？
            return res.json({ books })
        }
    } catch (err) {
        logger.error('getBooks: Redis erorr ' + getErrorMessage(err))
    }

    try {
        books = await Book.find()
        res.json({ books })
    } catch (err) {
        return next(err)
    }

    try {
        const jsonBooks = JSON.stringify(books)
        await redis.set('books', jsonBooks, 7 * 24 * 60 * 60) // 7 days
    } catch (err) {
        logger.error('getBooks: Redis erorr ' + getErrorMessage(err))
    }
}

export const getBookContent: RequestHandler = async (req, res, next) => {
    const bookId = req.params.id

    if (!isMongoId(bookId)) {
        res.status(400).json({ message: 'id 不是合法的 mongoId' })
        logger.error(`id 不是合法的 mongoId ${bookId} `, addReqMetaData(req))
        return
    }

    let book: IBook | null
    try {
        book = await Book.findById(bookId).populate({
            path: 'sections',
            populate: { path: 'chapters' },
        })
    } catch (err) {
        next(err)
        return
    }

    if (!book) {
        res.status(404).json({ message: `找不到练习册 ${bookId}` })
        logger.error(`找不到练习册 ${bookId}`, addReqMetaData(req))
        return
    }

    const sections = book.sections
    res.json({ sections })
    return
}
