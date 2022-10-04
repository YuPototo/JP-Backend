import Section from '../section'
import Chapter from '../chapter'
import testUtils from '../../utils/testUtils/testUtils'

import db from '../../utils/db/dbSingleton'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('toJSON method', () => {
    afterAll(async () => {
        await Chapter.deleteMany({})
        await Section.deleteMany({})
    })

    it('should return id', async () => {
        const chapter = new Chapter({
            title: 'test title',
            desc: 'some desc',
        })

        await chapter.save()
        expect(chapter.toJSON()).toMatchObject({
            id: chapter.id,
            title: 'test title',
            desc: 'some desc',
            questionSets: [],
        })

        expect(chapter.toJSON()).not.toHaveProperty('sections')
    })
})

describe('Chapter.createChapterInSection()', () => {
    afterAll(async () => {
        await Chapter.deleteMany({})
        await Section.deleteMany({})
    })

    it('should check section exists', async () => {
        const randomMongoId = testUtils.createRandomMongoId()
        await expect(() =>
            Chapter.createChapterInSection({
                title: 'test title',
                sectionId: randomMongoId,
            }),
        ).rejects.toThrow(/找不到 Section/)
    })

    it('should create chapter', async () => {
        const sectionBefore = await Section.create({
            title: 'test section',
        })

        const sectionId = sectionBefore.id
        const chapter = await Chapter.createChapterInSection({
            title: 'test title',
            sectionId,
        })

        // check chapter
        // @ts-ignore
        const chapterFound = await Chapter.findById(chapter.id)
        expect(chapterFound).not.toBeNull()
        expect(chapterFound?.title).toBe('test title')
        expect(chapterFound?.sections[0].toString()).toEqual(sectionId)

        /* section 里应该记录 chapter id */
        const sectionAfter = await Section.findById(sectionId)
        expect(sectionAfter!.chapters.length).toBe(1)

        // @ts-ignore
        expect(sectionAfter!.chapters[0].toString()).toBe(chapter.id)

        // 再创建一个
        const chapter2 = await Chapter.createChapterInSection({
            title: 'test title 2',
            sectionId,
        })
        const sectionAfterAfter = await Section.findById(sectionId)
        expect(sectionAfterAfter!.chapters.length).toBe(2)

        // @ts-ignore
        expect(sectionAfterAfter!.chapters[1].toString()).toBe(chapter2.id)
    })

    it('should create a chapter with desc', async () => {
        const sectionBefore = await Section.create({
            title: 'test section',
        })

        const sectionId = sectionBefore.id
        const chapter = await Chapter.createChapterInSection({
            title: 'test title',
            desc: 'test desc',
            sectionId,
        })

        // check chapter
        // @ts-ignore
        const chapterFound = await Chapter.findById(chapter.id)
        expect(chapterFound).not.toBeNull()
        expect(chapterFound?.desc).toBe('test desc')
    })
})
