import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import QuestionSet from '@/models/questionSet'
import logger from '@/utils/logger/logger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import QuestionSetFav from '@/models/questionSetFav'
import Chapter from '@/models/chapter'
import Audio from '@/models/audio'

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

/**
 * ReqBody:
 *   - questionSet
 *   - chapterId
 *   - audio: 选填 —— 如果 questionSet 有 audio，这里就需要
 */
export const addQuestionSet: RequestHandler = async (req, res, next) => {
    logger.info('addQuestionSet', addReqMetaData(req))

    /* check input */
    // chapterId
    const chapterId = req.body.chapterId
    if (!chapterId) {
        res.status(400).json({ message: '缺少 chapterId' })
        logger.error(`缺少 chapterId`, addReqMetaData(req))
        return
    }

    // question set data
    const questionSet = req.body.questionSet
    if (!questionSet) {
        res.status(400).json({ message: '缺少 questionSet' })
        logger.error(`缺少 questionSet`, addReqMetaData(req))
        return
    }

    // check question set data structure
    if (!questionSet.questions) {
        res.status(400).json({ message: 'question set 内缺少 questions' })
        logger.error(`question set 内缺少 questions`, addReqMetaData(req))
        return
    }

    // check question
    for (const question of questionSet.questions) {
        if (!question.options || !question.answer) {
            res.status(400).json({
                message: 'question 内缺少 options 或 answer',
            })
            logger.error(
                `question 内缺少 options 或 answer`,
                addReqMetaData(req),
            )
            return
        }
    }

    // check audio field
    if (questionSet.audio) {
        const audio = req.body.audio
        if (!audio) {
            res.status(400).json({
                message: 'reqBody 内缺少 audio，但questionSet 里有 audio',
            })
            logger.error('reqBody 内缺少 audio', addReqMetaData(req))
            return
        }
    }

    /* check database */
    // check chapter exists
    let chapter
    try {
        chapter = await Chapter.findById(chapterId)
        if (!chapter) {
            res.status(404).json({ message: `找不到 chapter ${chapterId}` })
            logger.error(`找不到 chapter: ${chapterId}`, addReqMetaData(req))
            return
        }
    } catch (err) {
        next(err)
        return
    }

    // if audio is provided, check audio exists
    if (questionSet.audio) {
        try {
            const audio = await Audio.findById(questionSet.audio)
            if (!audio) {
                res.status(404).json({
                    message: `找不到 audio ${questionSet.audio}`,
                })
                logger.error(
                    `找不到 audio: ${questionSet.audio}`,
                    addReqMetaData(req),
                )
                return
            }
        } catch (err) {
            next(err)
            return
        }
    }

    /* update db */
    // create question set
    const newQuestionSet = new QuestionSet({
        ...questionSet,
        chapters: [chapterId],
    })
    try {
        await newQuestionSet.save()
        logger.info('已保存 QuestionSet', addReqMetaData(req))
    } catch (err) {
        next(err)
        return
    }

    // update chapter
    try {
        chapter.questionSets.push(newQuestionSet._id)
        await chapter.save()
        logger.info('Chapter 已更新', addReqMetaData(req))
    } catch (err) {
        next(err)
        return
    }

    // update audio, if necessary
    if (questionSet.audio) {
        try {
            const transcription = req.body.audio.transcription
            const audio = await Audio.findById(questionSet.audio)
            if (audio) {
                audio.transcription = transcription
                await audio.save()
                logger.info('Audio 已更新', addReqMetaData(req))
            } else {
                // 前面应该已经检查过了，这里只是为了保险
                throw Error('Audio not Found')
            }
        } catch (err) {
            next(err)
            return
        }
    }

    res.status(201).json({ questionSet: newQuestionSet })
    return
}
