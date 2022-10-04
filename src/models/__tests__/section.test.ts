import Section from '../section'
import Book from '../book'
import testUtils from '../../utils/testUtils/testUtils'

import db from '../../utils/db/dbSingleton'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('Section.createSection', () => {
    it('should check book exists', async () => {
        const randomMongoId = testUtils.createRandomMongoId()
        await expect(() =>
            Section.createSection({
                title: 'test title',
                bookId: randomMongoId,
            }),
        ).rejects.toThrow(/找不到 Book/)
    })

    it('should create section', async () => {
        const bookId = await testUtils.createBook()

        const section = await Section.createSection({
            title: 'test title',
            bookId,
        })

        // check section
        // @ts-ignore
        const sectionFound = await Section.findById(section.id)
        expect(sectionFound).not.toBeNull()
        expect(sectionFound?.title).toBe('test title')
        expect(sectionFound?.chapters).toEqual([])
        expect(sectionFound?.books[0].toString()).toEqual(bookId)

        /* book 里应该记录 section id */
        const book = await Book.findById(bookId)
        expect(book!.sections.length).toBe(1)

        // Mongoose interface 不准确
        // @ts-ignore
        expect(book!.sections[0].toString()).toBe(section.id)

        // 再创建一个
        const section2 = await Section.createSection({
            title: 'test title 2',
            bookId,
        })
        const bookAfter = await Book.findById(bookId)
        expect(bookAfter!.sections.length).toBe(2)

        // @ts-ignore
        expect(bookAfter!.sections[1].toString()).toBe(section2.id)
    })
})
