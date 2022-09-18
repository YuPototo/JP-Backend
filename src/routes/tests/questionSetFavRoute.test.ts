import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import redis from '../../utils/redis/redisSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import QuestionSetFav from '../../models/questionSetFav'

let app: Express
let token: string
let userId: string

beforeAll(async () => {
    await db.open()
    await redis.open()
    app = await createApp()
    userId = await testUtils.createUser()
    token = await testUtils.createToken(userId)
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
    await redis.close()
})

describe('Save questionSet to notebook', () => {
    it('should require auth', async () => {
        const notebookId = testUtils.createRandomMongoId()
        const questionSetId = testUtils.createRandomMongoId()
        const res = await request(app).post(
            `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
        )
        expect(res.status).toBe(401)
    })

    it('should check that notebook exists', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        const notebookId = testUtils.createRandomMongoId()
        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/找不到笔记本/)
    })

    it('should check that quetionSet exists', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = testUtils.createRandomMongoId()
        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(500)
        expect(res.body.message).toMatch(/找不到习题/)
    })

    it('should check that user owns notebook', async () => {
        const newUserId = await testUtils.createUser()
        const notebookId = await testUtils.createNotebook(
            newUserId,
            'test title',
        )
        const questionSetId = await testUtils.createQuestionSet()

        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(401)
        expect(res.body.message).toMatch(/你没有权限为这个笔记本添加题目/)
    })

    it('should create questionSetFav', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = await testUtils.createQuestionSet()
        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('questionSetFav')
        expect(res.body.questionSetFav).toMatchObject({
            notebook: notebookId,
            questionSet: questionSetId,
        })
    })

    it('should be indempotent', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = await testUtils.createQuestionSet()

        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(201)

        const res2 = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)

        expect(res2.status).toBe(201)
    })
})

describe('DELETE questionSetFav', () => {
    it('should require auth', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        const res = await request(app).delete(
            `/api/v1/notebooks/questionSets/${questionSetId}`,
        )
        expect(res.status).toBe(401)
    })

    it('should delete questionSetFav', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = await testUtils.createQuestionSet()
        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(201)

        const res2 = await request(app)
            .delete(`/api/v1/notebooks/questionSets/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res2.status).toBe(200)

        const questionSetFav = await QuestionSetFav.findOne({
            questionSet: questionSetId,
            user: userId,
        })
        expect(questionSetFav).toBeNull()
    })

    it('should be indempotent', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = await testUtils.createQuestionSet()

        const res = await request(app)
            .post(
                `/api/v1/notebooks/${notebookId}/questionSets/${questionSetId}`,
            )
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(201)

        const res2 = await request(app)
            .delete(`/api/v1/notebooks/questionSets/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res2.status).toBe(200)

        const res3 = await request(app)
            .delete(`/api/v1/notebooks/questionSets/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res3.status).toBe(200)
    })
})
