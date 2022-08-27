import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import QuestionSet, { IQuestionSet } from '@/models/questionSet'

export const getQuestionSet: RequestHandler = async (req, res, next) => {
    const questionSetId = req.params.questionSetId

    if (!isMongoId(questionSetId)) {
        res.status(400).json({ message: 'id 不是合法的 mongo id' })
        return
    }

    let questionSet: IQuestionSet | null
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
        return
    }

    return res.json({ questionSet })
}
