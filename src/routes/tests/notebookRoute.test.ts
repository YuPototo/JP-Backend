import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import redis from '../../utils/redis/redisSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import Notebook from '../../models/notebook'

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
        const notebookId = await testUtils.createNotebook(
            userId,
            'test notebook',
        )

        const res = await request(app)
            .get('/api/v1/notebooks')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('notebooks')
        expect(res.body.notebooks.length).toBe(1)

        expect(res.body.notebooks[0]).toMatchObject({
            id: notebookId,
            title: 'test notebook',
            isDefault: expect.any(Boolean),
        })
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
