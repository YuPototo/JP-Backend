import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import redis from '../../utils/redis/redisSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import Notebook from '../../models/notebook'
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

describe('GET notebooks', () => {
    afterAll(async () => {
        await Notebook.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).get('/api/v1/notebooks')
        expect(res.status).toBe(401)
    })

    it('should return notebooks', async () => {
        // default
        const res = await request(app)
            .get('/api/v1/notebooks')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('notebooks')
        expect(res.body.notebooks.length).toBe(1)

        expect(res.body.notebooks[0]).toMatchObject({
            id: expect.any(String),
            title: '默认笔记本',
            isDefault: expect.any(Boolean),
        })

        //
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )
        const res2 = await request(app)
            .get('/api/v1/notebooks')
            .set('Authorization', `Bearer ${token}`)
        expect(res2.status).toBe(200)
        expect(res2.body).toHaveProperty('notebooks')
        expect(res2.body.notebooks.length).toBe(2)
    })
})

describe('POST notebooks', () => {
    afterAll(async () => {
        await Notebook.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).post('/api/v1/notebooks')
        expect(res.status).toBe(401)
    })

    it('should check req body', async () => {
        const res = await request(app)
            .post('/api/v1/notebooks')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('title is required')
    })

    it('should create notebook', async () => {
        const res = await request(app)
            .post('/api/v1/notebooks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'test notebook' })
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('notebook')
        expect(res.body.notebook).toMatchObject({
            id: expect.any(String),
            title: 'test notebook',
            isDefault: expect.any(Boolean),
        })
    })
})

describe('PATCH notebooks/:notebookId', () => {
    afterEach(async () => {
        await Notebook.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).post('/api/v1/notebooks')
        expect(res.status).toBe(401)
    })

    it('should check req body', async () => {
        let notebookId = await testUtils.createNotebook(userId, 'test notebook')

        const res = await request(app)
            .patch(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('title is required')
    })

    it('should return 404 if notebook not found', async () => {
        const randomId = '631c7e3f5a1bcfdaaa71f3bf'
        const res = await request(app)
            .patch(`/api/v1/notebooks/${randomId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'test notebook' })
        expect(res.status).toBe(404)
    })

    it('should return 401 if notebook belongs to another user', async () => {
        const newUserId = await testUtils.createUser()
        const notebookId = await testUtils.createNotebook(
            newUserId,
            'test notebook',
        )

        const res = await request(app)
            .patch(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'test notebook' })
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('你没有权限修改这个笔记本')
    })

    it('should not update default notebook', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
            true,
        )

        const res = await request(app)
            .patch(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'test notebook' })
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('不能修改默认笔记本')
    })

    it('should update notebook', async () => {
        let notebookId = await testUtils.createNotebook(userId, 'test notebook')

        const res = await request(app)
            .patch(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'updated notebook' })
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('notebook')
        expect(res.body.notebook).toMatchObject({
            id: notebookId,
            title: 'updated notebook',
            isDefault: expect.any(Boolean),
        })

        const updatedNotebook = await Notebook.findById(notebookId)
        expect(updatedNotebook!.title).toBe('updated notebook')
    })
})

describe('DELETE notebooks/:notebookId', () => {
    it('should require auth', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )
        const res = await request(app).delete(`/api/v1/notebooks/${notebookId}`)
        expect(res.status).toBe(401)
    })

    it('should return 401 if notebook belongs to another user', async () => {
        const newUserId = await testUtils.createUser()
        const notebookId = await testUtils.createNotebook(
            newUserId,
            'test notebook',
        )

        const res = await request(app)
            .delete(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('你没有权限删除这个笔记本')
    })

    it('should not delete default notebook', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
            true,
        )

        const res = await request(app)
            .delete(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('不能删除默认笔记本')
    })

    it('should delete notebook', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )

        const res = await request(app)
            .delete(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const deletedNotebook = await Notebook.findById(notebookId)
        expect(deletedNotebook).toBeNull()
    })

    it('should be indempotent', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )

        const res = await request(app)
            .delete(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const res2 = await request(app)
            .delete(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res2.status).toBe(200)
    })

    it('shoud delete all questionSetFav records', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )
        const questionSetId = await testUtils.createQuestionSet()

        await QuestionSetFav.create({
            user: userId,
            questionSet: questionSetId,
            notebook: notebookId,
        })

        const res = await request(app)
            .delete(`/api/v1/notebooks/${notebookId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const questionSetFav = await QuestionSetFav.findOne({
            userId,
            questionSetId,
        })
        expect(questionSetFav).toBeNull()
    })
})

describe('GET notebooks/:notebookId/questionSets', () => {
    it('should require auth', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )
        const res = await request(app).get(
            `/api/v1/notebooks/${notebookId}/questionSets`,
        )
        expect(res.status).toBe(401)
    })

    it('should return 401 if notebook belongs to another user', async () => {
        const newUserId = await testUtils.createUser()
        const notebookId = await testUtils.createNotebook(
            newUserId,
            'test notebook',
        )

        const res = await request(app)
            .get(`/api/v1/notebooks/${notebookId}/questionSets`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('你没有权限查看这个笔记本')
    })

    it('should return 404 if notebook does not exist', async () => {
        const randomMongoId = await testUtils.createRandomMongoId()
        const res = await request(app)
            .get(`/api/v1/notebooks/${randomMongoId}/questionSets`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('笔记本不存在')
    })

    it('should return questionSet ids', async () => {
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )
        const questionSetId = await testUtils.createQuestionSet()

        await QuestionSetFav.create({
            user: userId,
            questionSet: questionSetId,
            notebook: notebookId,
        })

        const res = await request(app)
            .get(`/api/v1/notebooks/${notebookId}/questionSets`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('questionSets')
        expect(res.body.questionSets).toEqual(
            expect.arrayContaining([questionSetId]),
        )
    })
})
