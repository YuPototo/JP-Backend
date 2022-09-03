import BookFav from '../bookFav'

import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'

let userId: string
let bookId: string

beforeAll(async () => {
    await db.open()
    userId = await testUtils.createOneUser()
    bookId = await testUtils.createOneBook()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('Audio model', () => {
    afterEach(async () => {
        await BookFav.deleteMany()
    })

    it('should successfully save data', async () => {
        const bookFav = new BookFav({ user: userId, book: bookId })
        await bookFav.save()

        const found = await BookFav.findOne({ user: userId, book: bookId })
        expect(found).not.toBeNull()
    })

    it('should not allow repeated data', async () => {
        const bookFav = new BookFav({ user: userId, book: bookId })
        await bookFav.save()

        const bookFav2 = new BookFav({ user: userId, book: bookId })
        await expect(bookFav2.save()).rejects.toThrow()
    })
})
