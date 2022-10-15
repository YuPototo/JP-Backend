import isMongoId from 'validator/lib/isMongoId'

import type { RequestHandler } from 'express'
import QuestionSet from '@/models/questionSet'
import logger from '@/utils/logger/logger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import QuestionSetFav from '@/models/questionSetFav'
import Chapter from '@/models/chapter'
import Audio from '@/models/audio'
import cos, { ImageFormatError } from '@/utils/tencentCos/cos'
import multer from 'multer'
import path from 'path'
import { nanoid } from '@/utils/nanoid'
import config from '@/config/config'

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
 */
export const addQuestionSet: RequestHandler = async (req, res, next) => {
    logger.info('addQuestionSet', addReqMetaData(req))

    /* check input */

    // question set data
    const questionSet = req.body.questionSet
    if (!questionSet) {
        res.status(400).json({ message: '缺少 questionSet' })
        logger.error(`缺少 questionSet`, addReqMetaData(req))
        return
    }

    // chapterId
    const chapterId = req.body.chapterId
    if (!chapterId) {
        res.status(400).json({ message: '缺少 chapterId' })
        logger.error(`缺少 chapterId`, addReqMetaData(req))
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
        if (!question.options || question.answer === undefined) {
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
            const audio = await Audio.findById(questionSet.audio.id)
            if (!audio) {
                res.status(400).json({
                    message: `找不到 audio ${questionSet.audio.id}`,
                })
                logger.error(
                    `找不到 audio: ${questionSet.audio.id}`,
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

    let newQuestionSet
    if (questionSet.audio) {
        newQuestionSet = new QuestionSet({
            ...questionSet,
            audio: questionSet.audio.id,
            chapters: [chapterId],
        })
    } else {
        newQuestionSet = new QuestionSet({
            ...questionSet,
            chapters: [chapterId],
        })
    }

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
            const transcription = questionSet.audio.transcription
            const audio = await Audio.findById(questionSet.audio.id)
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

/**
 * 更新题目
 */
export const updateQuestionSet: RequestHandler = async (req, res, next) => {
    logger.info('updateQuestionSet', addReqMetaData(req))

    // check questionSetId
    const questionSetId = req.params.questionSetId

    try {
        const found = await QuestionSet.findById(questionSetId)
        if (!found) {
            res.status(404).json({
                message: `找不到 questionSet: ${questionSetId}`,
            })
            logger.error(`找不到题目: ${questionSetId} `, addReqMetaData(req))
            return
        }
    } catch (err) {
        next(err)
        return
    }

    // if audio is provided, check audio exists
    const questionSetPayload = req.body.questionSet

    if (questionSetPayload.audio) {
        try {
            const audio = await Audio.findById(questionSetPayload.audio.id)
            if (!audio) {
                res.status(404).json({
                    message: `找不到 audio ${questionSetPayload.audio.id}`,
                })
                logger.error(
                    `找不到 audio: ${questionSetPayload.audio.id}`,
                    addReqMetaData(req),
                )
                return
            }
        } catch (err) {
            next(err)
            return
        }
    }

    // not allow chapters
    if (questionSetPayload.chapters) {
        res.status(400).json({
            message: '不允许修改 chapters',
        })
        return
    }

    // update db
    try {
        await QuestionSet.findByIdAndUpdate(questionSetId, {
            ...questionSetPayload,
            audio: questionSetPayload.audio?.id,
        })
        logger.info('已更新 QuestionSet', addReqMetaData(req))
    } catch (err) {
        next(err)
        return
    }

    // update audio, if necessary
    if (questionSetPayload.audio) {
        try {
            const transcription = questionSetPayload.audio.transcription
            const audio = await Audio.findById(questionSetPayload.audio.id)
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

    res.json()
}

/**
 * Add Image for Question Set
 */
const upload = multer({
    limits: { fileSize: 900000 }, // 900kb
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(
                new ImageFormatError(
                    'Please upload an image with format png, jpg or jpeg',
                ),
            )
        }

        cb(null, true)
    },
}).single('image')

export const uploadImageErrorHandler: RequestHandler = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof ImageFormatError) {
            return res
                .status(400)
                .json({ message: '图片必须是 png, jpg 或 jpeg 格式' })
        } else if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: '文件需要小于900kb' })
            } else {
                logger.error(`A unprocessed MulterError. ${err.code}`)
                return res.status(500).json({ message: err.message })
            }
        } else if (err) {
            logger.error('上传 image 时发生了一个未知错误')
            logger.error(err)
            return res.status(500).json({ message: JSON.stringify(err) })
        }

        next()
    })
}

export const uploadQuestionSetImage: RequestHandler = async (req, res) => {
    const file = req.file

    if (!file) {
        logger.error('没有上传 image')
        return res.status(400).json({ message: '需要上传一个 image' })
    }

    // create file key
    const fileBaseName = path.parse(file.originalname).name
    const randomId = nanoid(6)
    const extention = path.extname(file.originalname)
    const filename = `${fileBaseName}_${randomId}${extention}`
    const fileKey = 'images/question/' + filename

    // use cos methods
    try {
        await cos.upload(file.buffer, fileKey)
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ message: '无法把资源上传到腾讯云' })
    }

    const url = config.cdnDomain + '/' + fileKey

    return res.json({ imageUrl: url })
}
