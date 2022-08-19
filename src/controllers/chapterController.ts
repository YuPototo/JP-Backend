import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import Chapter, { IChapter } from '@/models/chapter'

export const getChapter: RequestHandler = async (req, res, next) => {
    const chapterId = req.params.chapterId

    if (!isMongoId(chapterId)) {
        res.status(400).json({ message: 'id 不是合法的 mongo id' })
        return
    }

    let chapter: IChapter | null
    try {
        chapter = await Chapter.findById(chapterId)
    } catch (err) {
        next(err)
        return
    }

    if (!chapter) {
        res.status(404).json({ message: `找不到 chapter: ${chapterId}` })
        return
    }

    return res.json({ chapter })
}
