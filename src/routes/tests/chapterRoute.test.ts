import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import Chapter from '../../models/chapter'
import QuestionSet from '../../models/questionSet'

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
    await db.close()
})

describe('GET /chapters/:chapterId', () => {
    let chapterId: string
    let questionSetOneId: string
    let questionSetTwoId: string

    beforeAll(async () => {
        const questionSetOne = new QuestionSet(minimalQuestionSet)
        await questionSetOne.save()
        questionSetOneId = questionSetOne._id.toString()

        const questionSetTwo = new QuestionSet(minimalQuestionSet)
        await questionSetTwo.save()
        questionSetTwoId = questionSetTwo._id.toString()

        const chapter = new Chapter({
            title: 'test chapter',
            questionSets: [questionSetOneId, questionSetTwoId],
        })
        await chapter.save()
        chapterId = chapter._id
    })

    afterAll(async () => {
        await Chapter.deleteMany({})
    })

    it('should return 400 when chapter is not valid mongoID', async () => {
        const res = await request(app).get('/api/v1/chapters/abc')
        expect(res.statusCode).toBe(400)
    })

    it('should return 404 when chapter is not found', async () => {
        const falseId = '61502602e94950fbe7a0075d'
        const res = await request(app).get(`/api/v1/chapters/${falseId}`)
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到 chapter/)
    })

    it('should return 200 and and needed info', async () => {
        const res = await request(app).get(`/api/v1/chapters/${chapterId}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('chapter')
        expect(res.body.chapter).toMatchObject({
            id: chapterId,
            title: 'test chapter',
            desc: '',
            questionSets: [questionSetOneId, questionSetTwoId],
        })
    })
})
