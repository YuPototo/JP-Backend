import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { createApp } from '../../app'
import wxService from '../../wxService'
import * as decipher from '../../utils/decipher'

import db from '../../utils/db/dbSingleton'
import Order, { OrderStatus } from '../../models/order'
import testUtils from '../../utils/testUtils/testUtils'
import User from '../../models/user'

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
    const mock = jest.spyOn(wxService, 'createPrepayOrder')

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
        mock.mockImplementation(() =>
            Promise.resolve({
                package: 'pakcage',
                nonceStr: 'nonceStr',
                timeStamp: 'timeStamp',
                signType: 'signType',
                paySign: 'paySign',
            }),
        )

        await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ goodId })

        const order = await Order.findOne()
        expect(order).not.toBeNull()
    })

    it('should return prepayOder data', async () => {
        mock.mockImplementation(() =>
            Promise.resolve({
                package: 'pakcage',
                nonceStr: 'nonceStr',
                timeStamp: 'timeStamp',
                signType: 'signType',
                paySign: 'paySign',
            }),
        )

        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ goodId })

        expect(res.statusCode).toBe(201)
        expect(res.body.prepayOrder).not.toBeNull()
    })
})

describe('Pay Success Notice', () => {
    const mockDecipher = jest.spyOn(decipher, 'decipherGCM')

    const NOTICE_BODY = {
        id: '7a140fb7-273e-51b3-a26a-20a9a9add91e',
        create_time: '2021-10-25T12:40:56+08:00',
        resource_type: 'encrypt-resource',
        event_type: 'TRANSACTION.SUCCESS',
        summary: '支付成功',
        resource: {
            original_type: 'transaction',
            algorithm: 'AEAD_AES_256_GCM',
            ciphertext:
                'pF5XSWCeoymB2q0v/lh3JUzWwXZKA+k3PeDGYZS231zRP4PfOF1m2D+YngEXzDSMD5ffz5sX30URE6fzfnw8JTxD9gjjPdup+FnGOVNPnIrQ7fqKDbY5+CqeAVR0i269hTPd5lchaZtyq7QzxwqAljwavBVOAxL54/WnrjDacmkGuMFOeyo7ir2u/ulcZ7p/4uHuLtVgwwIpAXK6BtgLd0CJa997Vd8f/8iexsN61E1VAn6SNEPadiDFK1mumycdAvGQhovyoRTkZGxxrYyCp+y4zmznUd/kKqQVgp20Tw9YvuxZXEhBWdqL9CJYcDkzJSHN9UIMq7zpU7VezqNTAWtoRSS9xOoJ3U2yRRkBjIb+0jUgb/Efv7FGbV1idm6W8Hvmz6oUXIrScKBy7mDCR/FluSJM/BNVwCZBCa1V9IldO/7ceC26ajqxy3MemRW8GYccQQnfFfR38jd9ISDU4uM4OHqo1hb8ytCwTL2rraU7pkhkt8Jffa7ozTNEHV/zdM7gBAVU9ngXVf1daV4UyRrqpyQ8iojptbvx8/k07y6b/z/XGNSQegLmvnQWM76O7DfqcuLm8Hw=',
            associated_data: 'transaction',
            nonce: 'J27b7xrWveeI',
        },
    }

    const createDecipherResult = (tradeId: string) => {
        return JSON.stringify({
            mchid: '1614116614',
            appid: 'wx94981ce2dab3ab05',
            out_trade_no: tradeId,
            transaction_id: '4200001204202110250813411793',
            trade_type: 'JSAPI',
            trade_state: 'SUCCESS',
            trade_state_desc: '支付成功',
            bank_type: 'CMB_CREDIT',
            attach: '',
            success_time: '2021-10-25T12:40:56+08:00',
            payer: {
                openid: 'o3qRK5PUL_qDLLmRhEylxeGHYuPI',
            },
            amount: {
                total: 400,
                payer_total: 400,
                currency: 'CNY',
                payer_currency: 'CNY',
            },
        })
    }

    afterEach(async () => {
        await Order.deleteMany()
    })

    it('should return 400 if body is malformed', async () => {
        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send({ someData: 'somecontent' })

        expect(res.status).toBe(400)
    })

    it('should return 200 if payment status is not success', async () => {
        const NOTICE_BODY = {
            id: '7a140fb7-273e-51b3-a26a-20a9a9add91e',
            create_time: '2021-10-25T12:40:56+08:00',
            resource_type: 'encrypt-resource',
            event_type: '不成功的类型', // 这个是我自己写的
            summary: '支付成功',
        }

        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)

        expect(res.status).toBe(200)
    })

    it('should return 400 when order is not found', async () => {
        mockDecipher.mockImplementation(() =>
            createDecipherResult(testUtils.createRandomMongoId()),
        )
        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
            code: 'FAILURE',
            message: '找不到订单',
        })
    })

    it('should return 400 when good is not found', async () => {
        const order = await Order.create({
            goodId: testUtils.createRandomMongoId(),
            userId: testUtils.createRandomMongoId(),
            payAmount: 1,
        })

        mockDecipher.mockImplementation(() => createDecipherResult(order.id))

        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)

        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
            code: 'FAILURE',
            message: '找不到商品',
        })
    })

    it('should return 400 when user is not found', async () => {
        const good = await testUtils.createGood()

        const order = new Order({
            good: good,
            user: testUtils.createRandomMongoId(),
            payAmount: 1,
        })
        await order.save()

        mockDecipher.mockImplementation(() => createDecipherResult(order.id))

        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)

        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
            code: 'FAILURE',
            message: '找不到用户',
        })
    })

    /** 成功 */
    // 一个非会员变为会员
    it('should inc member time by length, for user that is not member', async () => {
        const memberDays = 10
        const userId = await testUtils.createUser()
        const goodId = await testUtils.createGood({ memberDays })
        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        const user_t0 = await User.findById(userId)
        expect(user_t0?.memberDue).toBeUndefined()

        const now = new Date()

        mockDecipher.mockImplementation(() => createDecipherResult(order.id))
        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)
        expect(res.status).toBe(200)

        const user_t1 = await User.findById(userId)
        expect(user_t1?.memberDue).not.toBeUndefined()
        const memberDue = user_t1?.memberDue as Date

        const diffInMs = memberDue.getTime() - now.getTime()
        const acceptedDiff = 2 * 60 * 1000 // 接受2分钟的误差

        expect(diffInMs - memberDays * 24 * 60 * 60 * 1000).toBeLessThanOrEqual(
            acceptedDiff,
        )
    })

    // 一个会员延长会员时间
    it('should inc member time by length, for user that is member', async () => {
        const memberDays = 10
        const userId = await testUtils.createUser()
        const goodId = await testUtils.createGood({ memberDays })

        // 首次购买会员
        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        mockDecipher.mockImplementation(() => createDecipherResult(order.id))
        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)
        expect(res.status).toBe(200)
        const user_t0 = await User.findById(userId)
        expect(user_t0?.memberDue).toBeDefined()

        // 再次购买会员
        const order2 = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order2.save()
        mockDecipher.mockImplementation(() => createDecipherResult(order2.id))
        const res2 = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)
        expect(res2.status).toBe(200)
        const user_t1 = await User.findById(userId)

        const diffInMs =
            user_t1!.memberDue!.getTime() - user_t0!.memberDue!.getTime()
        const acceptedDiff = 2 * 60 * 1000 // 接受2分钟的误差

        expect(diffInMs - memberDays * 24 * 60 * 60 * 1000).toBeLessThanOrEqual(
            acceptedDiff,
        )
    })

    it('should change order status to delivered', async () => {
        const memberDays = 10
        const userId = await testUtils.createUser()
        const goodId = await testUtils.createGood({ memberDays })
        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        mockDecipher.mockImplementation(() => createDecipherResult(order.id))

        const order_t0 = await Order.findById(order.id)
        expect(order_t0!.status).not.toBe(OrderStatus.Delivered)

        await request(app).post('/api/v1/orders/notify').send(NOTICE_BODY)

        const order_t1 = await Order.findById(order.id)
        expect(order_t1!.status).toBe(OrderStatus.Delivered)
    })

    it('should return return success message', async () => {
        const memberDays = 10
        const userId = await testUtils.createUser()
        const goodId = await testUtils.createGood({ memberDays })
        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        mockDecipher.mockImplementation(() => createDecipherResult(order.id))

        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
            code: 'SUCCESS',
            message: '成功',
        })
    })

    // 如果订单已处理，不会再添加会员时长
    it('should return 200 when order state is delivered', async () => {
        const memberDays = 10
        const userId = await testUtils.createUser()
        const goodId = await testUtils.createGood({ memberDays })
        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        // notify 1
        mockDecipher.mockImplementation(() => createDecipherResult(order.id))
        await request(app).post('/api/v1/orders/notify').send(NOTICE_BODY)

        const user_t0 = await User.findById(userId)

        // notify 2
        mockDecipher.mockImplementation(() => createDecipherResult(order.id))
        const res = await request(app)
            .post('/api/v1/orders/notify')
            .send(NOTICE_BODY)
        expect(res.status).toBe(200)

        const user_t1 = await User.findById(userId)

        const diffInMs =
            user_t1!.memberDue!.getTime() - user_t0!.memberDue!.getTime()
        expect(diffInMs).toBe(0)
    })
})

