import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import Chapter, { IChapterDoc } from '@/models/chapter'
import logger from '@/utils/logger/logger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'

export const getChapter: RequestHandler = async (req, res, next) => {
    const chapterId = req.params.chapterId

    if (!isMongoId(chapterId)) {
        res.status(400).json({ message: 'id 不是合法的 mongo id' })
        logger.error(
            `id 不是合法的 mongoId: ${chapterId} `,
            addReqMetaData(req),
        )
        return
    }

    let chapter: IChapterDoc | null
    try {
        chapter = await Chapter.findById(chapterId)
    } catch (err) {
        next(err)
        return
    }

    if (!chapter) {
        res.status(404).json({ message: `找不到 chapter: ${chapterId}` })
        logger.error(`不存在 chapter：${chapterId} `, addReqMetaData(req))
        return
    }

    return res.json({ chapter })
}
