import type { RequestHandler } from 'express'

/* cateogry */
export type CategoryKey = string

export interface Category {
    key: CategoryKey
    displayValue: string
    children?: Category[]
}

const practiceTypeCategories = [
    {
        key: 'reading',
        displayValue: '阅读',
    },
    {
        key: 'listening',
        displayValue: '听力',
    },
    {
        key: 'words',
        displayValue: '文字词汇',
    },
]

const jlptChildren = [
    {
        key: 'n1',
        displayValue: 'N1',
        children: practiceTypeCategories,
    },
    {
        key: 'n2',
        displayValue: 'N2',
        children: practiceTypeCategories,
    },
    {
        key: 'n3',
        displayValue: 'N3',
        children: practiceTypeCategories,
    },
    {
        key: 'n45',
        displayValue: 'N4/N5',
        children: practiceTypeCategories,
    },
]

const categoryJLPT = {
    key: 'jlpt',
    displayValue: 'JLPT 能力考',
    children: jlptChildren,
}

export const studyChidlren = [
    {
        key: 'newStandardJP',
        displayValue: '新标日',
        children: [
            {
                key: 'level_1',
                displayValue: '初级',
            },
            {
                key: 'level_2',
                displayValue: '中级',
            },
            {
                key: 'level_3',
                displayValue: '高级',
            },
        ],
    },
    {
        key: 'others',
        displayValue: '其他',
    },
]

const categoryStudy = {
    key: 'study',
    displayValue: '学习',
    children: studyChidlren,
}

export const getCategories: RequestHandler = async (_, res) => {
    const categories: Category[] = [categoryJLPT, categoryStudy]
    return res.json({ categories })
}
