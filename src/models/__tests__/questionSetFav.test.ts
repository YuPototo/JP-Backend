import QuestionSetFav from '../questionSetFav'

import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'

let userId: string

beforeAll(async () => {
    await db.open()
    userId = await testUtils.createUser()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('questionSetFav model', () => {
    it('should not allow duplicate record', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = await testUtils.createQuestionSet()
        const questionSetFav = new QuestionSetFav({
            user: userId,
            notebook: notebookId,
            questionSet: questionSetId,
        })
        await questionSetFav.save()

        const duplicateQuestionSetFav = new QuestionSetFav({
            user: userId,
            notebook: notebookId,
            questionSet: questionSetId,
        })

        await expect(duplicateQuestionSetFav.save()).rejects.toThrow(/E11000/)
    })
})

describe('static methods: findNotebookQuestionSetIds()', () => {
    it('should return questionSetIds', async () => {
        const notebookId = await testUtils.createNotebook(userId, 'test title')
        const questionSetId = await testUtils.createQuestionSet()
        const questionSetFav = new QuestionSetFav({
            user: userId,
            notebook: notebookId,
            questionSet: questionSetId,
        })
        await questionSetFav.save()

        const questionSetIds = await QuestionSetFav.findNotebookQuestionSetIds(
            notebookId,
        )
        expect(questionSetIds).toEqual([questionSetId])
    })
})
