import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import BookFav from '../../models/bookFav'

let app: Express
let token: string

beforeAll(async () => {
    await db.open()
    app = await createApp()
    await testUtils.createOneBook()
    const userId = await testUtils.createOneUser()
    token = await testUtils.createToken(userId)
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('addBookFav', () => {
    afterEach(async () => {
        await BookFav.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).post('/api/v1/bookFav/some_book_id')
        expect(res.status).toBe(401)
    })

    it('should return 400 if book id is not valid mongoId', async () => {
        const res = await request(app)
            .post('/api/v1/bookFav/some_book_id')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch('some_book_id 不是合法的 mongoId')
    })

    it('should return 500 if book not exit', async () => {
        const res = await request(app)
            .post('/api/v1/bookFav/5f5b3a3c3f8b5a0b5c5f5e5e')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(500)
        expect(res.body.message).toMatch(
            '找不到练习册 5f5b3a3c3f8b5a0b5c5f5e5e',
        )
    })

    it('should return 500 if duplicated records created', async () => {
        const bookId = await testUtils.createOneBook()
        const res = await request(app)
            .post(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(201)

        const res2 = await request(app)
            .post(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res2.status).toBe(500)
        expect(res2.body.message).toMatch(`重复的收藏记录 ${bookId}`)
    })

    it('should return 201 if record created', async () => {
        const bookId = await testUtils.createOneBook()
        const res = await request(app)
            .post(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(201)
    })
})

describe('deleteBookFav', () => {
    it('should require auth', async () => {
        const res = await request(app).delete('/api/v1/bookFav/some_book_id')
        expect(res.status).toBe(401)
    })

    it('should return 400 if book id is not valid mongoId', async () => {
        const res = await request(app)
            .delete('/api/v1/bookFav/some_book_id')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch('some_book_id 不是合法的 mongoId')
    })

    it('should delete a record', async () => {
        const bookId = await testUtils.createOneBook()
        await request(app)
            .post(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        const res = await request(app)
            .delete(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const bookFav = await BookFav.findOne({ bookId })
        expect(bookFav).toBeNull()
    })
})

describe('getBookFavs', () => {
    beforeAll(() => {})

    it('should require auth ', async () => {
        const req = await request(app).get(`/api/v1/bookFav`)
        expect(req.status).toBe(401)
    })

    it('should return favourited book ids - 0 books', async () => {
        const req = await request(app)
            .get(`/api/v1/bookFav`)
            .set('Authorization', `Bearer ${token}`)

        expect(req.status).toBe(200)
        expect(req.body).toHaveProperty('books')
        expect(req.body.books).toHaveLength(0)
    })

    it('should return favourited book ids - 2 books', async () => {
        const bookId1 = await testUtils.createOneBook()
        const bookId2 = await testUtils.createOneBook()
        await request(app)
            .post(`/api/v1/bookFav/${bookId1}`)
            .set('Authorization', `Bearer ${token}`)
        await request(app)
            .post(`/api/v1/bookFav/${bookId2}`)
            .set('Authorization', `Bearer ${token}`)

        const req = await request(app)
            .get(`/api/v1/bookFav`)
            .set('Authorization', `Bearer ${token}`)

        expect(req.status).toBe(200)
        expect(req.body).toHaveProperty('books')
        expect(req.body.books).toHaveLength(2)
    })
})

describe.only('isBookFav', () => {
    it('should require auth', async () => {
        const res = await request(app).get('/api/v1/bookFav/some_book_id')
        expect(res.status).toBe(401)
    })

    it('should return 400 if book id is not valid mongoId', async () => {
        const res = await request(app)
            .get('/api/v1/bookFav/some_book_id')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch('some_book_id 不是合法的 mongoId')
    })

    it('should return true is book is favourited', async () => {
        const bookId = await testUtils.createOneBook()
        await request(app)
            .post(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        const res = await request(app)
            .get(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('isFav')
        expect(res.body.isFav).toBe(true)
    })

    it('should return false is book is not favourited', async () => {
        const bookId = await testUtils.createOneBook()

        const res = await request(app)
            .get(`/api/v1/bookFav/${bookId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('isFav')
        expect(res.body.isFav).toBe(false)
    })
})