describe('GET order', () => {
    const mock = jest.spyOn(wxService, 'getTransactionByOrderId')

    it('should require auth', async () => {
        const res = await request(app).get('/api/v1/orders')

        expect(res.status).toBe(401)
    })

    it('should check req param', async () => {
        const res = await request(app)
            .get('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400)
    })

    it('should return 404 if order is not found', async () => {
        const randomId = testUtils.createRandomMongoId()
        const res = await request(app)
            .get(`/api/v1/orders?orderId=${randomId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(404)
    })

    it('should return 200 if order is already delivered', async () => {
        const memberDays = 10
        const goodId = await testUtils.createGood({ memberDays })
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        order.status = OrderStatus.Delivered
        await order.save()

        const res = await request(app)
            .get(`/api/v1/orders?orderId=${order.id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
    })

    it('should return fetch order status from wechat if order is prepayed, if SUCCESS, add member days', async () => {
        const memberDays = 10
        const goodId = await testUtils.createGood({ memberDays })
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        const user_t0 = await User.findById(userId)
        expect(user_t0?.memberDue).toBeUndefined()

        mock.mockImplementation(() =>
            Promise.resolve({ trade_state: 'SUCCESS' }),
        )

        const res = await request(app)
            .get(`/api/v1/orders?orderId=${order.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const user_t1 = await User.findById(userId)
        expect(user_t1?.memberDue).not.toBeUndefined()
        const memberDue = user_t1?.memberDue as Date

        const now = new Date()
        const diffInMs = memberDue.getTime() - now.getTime()
        const acceptedDiff = 2 * 60 * 1000 // 接受2分钟的误差

        expect(diffInMs - memberDays * 24 * 60 * 60 * 1000).toBeLessThanOrEqual(
            acceptedDiff,
        )
    })

    it('should return 500 if order status is not successful', async () => {
        const memberDays = 10
        const goodId = await testUtils.createGood({ memberDays })
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const order = new Order({
            good: goodId,
            user: userId,
            payAmount: 1,
        })
        await order.save()

        mock.mockImplementation(() =>
            Promise.resolve({ trade_state: 'REFUND' }),
        )

        const res = await request(app)
            .get(`/api/v1/orders?orderId=${order.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(500)
        expect(res.body.message).toMatch(/REFUND/)
    })
})
