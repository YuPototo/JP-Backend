import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import Chapter, { IChapter } from '@/models/chapter'
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

    let chapter: IChapter | null
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

export const updateChapter: RequestHandler = async (req, res, next) => {
    const chapterId = req.params.chapterId

    // check input
    const update = req.body

    if (Object.values(update).length === 0) {
        res.status(400).json({ message: 'req body 为空' })
        return
    }

    if (update.title === '') {
        res.status(400).json({ message: '标题不可为空' })
        return
    }

    if (Object.keys(update).some((key) => !['title', 'desc'].includes(key))) {
        res.status(400).json({ message: 'req body 有不允许的属性' })
        return
    }

    // check if chapter exists
    let chapter
    try {
        chapter = await Chapter.findOneAndUpdate({ _id: chapterId }, update, {
            new: true,
        })
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
