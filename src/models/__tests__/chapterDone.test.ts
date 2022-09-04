import ChapterDone from '../chapterDone'

import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'

let userId: string
let bookId: string
let chapterOneId: string
let chapterTwoId: string

beforeAll(async () => {
    await db.open()
    userId = await testUtils.createUser()
    bookId = await testUtils.createBook()
    chapterOneId = await testUtils.createChapter()
    chapterTwoId = await testUtils.createChapter()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('create chapterDone', () => {
    afterEach(async () => {
        await ChapterDone.deleteMany({})
    })

    it('should save without error', async () => {
        const chapterDone = new ChapterDone({
            user: userId,
            book: bookId,
            chapters: [chapterOneId],
        })

        await chapterDone.save()

        const found = await ChapterDone.findOne({ user: userId, book: bookId })
        expect(found).not.toBeNull()
    })

    it('should not allow duplicate user and book combination', async () => {
        const chapterDone = new ChapterDone({
            user: userId,
            book: bookId,
            chapters: [chapterOneId],
        })

        await chapterDone.save()

        const chapterDoneTwo = new ChapterDone({
            user: userId,
            book: bookId,
            chapters: [chapterTwoId],
        })

        await expect(chapterDoneTwo.save()).rejects.toThrow(/E11000/)
    })
})
