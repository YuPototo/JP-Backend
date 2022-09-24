// todo: test redis cache

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import Book from '../../models/book'
import Section from '../../models/section'
import Chapter from '../../models/chapter'

// test setup

const createBooks = async () => {
    const category = { key: 'test_category' }
    const books = [
        {
            title: 'test book 1',
            level: 'beginner',
            cover: 'book_1.png',
            weight: 20,
            hidden: true,
            category,
        },
        {
            title: 'test book 2',
            level: 'n1',
            cover: 'book_2.png',
            weight: 10,
            hidden: true,
            category,
        },

        {
            title: 'test book 3',
            level: 'n1',
            cover: 'book_3.png',
            weight: 0,
            hidden: true,
            category,
        },
        {
            title: 'test book 4',
            level: 'n2',
            cover: 'book_4.png',
            hidden: false,
            category,
        },
    ]
    await Book.insertMany(books)
}

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await db.close()
})

describe('GET /books', () => {
    beforeAll(async () => {
        await createBooks()
    })

    afterAll(async () => {
        await Book.deleteMany()
    })

    it('should return 200', async () => {
        const res = await request(app).get('/api/v1/books')
        expect(res.statusCode).toBe(200)
    })

    it('should return books', async () => {
        const res = await request(app).get('/api/v1/books')
        expect(res.body).toHaveProperty('books')
    })

    it('should return all books', async () => {
        const res = await request(app).get('/api/v1/books')

        expect(res.body.books).toHaveLength(4)
    })

    it('should order books by weight, descending', async () => {
        const res = await request(app).get('/api/v1/books')

        const books = res.body.books
        const bookOne = books[0]
        const bookTwo = books[1]
        const bookThree = books[2]

        expect(bookOne.weight).toBeGreaterThan(bookTwo.weight)
        expect(bookTwo.weight).toBeGreaterThan(bookThree.weight)
    })

    it('should have all the fields needed', async () => {
        const res = await request(app).get('/api/v1/books')

        const books = res.body.books
        const bookOne = books[0]
        const bookTwo = books[1]

        const expectedBookShape = {
            id: expect.any(String),
            title: expect.any(String),
            desc: expect.any(String),
            cover: expect.any(String),
            category: expect.any(Object),
            hidden: expect.any(Boolean),
        }

        expect(bookOne).toMatchObject(expectedBookShape)
        expect(bookTwo).toMatchObject(expectedBookShape)
    })

    it('should add domain name for image assets', async () => {
        const res = await request(app).get('/api/v1/books')

        const books = res.body.books
        const bookOne = books[0]

        expect(bookOne.cover).toBe('https://cdn.test.com/book_1.png')
    })
})

describe('GET book contents', () => {
    beforeAll(async () => {
        const chapter_1_1 = new Chapter({
            title: 'chapter 1.1',
        })
        await chapter_1_1.save()

        const chapter_1_2 = new Chapter({
            title: 'chapter 1.2',
        })
        await chapter_1_2.save()

        const section_1 = new Section({
            title: 'section 1',
            chapters: [chapter_1_1.id, chapter_1_2.id],
        })
        await section_1.save()

        const section_2 = new Section({
            title: 'section 2',
        })
        await section_2.save()

        const book = new Book({
            title: 'test book 1',
            level: 'beginner',
            cover: 'book_1.png',
            weight: 20,
            hidden: true,
            category: { key: 'test_category' },
            sections: [section_1.id, section_2.id],
        })

        await book.save()
    })

    afterAll(async () => {
        await Book.deleteMany()
    })

    it('should return 400, when id is not valid mongo id', async () => {
        const id = 'abc'
        const res = await request(app).get(`/api/v1/books/${id}/contents`)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('id 不是合法的 mongoId')
    })

    it('should return 404, when book is not found', async () => {
        const id = '61502602e94950fbe7a0075d'
        const res = await request(app).get(`/api/v1/books/${id}/contents`)
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到练习册/)
    })

    it('should return 200 and book content', async () => {
        const book = await Book.findOne()
        const id = book!.id
        const res = await request(app).get(`/api/v1/books/${id}/contents`)
        expect(res.statusCode).toBe(200)

        expect(res.body).toHaveProperty('sections')
        expect(res.body.sections).toHaveLength(2)

        const section_1 = res.body.sections[0]
        expect(section_1).toMatchObject({
            title: 'section 1',
            id: expect.any(String),
        })

        expect(section_1).toHaveProperty('chapters')
        expect(section_1.chapters).toHaveLength(2)

        const chapter_1_1 = section_1.chapters[0]
        expect(chapter_1_1).toMatchObject({
            title: 'chapter 1.1',
            id: expect.any(String),
        })
    })
})
