import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import redis from '../../utils/redis/redisSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import chapterDone from '../../models/chapterDone'

let app: Express
let token: string

beforeAll(async () => {
    await db.open()
    await redis.open()
    app = await createApp()
    await testUtils.createBook()
    const userId = await testUtils.createUser()
    token = await testUtils.createToken(userId)
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
    await redis.close()
})

describe('Add chapterDone', () => {
    afterEach(async () => {
        await chapterDone.deleteMany({})
    })

    it('should require auth', async () => {
        const res = await request(app).post(`/api/v1/chapterDone/some_book_id`)
        expect(res.status).toBe(401)
    })

    it('should check request body contain chapterId', async () => {
        const resOne = await request(app)
            .post(`/api/v1/chapterDone/some_book_id`)
            .set('Authorization', `Bearer ${token}`)
        expect(resOne.status).toBe(400)
        expect(resOne.body.message).toBe('需要 chapterId')
    })

    it('should create a new record when there is no record', async () => {
        const recordBefore = await chapterDone.findOne()
        expect(recordBefore).toBeNull()

        const bookId = await testUtils.createBook()
        const chapterId = await testUtils.createChapter()

        const res = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(res.status).toBe(201)
        expect(res.body.message).toBe('添加成功')

        const recordAfter = await chapterDone.findOne()
        expect(recordAfter).not.toBeNull()

        const chapter = recordAfter!.chapters[0]
        expect(chapter.toString()).toMatch(chapterId)
    })

    it('should add chapter when a new chapter is done', async () => {
        // 先创建一条记录
        const bookId = await testUtils.createBook()
        const chapterId = await testUtils.createChapter()

        const res = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(res.status).toBe(201)

        const recordBefore = await chapterDone.findOne()
        expect(recordBefore!.chapters).toHaveLength(1)

        // 再完成一章
        const newChapterId = await testUtils.createChapter()
        const resTwo = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId: newChapterId })
        expect(resTwo.status).toBe(201)

        const recordAfter = await chapterDone.findOne()
        expect(recordAfter!.chapters).toHaveLength(2)
    })

    it('should not add chapter when chapter is already done', async () => {
        // 先创建一条记录
        const bookId = await testUtils.createBook()
        const chapterId = await testUtils.createChapter()

        const res = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(res.status).toBe(201)

        const recordBefore = await chapterDone.findOne()
        expect(recordBefore!.chapters).toHaveLength(1)

        // 再完成一章
        const resTwo = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(resTwo.status).toBe(201)

        const recordAfter = await chapterDone.findOne()
        expect(recordAfter!.chapters).toHaveLength(1)
    })
})

describe('Get chapterDone', () => {
    let bookId: string
    beforeAll(async () => {
        bookId = await testUtils.createBook()
    })

    afterAll(async () => {
        await chapterDone.deleteMany({})
    })

    it('should require auth', async () => {
        const res = await request(app).get(`/api/v1/chapterDone/${bookId}`)
        expect(res.status).toBe(401)
    })

    it('should return empty array when there is no record', async () => {
        const res = await request(app)
            .get(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.chapters).toHaveLength(0)
    })

    it('should return all records', async () => {
        const bookId = await testUtils.createBook()
        const chapterId = await testUtils.createChapter()

        const res = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(res.status).toBe(201)

        const resTwo = await request(app)
            .get(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(resTwo.status).toBe(200)
        expect(resTwo.body.chapters).toHaveLength(1)
    })
})

describe('Delete chapterDone by book', () => {
    it('should require auth', async () => {
        const res = await request(app).delete(`/api/v1/chapterDone/123`)
        expect(res.status).toBe(401)
    })

    it('should delete record', async () => {
        const bookId = await testUtils.createBook()
        const chapterId = await testUtils.createChapter()

        const res = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(res.status).toBe(201)

        const recordBefore = await chapterDone.findOne()
        expect(recordBefore).not.toBeNull()

        const resTwo = await request(app)
            .delete(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(resTwo.status).toBe(200)

        const recordAfter = await chapterDone.findOne()
        expect(recordAfter).toBeNull()
    })

    it('should work idempotently', async () => {
        const bookId = await testUtils.createBook()
        const chapterId = await testUtils.createChapter()

        const res = await request(app)
            .post(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ chapterId })
        expect(res.status).toBe(201)

        const recordBefore = await chapterDone.findOne()
        expect(recordBefore).not.toBeNull()

        const resTwo = await request(app)
            .delete(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(resTwo.status).toBe(200)

        const recordAfter = await chapterDone.findOne()
        expect(recordAfter).toBeNull()

        const resThree = await request(app)
            .delete(`/api/v1/chapterDone/${bookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(resThree.status).toBe(200)
    })
})
