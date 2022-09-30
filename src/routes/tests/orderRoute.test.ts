import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { createApp } from '../../app'

import db from '../../utils/db/dbSingleton'
import Order from '../../models/order'
import testUtils from '../../utils/testUtils/testUtils'

let app: Express
let token: string
let goodId: string

beforeAll(async () => {
    await db.open()
    app = await createApp()
    const userId = await testUtils.createUser()
    token = await testUtils.createToken(userId)
    goodId = await testUtils.createGood()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('Create Order', () => {
    afterEach(async () => {
        await Order.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).post(`/api/v1/orders`)
        expect(res.status).toBe(401)
    })

    /* check input */
    it('should should check input', async () => {
        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('body 缺少 goodId')
    })

    /* business logic */
    it('should check that good exists', async () => {
        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ goodId: testUtils.createRandomMongoId() })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('商品不存在')
    })

    it('should create an order', async () => {
        await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ goodId })

        const order = await Order.findOne()
        expect(order).not.toBeNull()
    })
})
