import type { RequestHandler } from 'express'
import TopCategory, { ITopCategory } from '@/models/topCatgegory'
import SubCategory from '@/models/subCategory'
import redisCache from '@/utils/redis/cacheSingleton'
import logger from '@/utils/logger/logger'

/** API: 获取所有分类 */
interface BaseCategory {
    key: string
    displayName: string
}

type BaseCategoryArray = BaseCategory[]

type metaType = string

type SubCategoryOutput = { [key: metaType]: BaseCategoryArray }

interface TopCategoryOutput extends BaseCategory {
    subCategorySequence: metaType[]
    subCategories: SubCategoryOutput
}

interface GetCategoryResponseData {
    categories: TopCategoryOutput[]
}

export const getCategories: RequestHandler = async (req, res, next) => {
    let topCategories: ITopCategory[]

    // get from redis
    try {
        const cache = await redisCache.get('categories')
        if (cache) {
            logger.info('Redis: get categories from cache')
            const cacheData = JSON.parse(cache) as GetCategoryResponseData
            return res.json(cacheData)
        }
    } catch (err) {
        logger.error(err)
    }

    // find top category
    try {
        topCategories = await TopCategory.find().sort({ weight: 'desc' })
    } catch (err) {
        next(err)
        return
    }

    if (topCategories.length === 0) {
        res.status(500).json({ message: '没有分类' })
        return
    }

    // generate category ouput
    const categories: TopCategoryOutput[] = []

    for (let index = 0; index < topCategories.length; index++) {
        const topCategory = topCategories[index]
        categories.push({
            key: topCategory.key,
            displayName: topCategory.displayName,
            subCategorySequence: topCategory.childrenMetaTypes,
            subCategories: {},
        })

        for (const metaType of topCategory.childrenMetaTypes) {
            const subCategories = await SubCategory.find({ metaType }).sort({
                weight: 'desc',
            })

            const categoryArray: BaseCategoryArray = subCategories.map(
                (el) => ({
                    key: el.key,
                    displayName: el.displayName,
                })
            )
            const subCategoryOutput = { [metaType]: categoryArray }
            categories[index].subCategories = {
                ...categories[index].subCategories,
                ...subCategoryOutput,
            }
        }
    }

    const responseData: GetCategoryResponseData = { categories }
    res.json(responseData)

    // save to redis
    try {
        const cacheData = JSON.stringify(responseData)
        await redisCache.set('categories', cacheData, 86400) // save for 24 hours
    } catch (err) {
        logger.error(err)
    }
}
