import type { RequestHandler } from 'express'
import Book from '@/models/book'

export const getBooks: RequestHandler = async (req, res, next) => {
    try {
        const books = await Book.find()
        res.json({ books })
    } catch (err) {
        next(err)
    }
}
