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
