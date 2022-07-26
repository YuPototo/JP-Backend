import type { RequestHandler } from 'express'

export const getCategories: RequestHandler = async (_, res) => {
    interface BaseCategory {
        key: string
        displayName: string
    }

    interface TopCategory extends BaseCategory {
        subCategories: BaseCategory[][]
    }

    const categories: TopCategory[] = [
        {
            key: 'study',
            displayName: '学习',
            subCategories: [
                [
                    {
                        key: 'newStandardJP',
                        displayName: '新标日',
                    },
                    {
                        key: 'other',
                        displayName: '其他',
                    },
                ],
            ],
        },
        {
            key: 'jlpt',
            displayName: 'JLPT',
            subCategories: [
                [
                    {
                        key: 'n1',
                        displayName: 'N1',
                    },
                    {
                        key: 'n2',
                        displayName: 'N2',
                    },
                ],
                [
                    {
                        key: 'words',
                        displayName: '文字词汇',
                    },
                    {
                        key: 'read',
                        displayName: '阅读',
                    },
                ],
            ],
        },
    ]
    return res.json({ categories })
}
