import TopCategory, { ITopCategory } from '@/models/topCatgegory'
import SubCategory from '@/models/subCategory'
import type { RequestHandler } from 'express'

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
}
