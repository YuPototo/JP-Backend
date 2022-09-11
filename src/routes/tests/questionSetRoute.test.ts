import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import QuestionSet from '../../models/questionSet'
import Audio from '../../models/audio'
import testUtils from '../../utils/testUtils/testUtils'
import QuestionSetFav from '../../models/questionSetFav'

// test setup
const minimalQuestionSet = {
    questions: {
        options: ['1', '2'],
        answer: 1,
    },
}

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await QuestionSet.deleteMany({})
    await db.close()
})

describe('GET /questionSets/:questionSetId', () => {
    let questionSetId: string

    beforeAll(async () => {
        const questionSet = await QuestionSet.create(minimalQuestionSet)
        questionSetId = questionSet._id.toString()
    })

    it('should return 400 when parameter is not valid mongoID', async () => {
        const badId = 'abc'
        const res = await request(app).get(`/api/v1/questionSets/${badId}`)
        expect(res.statusCode).toBe(400)
    })

    it('should return 404 when chapter is not found', async () => {
        const falseId = '61502602e94950fbe7a0075d'
        const res = await request(app).get(`/api/v1/questionSets/${falseId}`)
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到 question set/)
    })

    it('should return 200 and and needed info', async () => {
        const res = await request(app).get(
            `/api/v1/questionSets/${questionSetId}`,
        )
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('questionSet')
    })

    it('should return audio url if question set has audio field', async () => {
        const audio = new Audio({ key: 'test_key', title: 'test_title' })
        await audio.save()
        const audioQuestionSetData = Object.assign(minimalQuestionSet, {
            audio: audio._id.toString(),
        })

        const questionSet = new QuestionSet(audioQuestionSetData)
        await questionSet.save()
        const questionSetId = questionSet._id.toString()

        const res = await request(app).get(
            `/api/v1/questionSets/${questionSetId}`,
        )
        expect(res.statusCode).toBe(200)
        expect(res.body.questionSet).toHaveProperty('audio')
        expect(res.body.questionSet.audio).toMatchObject({
            key: 'https://cdn.test.com/test_key',
            title: 'test_title',
        })
    })
})

describe('GET questionSets with token', () => {
    it('should not return isFav if there is not token in header', async () => {
        const questionSetId = await testUtils.createQuestionSet()
        const res = await request(app).get(
            `/api/v1/questionSets/${questionSetId}`,
        )
        expect(res.statusCode).toBe(200)
        expect(res.body).not.toHaveProperty('isFav')
    })

    it('isFav should be false when user has not saved the questionSet', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const questionSetId = await testUtils.createQuestionSet()

        const res = await request(app)
            .get(`/api/v1/questionSets/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('isFav')
        expect(res.body.isFav).toBeFalsy()
    })

    it('should return isFav true when user has saved the questionSet', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const questionSetId = await testUtils.createQuestionSet()
        const notebookId = await testUtils.createNotebook(userId)

        await QuestionSetFav.create({
            user: userId,
            notebook: notebookId,
            questionSet: questionSetId,
        })

        const res = await request(app)
            .get(`/api/v1/questionSets/${questionSetId}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('isFav')
        expect(res.body.isFav).toBeTruthy()
    })
})
