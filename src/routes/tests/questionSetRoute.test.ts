import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import QuestionSet from '../../models/questionSet'
import Audio from '../../models/audio'
import testUtils from '../../utils/testUtils/testUtils'
import QuestionSetFav from '../../models/questionSetFav'
import { Role } from '../../models/user'
import Chapter from '../../models/chapter'
import { nanoid } from '../../utils/nanoid'

// test setup
const minimalQuestionSet = {
    questions: [
        {
            options: ['1', '2'],
            answer: 1,
        },
    ],
}

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
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

describe('POST /questionSets', () => {
    let editorToken: string
    let chapterId: string
    beforeAll(async () => {
        const editorUserId = await testUtils.createUser({ role: Role.Editor })
        editorToken = await testUtils.createToken(editorUserId)
        chapterId = await testUtils.createChapter()
    })

    /* access */
    it('should require auth', async () => {
        const res = await request(app).post('/api/v1/questionSets')
        expect(res.statusCode).toBe(401)
    })

    it('should not allow normal user to have access', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(401)
    })

    /* input */
    it('should require chapterId', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('缺少 chapterId')
    })

    it('should require questionSet data', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ chapterId: 'test' })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('缺少 questionSet')
    })

    it('should require question in question set', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ chapterId: 'test', questionSet: {} })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('question set 内缺少 questions')
    })

    it('question should contain options', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({
                chapterId: 'test',
                questionSet: { questions: [{}] },
            })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('question 内缺少 options 或 answer')

        const res2 = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({
                chapterId: 'test',
                questionSet: { questions: [{ answer: 2 }] },
            })
        expect(res2.statusCode).toBe(400)
        expect(res2.body.message).toBe('question 内缺少 options 或 answer')

        const res3 = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({
                chapterId: 'test',
                questionSet: { questions: [{ options: [] }] },
            })
        expect(res3.statusCode).toBe(400)
        expect(res3.body.message).toBe('question 内缺少 options 或 answer')
    })

    // check audio in reqBody if questionSet has audio
    it('should require audio in reqBody if questionSet has audio', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({
                chapterId: 'test',
                questionSet: {
                    questions: [{ options: [], answer: 2 }],
                    audio: testUtils.createRandomMongoId(),
                },
            })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe(
            'reqBody 内缺少 audio，但questionSet 里有 audio',
        )
    })

    // chapter should exists in db
    it('should return 400 when chapter is not found', async () => {
        const falseId = '61502602e94950fbe7a0075d'
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ chapterId: falseId, questionSet: minimalQuestionSet })
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到 chapter/)
    })

    // if there is audio, audio should exits in db
    it('should return 400 when audio is not found', async () => {
        const falseId = '61502602e94950fbe7a0075d'

        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({
                chapterId,
                questionSet: Object.assign(minimalQuestionSet, {
                    audio: falseId,
                }),
            })
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/找不到 audio/)
    })

    /* update db */
    it('should create questionSet in db', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ chapterId, questionSet: minimalQuestionSet })
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('questionSet')

        const questionSetId = res.body.questionSet.id
        const questionSet = await QuestionSet.findById(questionSetId)
        expect(questionSet).not.toBeNull()
        expect(questionSet!.chapters.map((el) => el.toString())).toContain(
            chapterId,
        )
    })

    it('should update chapter in db', async () => {
        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ chapterId, questionSet: minimalQuestionSet })
        expect(res.statusCode).toBe(201)

        const chapter = await Chapter.findById(chapterId)
        const questionSetId = res.body.questionSet.id
        expect(chapter!.questionSets.map((el) => el.toString())).toContain(
            questionSetId,
        )
    })

    it('should update audio if audio is provided', async () => {
        const key = nanoid(5)
        await Audio.create({ key, title: 'random' })

        const audio = await Audio.findOne({ key })
        const audioId = audio!.id
        expect(audio?.transcription).toBeUndefined()

        const res = await request(app)
            .post('/api/v1/questionSets')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({
                chapterId,
                questionSet: Object.assign(minimalQuestionSet, {
                    audio: audioId,
                }),
                audio: {
                    id: audioId,
                    transcription: 'new transcription',
                },
            })
        expect(res.statusCode).toBe(201)

        const audioAfter = await Audio.findById(audioId)
        expect(audioAfter?.transcription).toBe('new transcription')
    })
})
