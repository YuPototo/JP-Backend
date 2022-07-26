import db from '../../utils/db/dbSingleton'
import Book from '../book'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await db.close()
})

describe('bookSchema toJSON method', () => {
    it('simple book with only 1 top category', () => {
        const book = new Book({
            title: 'test_book_1',
            categories: [
                {
                    topKey: 'jlpt',
                },
            ],
        })

        expect(book.toJSON()).toMatchObject({
            title: 'test_book_1',
            topCategories: ['jlpt'],
        })
    })

    it('simple book with only 2 top category', () => {
        const book = new Book({
            title: 'test_book_2',
            categories: [
                {
                    topKey: 'jlpt',
                },
                {
                    topKey: 'study',
                },
            ],
        })

        expect(book.toJSON()).toMatchObject({
            title: 'test_book_2',
            topCategories: ['jlpt', 'study'],
        })
    })

    it('1 top category with 1 child category', () => {
        const book = new Book({
            title: 'test_book_3',
            categories: [
                {
                    topKey: 'jlpt',
                    children: [
                        {
                            metaType: 'jlptLevel',
                            keys: ['n1', 'n2'],
                        },
                    ],
                },
            ],
        })

        expect(book.toJSON()).toMatchObject({
            title: 'test_book_3',
            topCategories: ['jlpt'],
            childCategories: {
                jlpt: {
                    jlptLevel: ['n1', 'n2'],
                },
            },
        })
    })

    it('2 top categories', async () => {
        const book = new Book({
            title: 'test_book_4',
            categories: [
                {
                    topKey: 'jlpt',
                    children: [
                        {
                            metaType: 'jlptLevel',
                            keys: ['n1', 'n2'],
                        },
                        {
                            metaType: 'domain',
                            keys: ['read'],
                        },
                    ],
                },
                {
                    topKey: 'study',
                    children: [
                        {
                            metaType: 'materials',
                            keys: ['newStandardJP'],
                        },
                    ],
                },
            ],
        })
        expect(book.toJSON()).toMatchObject({
            title: 'test_book_4',
            topCategories: ['jlpt', 'study'],
            childCategories: {
                jlpt: {
                    jlptLevel: ['n1', 'n2'],
                    domain: ['read'],
                },
                study: {
                    materials: ['newStandardJP'],
                },
            },
        })
    })
})
