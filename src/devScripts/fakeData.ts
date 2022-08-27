import Section from '@/models/section'
import Chapter from '@/models/chapter'
import Book from '@/models/book'
import logger from '@/utils/logger/logger'
import { addQuestionSets } from './fakeQuestionSet'
import { addAudios } from './fakeAudios'

export default async function addFakeData() {
    logger.warn('add data: this script can only be ran at dev environment')

    await addAudios()
    await addQuestionSets()
    await addChapters()
    await addSections()
    await addBooks()
}

// books
async function addBooks() {
    await Book.insertMany([
        {
            _id: '62e50da955ecc53ba31029aa',
            title: '做题测试册子',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n1',
                    child: {
                        key: 'words',
                    },
                },
            },
            desc: '用于测试 category data',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
            sections: ['62ee096e3ca7977c375aac33', '62ee098f3ca7977c375aac40'],
        },
        {
            _id: '62e50da955ecc53ba31119aa',
            title: 'N1 阅读',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n1',
                    child: {
                        key: 'reading',
                    },
                },
            },
            desc: '用于测试 category data',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
            sections: [],
        },
        {
            _id: '62e50dc889b2f6746e1d4c45',
            title: 'N1 听力',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n1',
                    child: {
                        key: 'listening',
                    },
                },
            },
            desc: '用于测试 category 选择',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
        },
        {
            _id: '62e50dd06a439022ad172e62',
            title: 'N2 听力',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n2',
                    child: {
                        key: 'listening',
                    },
                },
            },
            desc: '用于测试 category 选择',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
        },
        {
            _id: '62e50ddfc8e9ff10f57c6dbe',
            title: 'N2 文字词汇',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n2',
                    child: {
                        key: 'words',
                    },
                },
            },
            desc: '用于测试 category 选择',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
        },
        {
            _id: '62e50ded8a1cd7c58f610a80',
            title: 'N2 阅读',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n2',
                    child: {
                        key: 'reading',
                    },
                },
            },
            desc: 'desc todo',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
        },
        {
            _id: '62e50dfc68cd5f1940e05af2',
            title: 'N2 听力',
            category: {
                key: 'jlpt',
                child: {
                    key: 'n2',
                    child: {
                        key: 'listening',
                    },
                },
            },
            desc: '用于测试 category 选择',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
        },
        {
            _id: '62e50e1db8c57d0499a24a9e',
            title: '新标日初级',
            category: {
                key: 'study',
                child: {
                    key: 'newStandardJP',
                    child: {
                        key: 'level_1',
                        description: '初级',
                    },
                },
            },
            desc: '用于测试 category 选择',
            weight: 0,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: false,
        },
        {
            _id: '62ed3fbd3ca7977c375aa4bf',
            title: '新标日初级 - 需隐藏',
            category: {
                key: 'study',
                child: {
                    key: 'newStandardJP',
                    child: {
                        key: 'level_1',
                        description: '初级',
                    },
                },
            },
            desc: '用于测试隐藏',
            weight: 100,
            cover: 'images/cover/00ae607469909838ea532adc673af925.jpg',
            hidden: true,
        },
    ])
}

// sections
async function addSections() {
    await Section.insertMany([
        {
            _id: '62ee098f3ca7977c375aac40',
            title: 'section 2',
            chapters: ['62ee08fe3ca7977c375aabf8', '62ee09043ca7977c375aabfb'],
        },
        {
            _id: '62ee096e3ca7977c375aac33',
            title: 'section 1：题目测试',
            chapters: [
                '62ee08ee3ca7977c375aabec',
                '62ee08f73ca7977c375aabf1',
                '62ee08f73ca7977c375aabaa',
            ],
        },
    ])
}

// chapters
async function addChapters() {
    await Chapter.insertMany([
        {
            _id: '62ee08ee3ca7977c375aabec',
            title: 'chapter 1.1：题目的前后转换',
            desc: 'this is desc',
            questionSets: [
                '62ff846994d4a5032e425e3e',
                '62ff846994d4a5032e425e31',
                '62ff846994d4a5032e425e32',
                '62ff846994d4a5032e425e30',
            ],
        },
        {
            _id: '62ee08f73ca7977c375aabf1',
            title: '1.2 富文本渲染测试',
            questionSets: [
                '62ff846994d4a50321428881',
                '62ff846994d4a50321428882',
                '62ff846994d4a50321428772',
            ],
        },
        {
            _id: '62ee08f73ca7977c375aabaa',
            title: '1.3 听力测试',
            questionSets: [
                '62ff846994d4a5032e425e30',
                '62ff846994d4a5032e425111',
                '62ff846994d4a5032e428888',
            ],
        },
        {
            _id: '62ee08fe3ca7977c375aabf8',
            title: 'chapter 2.1',
            questionSets: ['62ff846994d4a5032e425e3e'],
        },
        {
            _id: '62ee09043ca7977c375aabfb',
            title: 'chapter 2.2',
            questionSets: ['62ff846994d4a5032e425e3e'],
        },
    ])
}
