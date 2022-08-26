import QuestionSet from '../questionSet'
import Audio from '../audio'

import db from '../../utils/db/dbSingleton'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await QuestionSet.deleteMany()
    await db.close()
})

describe('Create questionSet model', () => {
    it('should throw error if questions field is missing', async () => {
        const questionSet = new QuestionSet({})
        await expect(questionSet.validate()).rejects.toThrow(/questions/)
    })

    it('should throw error if questions field is an array of length 0', async () => {
        const questionSet = new QuestionSet({ questions: [] })
        await expect(questionSet.validate()).rejects.toThrow(/questions/)
    })

    it('should throw error if question has no options field', async () => {
        const question = {
            answer: 0,
        }
        const questionSet = new QuestionSet({ questions: [question] })
        await expect(questionSet.validate()).rejects.toThrow(/options/)
    })

    it('should throw error if question option field is empty array', async () => {
        const question = {
            answer: 0,
            options: [],
        }
        const questionSet = new QuestionSet({ questions: [question] })
        await expect(questionSet.validate()).rejects.toThrow(/options/)
    })

    it('should throw error if question answer field is not provided', async () => {
        const question = {
            options: ['1', '2'],
        }
        const questionSet = new QuestionSet({ questions: [question] })
        await expect(questionSet.validate()).rejects.toThrow(/answer/)
    })

    it('should save data 1', async () => {
        const question = {
            body: 'questionBody',
            explanation: 'questionExplanation',
            answer: 0,
            options: ['1', '2'],
        }
        const questionSet = new QuestionSet({ questions: [question] })
        await questionSet.save()

        const questionSetDoc = await QuestionSet.findById(questionSet.id)
        expect(questionSetDoc).not.toBeNull()

        expect(questionSetDoc).toMatchObject({
            id: expect.any(String),
            questions: expect.any(Array),
        })

        const questionZero = questionSetDoc!.questions[0]
        expect(questionZero).toMatchObject({
            body: 'questionBody',
            explanation: 'questionExplanation',
            answer: 0,
            options: ['1', '2'],
        })
    })

    it('should save data 2', async () => {
        const question = {
            answer: 0,
            options: ['1', '2'],
        }
        const questionSet = new QuestionSet({
            body: 'body',
            questions: [question],
            explanation: 'explanation',
        })
        await questionSet.save()

        const questionSetDoc = await QuestionSet.findById(questionSet.id)
        expect(questionSetDoc).not.toBeNull()

        expect(questionSetDoc).toMatchObject({
            id: expect.any(String),
            questions: expect.any(Array),
            body: 'body',
            explanation: 'explanation',
        })
    })

    it('should populate audio field', async () => {
        const audio = new Audio({
            key: 'audio_key',
            title: 'title',
        })
        await audio.save()

        const question = {
            answer: 0,
            options: ['1', '2'],
        }
        const questionSet = new QuestionSet({
            questions: [question],
            audio: audio.id,
        })
        await questionSet.save()

        const questionSetDoc = await QuestionSet.findById(questionSet.id)
        expect(questionSetDoc).not.toBeNull()

        expect(questionSetDoc!.toJSON()).toHaveProperty('audio')
    })
})
