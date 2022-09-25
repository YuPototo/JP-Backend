import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import AdReward from '../../models/adReward'
import testUtils from '../../utils/testUtils/testUtils'
import User from '../../models/user'

let app: Express
let token: string
let userId: string

beforeAll(async () => {
    await db.open()
    app = await createApp()
    userId = await testUtils.createUser()
    token = await testUtils.createToken(userId)
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('POST /adRewards', () => {
    afterEach(async () => {
        await AdReward.deleteMany({})
    })

    it('should require auth', async () => {
        const res = await request(app).post('/api/v1/adRewards')
        expect(res.status).toBe(401)
    })

    it('should create an adReward record', async () => {
        const found = await AdReward.findOne()
        expect(found).toBeNull()

        const res = await request(app)
            .post('/api/v1/adRewards')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(201)

        const found2 = await AdReward.findOne()
        expect(found2).not.toBeNull()
    })

    it("should add user's quiz chance", async () => {
        const userBefore = await User.findOne({ _id: userId })

        const res = await request(app)
            .post('/api/v1/adRewards')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(201)

        const userAfter = await User.findOne({ _id: userId })
        expect(userAfter!.quizChance).toBe(userBefore!.quizChance + 5) // 默认增加5题

        const adReward = await AdReward.findOne()
        expect(adReward!.isRewarded).toBeTruthy()
    })

    it('should not allow more than 15 rewards a day', async () => {
        // insert 15
        await AdReward.insertMany([
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
        ])

        const res = await request(app)
            .post('/api/v1/adRewards')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(403)
    })

    it('should not raise error when there are 14 rewards since 24 hours ago', async () => {
        await AdReward.insertMany([
            // 14个 24小时内的
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            { user: userId },
            // 1个25小时前的
            {
                user: userId,
                createdTime: new Date(Date.now() - 25 * 60 * 60 * 1000),
            },
        ])

        const res = await request(app)
            .post('/api/v1/adRewards')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(201)
    })
})
