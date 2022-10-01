import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import Chapter from '../../models/chapter'
import testUtils from '../../utils/testUtils/testUtils'
import { Role } from '../../models/user'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('GET /chapters/:chapterId', () => {
    let chapterId: string
    let questionSetOneId: string
    let questionSetTwoId: string

    beforeAll(async () => {
        questionSetOneId = await testUtils.createQuestionSet()
        questionSetTwoId = await testUtils.createQuestionSet()
        const chapter = new Chapter({
            title: 'test chapter',
            questionSets: [questionSetOneId, questionSetTwoId],
        })
        await chapter.save()
        chapterId = chapter.id
    })

    it('should return 400 when chapter is not valid mongoID', async () => {
        const res = await request(app).get('/api/v1/chapters/abc')
        expect(res.statusCode).toBe(400)
    })

    it('should return 404 when chapter is not found', async () => {
        const falseId = '61502602e94950fbe7a0075d'
        const res = await request(app).get(`/api/v1/chapters/${falseId}`)
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到 chapter/)
    })

    it('should return 200 and and needed info', async () => {
        const res = await request(app).get(`/api/v1/chapters/${chapterId}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('chapter')
        expect(res.body.chapter).toMatchObject({
            id: chapterId,
            title: 'test chapter',
            questionSets: [questionSetOneId, questionSetTwoId],
        })
    })
})

describe('PATCH /chapters/:chapterId', () => {
    let chapterId: string
    let editorToken: string

    beforeAll(async () => {
        const chapter = new Chapter({
            title: 'test chapter',
            questionSets: [],
        })
        await chapter.save()
        chapterId = chapter.id

        const editorUserId = await testUtils.createUser({ role: Role.Editor })
        editorToken = await testUtils.createToken(editorUserId)
    })

    it('should require auth', async () => {
        const res = await request(app).patch(`/api/v1/chapters/${chapterId}`)
        expect(res.statusCode).toBe(401)
    })

    it('should not allow normal user to access', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)
        const res = await request(app)
            .patch(`/api/v1/chapters/${chapterId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(401)
    })

    it('should check input', async () => {
        const res = await request(app)
            .patch(`/api/v1/chapters/${chapterId}`)
            .set('Authorization', `Bearer ${editorToken}`)

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('req body 为空')
    })

    it('should only allow title and desc', async () => {
        const res = await request(app)
            .patch(`/api/v1/chapters/${chapterId}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ abc: 'abc' })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('req body 有不允许的属性')
    })

    it('should check if title is empty', async () => {
        const res = await request(app)
            .patch(`/api/v1/chapters/${chapterId}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ title: '' })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('标题不可为空')
    })

    it('should check if chapter exists', async () => {
        const falseId = '61502602e94950fbe7a0075d'
        const res = await request(app)
            .patch(`/api/v1/chapters/${falseId}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ title: 'new title' })

        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到 chapter/)
    })

    it('should be able to update chapter title', async () => {
        const res = await request(app)
            .patch(`/api/v1/chapters/${chapterId}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ title: 'new title' })

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('chapter')
        expect(res.body.chapter).toMatchObject({
            id: chapterId,
            title: 'new title',
        })

        const chapter = await Chapter.findById(chapterId)
        expect(chapter).not.toBeNull()
        expect(chapter?.title).toBe('new title')
    })

    it('should be able to update chapter desc', async () => {
        const res = await request(app)
            .patch(`/api/v1/chapters/${chapterId}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ desc: 'new desc' })

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('chapter')
        expect(res.body.chapter).toMatchObject({
            id: chapterId,
            desc: 'new desc',
        })

        const chapter = await Chapter.findById(chapterId)
        expect(chapter).not.toBeNull()
        expect(chapter?.desc).toBe('new desc')
    })
})
