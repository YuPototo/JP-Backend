import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../app'
import db from '../utils/db/dbSingleton'
import Book from '../models/book'

// test data :3 books

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

// test setup

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
    await createBooks()
})

afterAll(async () => {
    await Book.deleteMany()
    await db.close()
})

describe('GET /books', () => {
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
