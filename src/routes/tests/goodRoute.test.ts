import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { createApp } from '../../app'

import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import Good from '../../models/good'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('GET goods', () => {
    beforeAll(async () => {
        const good_1 = new Good({
            name: 'testGood',
            price: 100,
            memberDays: 1,
        })
        await good_1.save()

        const good_2 = new Good({
            name: 'testGood_2',
            price: 1000,
            memberDays: 2,
        })
        await good_2.save()
    })

    it('should return goods', async () => {
        const res = await request(app).get(`/api/v1/goods`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('goods')
        expect(res.body.goods).toHaveLength(2)

        expect(res.body.goods[0]).toMatchObject({
            id: expect.any(String),
            name: 'testGood',
            price: 100,
            memberDays: 1,
        })
    })
})
