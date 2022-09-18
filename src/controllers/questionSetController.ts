import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import QuestionSet from '@/models/questionSet'
import logger from '@/utils/logger/logger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import QuestionSetFav from '@/models/questionSetFav'

export const getQuestionSet: RequestHandler = async (req, res, next) => {
    const questionSetId = req.params.questionSetId

    if (!isMongoId(questionSetId)) {
        res.status(400).json({ message: 'id 不是合法的 mongo id' })
        logger.error(
            `id 不是合法的 mongoId: ${questionSetId} `,
            addReqMetaData(req),
        )
        return
    }

    let questionSet
    try {
        questionSet = await QuestionSet.findById(questionSetId).populate(
            'audio',
        )
    } catch (err) {
        next(err)
        return
    }

    if (!questionSet) {
        res.status(404).json({
            message: `找不到 question set: ${questionSetId}`,
        })
        logger.error(`找不到题目: ${questionSetId} `, addReqMetaData(req))
        return
    }

    if (req.user) {
        try {
            const favRecord = await QuestionSetFav.findOne({
                user: req.user._id,
                questionSet: questionSet._id,
            })
            return res.json({
                questionSet,
                isFav: !!favRecord,
            })
        } catch (err) {
            return next(err)
        }
    } else {
        return res.json({ questionSet })
    }
}
