import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { createApp } from '../app'
import db from '../utils/db/dbSingleton'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await db.close()
})

describe('GET /simpleTest', () => {
    it('should return 200 with message', async () => {
        const res = await request(app).get('/api/v1/test/simpleTest')
        expect(res.statusCode).toBe(200)
    })
})

describe('POST /dummies', () => {
    it('should return 400 when name is not provided', async () => {
        const res = await request(app).post('/api/v1/test/dummies')
        expect(res.statusCode).toBe(400)
        expect(res.body).toEqual({ message: 'name is required' })
    })

    it('should return 201 with message', async () => {
        const res = await request(app)
            .post('/api/v1/test/dummies')
            .send({ name: 'test' })
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            dummy: { name: 'test', id: expect.any(String) },
        })
    })
})
