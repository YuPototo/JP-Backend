import express, { Request, Response, NextFunction } from 'express'
import type { Express } from 'express-serve-static-core'

import cors from 'cors'
import helmet from 'helmet'

import { getErrorMessage } from '@/utils/errorUtil/errorHandler'
import logger, { useLog } from '@/utils/logger/logger'

import categoryRouter from '@/routes/categoryRoute'
import bookRouter from '@/routes/bookRoute'
import chapterRouter from '@/routes/chapterRoute'
import questionSetRouter from '@/routes/questionSetRoute'
import userRouter from '@/routes/userRoute'
import bookFavRouter from '@/routes/bookFavRoute'
import chapterDoneRouter from '@/routes/chapterDoneRoute'
import notebookRouter from '@/routes/notebookRoute'
import questionSetFavRouter from '@/routes/questionSetFavRoute'
import wrongRecordRouter from '@/routes/wrongRecordRoute'
import adRewardRouter from '@/routes/adRewardRoute'
import goodRouter from '@/routes/goodRoute'
import orderRouter from '@/routes/orderRoute'
import sectionRouter from '@/routes/sectionRoute'
import audioRouter from '@/routes/audioRoute'
import parameterRouter from '@/routes/parameterRoute'

import { addReqMetaData } from './utils/logger/winstonLogger'

const VERSION = 'v1'
const API_PREFIX = `/api/${VERSION}`

export function createApp(): Express {
    const app = express()

    // middleware
    app.enable('trust proxy') // 使用 nginx proxy 时要用
    app.use(helmet()) // 若干开箱即用的安全措施
    app.use(cors()) // 允许跨域访问
    app.use(express.json()) // 保证 http request body 会被作为 json 传入
    useLog(app)

    // routes
    app.use(`${API_PREFIX}`, bookRouter)
    app.use(`${API_PREFIX}`, categoryRouter)
    app.use(`${API_PREFIX}`, chapterRouter)
    app.use(`${API_PREFIX}`, questionSetRouter)
    app.use(`${API_PREFIX}`, userRouter)
    app.use(`${API_PREFIX}`, bookFavRouter)
    app.use(`${API_PREFIX}`, chapterDoneRouter)
    app.use(`${API_PREFIX}`, notebookRouter)
    app.use(`${API_PREFIX}`, questionSetFavRouter)
    app.use(`${API_PREFIX}`, wrongRecordRouter)
    app.use(`${API_PREFIX}`, adRewardRouter)
    app.use(`${API_PREFIX}`, goodRouter)
    app.use(`${API_PREFIX}`, orderRouter)
    app.use(`${API_PREFIX}`, sectionRouter)
    app.use(`${API_PREFIX}`, audioRouter)
    app.use(`${API_PREFIX}`, parameterRouter)

    app.use('/check', (req, res) => {
        res.send(
            'If you are seeing this page, then api is working! API version: ' +
                VERSION,
        )
    })

    // Error-handling middleware: 必须使用 4个 argument
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        const errMessage = getErrorMessage(err)
        logger.error(errMessage, addReqMetaData(req))
        res.status(500).json({ message: errMessage })
    })

    return app
}
