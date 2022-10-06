import logger from '@/utils/logger/logger'
import { nanoid } from '@/utils/nanoid'
import cos, { AudioFormatError } from '@/utils/tencentCos/cos'
import type { RequestHandler } from 'express'
import multer from 'multer'
import Audio from '../models/audio'
import path from 'path'

const upload = multer({
    limits: { fileSize: 5000000 }, // 5mb
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(mp3)$/)) {
            return cb(new AudioFormatError('必须上传一个音频文件，格式为 mp3'))
        }

        cb(null, true)
    },
}).single('audio')

export const uploadAudioErrorHandler: RequestHandler = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof AudioFormatError) {
            return res
                .status(400)
                .json({ message: '必须上传一个音频文件，格式为 mp3' })
        } else if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: '文件需要小于5MB' })
            } else {
                logger.error(`A unprocessed MulterError. ${err.code}`)
                return res.status(500).json({ message: err.message })
            }
        } else if (err) {
            logger.error('上传 audio 时发生了一个未知错误')
            logger.error(err)
            return res.status(500).json({ message: JSON.stringify(err) })
        }

        next()
    })
}

export const addAudio: RequestHandler = async (req, res, next) => {
    const file = req.file

    if (!file) {
        logger.error('没有上传 Audio')
        return res.status(400).json({ message: '需要上传一个音频' })
    }

    // create file key
    const fileBaseName = path.parse(file.originalname).name
    const randomId = nanoid(6)
    const extention = path.extname(file.originalname)
    const filename = `${fileBaseName}_${randomId}${extention}`
    const fileKey = 'audios/' + filename

    // upload
    try {
        await cos.upload(file.buffer, fileKey)
    } catch (err) {
        return res.status(500).json({ message: '无法把资源上传到腾讯云' })
    }

    // create audio in database
    const transcription = req.body.transcription
    try {
        const audio = new Audio({
            title: file.originalname,
            key: fileKey,
            transcription,
        })
        await audio.save()
        return res.status(201).json({ audio })
    } catch (err) {
        next(err)
        return
    }
}
