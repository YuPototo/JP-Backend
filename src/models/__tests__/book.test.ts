import Book from '../book'

import db from '../../utils/db/dbSingleton'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await db.close()
})

describe('Book model', () => {
    beforeAll(async () => {
        const book = new Book({
            title: 'test book',
            cover: 'cover_key',
            category: { key: 'test_category' },
        })
        await book.save()
    })

    it('Add cdn domain to cover field when book is serialized to json ', async () => {
        const book = await Book.findOne({ title: 'test book' })
        expect(book?.toJSON()).toHaveProperty('cover')
        expect(book?.toJSON().cover).toEqual('https://cdn.test.com/cover_key')
    })

    it('should serialze to the right format', async () => {
        const book = await Book.findOne({ title: 'test book' })
        expect(book?.toJSON()).toMatchObject({
            id: expect.any(String),
            title: 'test book',
            desc: '',
            cover: expect.any(String),
            category: { key: 'test_category' },
            hidden: expect.any(Boolean),
        })
    })
})
