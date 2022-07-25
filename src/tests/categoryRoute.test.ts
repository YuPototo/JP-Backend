import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { createApp } from '../app'
import db from '../utils/db'
import TopCategory from '../models/topCatgegory'
import SubCategory from '../models/subCategory'
import redisCache from '../utils/redis'

let app: Express

/*
    category tree:

    - study
        - studyMeta: newStandardJP, other
    - jlpt
        - jlptLevel: n1, n2
        - questionType: read, words
*/

/*
    测试用例：
        - 成功返回 category tree
        - 成功缓存
        - 会从 redis 里获取数据
*/

beforeAll(async () => {
    await redisCache.open()
    await db.open()
    app = await createApp()

    await TopCategory.create([
        {
            key: 'study',
            displayName: '学习',
            description: '用于给教材学习者使用',
            childrenMetaTypes: ['studyMeta'],
            weight: 1,
        },
        {
            key: 'jlpt',
            displayName: 'JLPT',
            description: '用于给 JLPT 学习者使用',
            childrenMetaTypes: ['jlptLevel', 'questionType'],
            weight: 0,
        },
    ])

    await SubCategory.create([
        {
            metaType: 'jlptLevel',
            key: 'n1',
            displayName: 'N1',
            description: 'n1',
            weight: 10,
        },
        {
            metaType: 'jlptLevel',
            key: 'n2',
            displayName: 'N2',
            description: 'n2',
            weight: 0,
        },
        {
            metaType: 'questionType',
            key: 'words',
            displayName: '文字词汇',
            description: '单词或语法',
            weight: 0,
        },
        {
            metaType: 'questionType',
            key: 'read',
            displayName: '阅读',
            description: '阅读题',
            weight: 10,
        },
        {
            metaType: 'studyMeta',
            key: 'other',
            displayName: '其他',
            description: '其他未分类练习',
            weight: 0,
        },
        {
            metaType: 'studyMeta',
            key: 'newStandardJP',
            displayName: '新标日',
            description: '新标日相关的练习',
            weight: 1,
        },
    ])
})

afterAll(async () => {
    await SubCategory.deleteMany()
    await TopCategory.deleteMany()
    await db.close()
    await redisCache.close()
})

describe('GET /categories', () => {
    const expectedOuput = {
        categories: [
            {
                key: 'study',
                displayName: '学习',
                subCategorySequence: ['studyMeta'],
                subCategories: {
                    studyMeta: [
                        {
                            key: 'newStandardJP',
                            displayName: '新标日',
                        },
                        {
                            key: 'other',
                            displayName: '其他',
                        },
                    ],
                },
            },
            {
                key: 'jlpt',
                displayName: 'JLPT',
                subCategorySequence: ['jlptLevel', 'questionType'],
                subCategories: {
                    jlptLevel: [
                        {
                            key: 'n1',
                            displayName: 'N1',
                        },
                        {
                            key: 'n2',
                            displayName: 'N2',
                        },
                    ],
                    questionType: [
                        {
                            key: 'read',
                            displayName: '阅读',
                        },
                        {
                            key: 'words',
                            displayName: '文字词汇',
                        },
                    ],
                },
            },
        ],
    }

    it('should return 200 with message', async () => {
        const res = await request(app).get('/api/v1/categories')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('categories')

        const categoriesOutput = res.body.categories
        expect(categoriesOutput).toHaveLength(2)

        // weight 高的应该在前面
        expect(categoriesOutput[0]).toHaveProperty('key', 'study')
        expect(categoriesOutput[1]).toHaveProperty('key', 'jlpt')

        const studyCategory = categoriesOutput[0]
        expect(studyCategory).toHaveProperty('displayName', '学习')
        expect(studyCategory).toHaveProperty('subCategorySequence', [
            'studyMeta',
        ])
        expect(studyCategory.subCategories).toHaveProperty('studyMeta')
        expect(studyCategory.subCategories.studyMeta).toHaveLength(2)

        // weight 高的应该在前面
        expect(studyCategory.subCategories.studyMeta[0]).toMatchObject({
            key: 'newStandardJP',
            displayName: '新标日',
        })

        // overal output
        expect(res.body).toMatchObject(expectedOuput)
    })

    it('should save cache to redis', async () => {
        await request(app).get('/api/v1/categories')
        const cacheData = await redisCache.get('categories')
        expect(cacheData).toBe(JSON.stringify(expectedOuput))
    })

    it('should read from redis first', async () => {
        await redisCache.del('categories')

        const mockData = { categories: 'mock' }
        await redisCache.set('categories', JSON.stringify(mockData), 1000)

        const res = await request(app).get('/api/v1/categories')
        expect(res.statusCode).toBe(200)
        expect(res.body).toMatchObject(mockData)

        await redisCache.del('categories')
    })
})
