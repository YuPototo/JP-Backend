import type { RequestHandler } from 'express'
import Book from '@/models/book'

import logger from '@/utils/logger/logger'

export const getBooks: RequestHandler = async (req, res, next) => {
    try {
        const book = new Book({
            title: 'n1 阅读',
            categories: [
                {
                    topKey: 'jlpt',
                    children: [
                        {
                            metaType: 'jlptLevel',
                            keys: ['n1'],
                        },
                        {
                            metaType: 'jlptLevel',
                            keys: ['n1'],
                        },
                    ],
                },
            ],
        })
        await book.save()
        const books = await Book.find()

        res.json({ books })
    } catch (err) {
        next(err)
    }
}
