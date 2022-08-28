import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import Book, { IBook } from '@/models/book'
import { logger } from '@/utils/logger/winstonLogger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'

export const getBooks: RequestHandler = async (req, res, next) => {
    try {
        const books = await Book.find()
        res.json({ books })
    } catch (err) {
        next(err)
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
