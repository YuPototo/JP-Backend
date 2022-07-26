import type { RequestHandler } from 'express'
import Book from '@/models/book'

import logger from '@/utils/logger/logger'

export const getBooks: RequestHandler = async (req, res, next) => {
    try {
        // const book = await new Book({
        //     name: 'c',
        //     category: [
        //         {
        //             top: new ObjectId('62dd03eba2d635610e322c0b'),
        //             children: [
        //                 {
        //                     metaType: 'jlptLevel',
        //                     categories: [
        //                         new ObjectId('62dd0485a2d635610e3eec77'),
        //                     ],
        //                 },
        //             ],
        //         },
        //     ],
        // })
        // await book.save()

        const books = await Book.find()
        //     .populate<PopulatedCategory>('category.top', 'key')
        //     .populate('category.children.categories', 'key')

        // const books = []
        // for (const bookDoc of bookDocs) {
        //     const bookOutput = {
        //         name: bookDoc.name,
        //         category: bookDoc.category.map((topCategory) => ({
        //             top: topCategory.top?.key,
        //             children: topCategory.children.map((subCategory) => ({
        //                 [subCategory.metaType]: subCategory.categories.map(
        //                     (el) => el.key
        //                 ),
        //             })),
        //         })),
        //     }
        //     books.push(bookOutput)
        // }

        res.json({ books })
        // res.json({ book })
    } catch (err) {
        next(err)
    }
}
