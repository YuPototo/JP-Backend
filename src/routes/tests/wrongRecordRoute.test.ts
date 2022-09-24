import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import WrongRecord from '../../models/wrongRecord'

// test setup
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

describe('POST /wrongRecords/:questionSetId', () => {
    afterEach(async () => {
        await WrongRecord.deleteMany({})
    })

    it('should require auth', async () => {
        const mongoId = await testUtils.createRandomMongoId()
        const res = await request(app).post(`/api/v1/wrongRecords/${mongoId}`)
        expect(res.status).toBe(401)
    })

    it('should create a worng record', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        const res = await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(201)

        const wrongRecord = await WrongRecord.findOne({
            questionSet: questionSetId,
        })
        expect(wrongRecord).not.toBeNull()
    })

    it('should be indempotent', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        const res = await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(201)

        const res2 = await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res2.status).toBe(201)

        const wrongRecords = await WrongRecord.find({
            questionSet: questionSetId,
        })
        expect(wrongRecords.length).toBe(1)
    })
})

describe('GET /wrongRecords', () => {
    afterEach(async () => {
        await WrongRecord.deleteMany({})
    })

    it('should require auth', async () => {
        const res = await request(app).get(`/api/v1/wrongRecords`)
        expect(res.status).toBe(401)
    })

    it('should return all wrong records questionSetId', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        const questionSetId2 = await testUtils.createQuestionSet()

        await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)

        await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId2}`)
            .set('Authorization', `Bearer ${token}`)

        const res = await request(app)
            .get(`/api/v1/wrongRecords`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('questionSetIds')
        expect(res.body.questionSetIds).toEqual([questionSetId, questionSetId2])
    })
})

describe('DELETE /wrongRecords/:questionSetId', () => {
    it('should require auth', async () => {
        const mongoId = await testUtils.createRandomMongoId()
        const res = await request(app).delete(`/api/v1/wrongRecords/${mongoId}`)
        expect(res.status).toBe(401)
    })

    it('should delete a wrong record', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)

        const wrongRecord = await WrongRecord.findOne({
            questionSet: questionSetId,
        })
        expect(wrongRecord).not.toBeNull()

        const res = await request(app)
            .delete(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const wrongRecordAfter = await WrongRecord.findOne({
            questionSet: questionSetId,
        })
        expect(wrongRecordAfter).toBeNull()
    })

    it('should be indempotent', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        await request(app)
            .post(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)

        const wrongRecord = await WrongRecord.findOne({
            questionSet: questionSetId,
        })
        expect(wrongRecord).not.toBeNull()

        const res = await request(app)
            .delete(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)

        const res2 = await request(app)
            .delete(`/api/v1/wrongRecords/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res2.status).toBe(200)

        const wrongRecordAfter = await WrongRecord.findOne({
            questionSet: questionSetId,
        })
        expect(wrongRecordAfter).toBeNull()
    })
})
