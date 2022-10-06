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

describe.skip('POST /audios', () => {
    it('should require auth', async () => {
        const res = await request(app).post('/api/v1/audios')
        expect(res.status).toBe(401)
    })

    it('should not allow normal user to have access', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)
        const res = await request(app)
            .post('/api/v1/audios')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(401)
    })
})
