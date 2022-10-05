import Book from '../book'

import db from '../../utils/db/dbSingleton'
import constants from '../../constants'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await Book.deleteMany()
    await db.close()
})

describe('create book with new keyword', () => {
    it('should create the right default value', async () => {
        const book = new Book({
            title: 'test one',
        })
        await book.save()

        expect(book).toMatchObject({
            desc: '',
            cover: constants.defaultBookCover,
            hidden: true,
        })
    })

    it('Add cdn domain to cover field when book is serialized to json ', async () => {
        const book = new Book({
            title: 'test book',
            cover: 'cover_key',
            category: { key: 'test_category' },
        })
        await book.save()

        const bookFound = await Book.findOne({ title: 'test book' })
        expect(bookFound?.toJSON()).toHaveProperty('cover')
        expect(bookFound?.toJSON().cover).toEqual(
            'https://cdn.test.com/cover_key',
        )
    })
})
