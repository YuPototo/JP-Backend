import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('get param', () => {
    it('should return 404 when there is no key', async () => {
        const res = await request(app).get(`/api/v1/parameters/some_key`)
        expect(res.status).toBe(404)
    })

    it('should get parameter by key', async () => {
        const key = 'key'
        const value = 'value'
        await testUtils.createParameter({ key, value })

        const res = await request(app).get(`/api/v1/parameters/${key}`)
        expect(res.status).toBe(200)
        expect(res.body.value).toBe(value)
    })
})
