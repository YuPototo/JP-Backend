import morgan from 'morgan'
import morganBody from 'morgan-body'
import config from '@/config/config'
import logger from './logger'
import { nanoid } from '../nanoid'

import type {
    Express,
    Response,
    Request,
    NextFunction,
} from 'express-serve-static-core'

const removeNewlineAtEnd = (msg: string) => {
    return msg.substring(0, msg.lastIndexOf('\n'))
}

const LOGGER_FORMAT =
    ':method,:url,:status,:remote-addr,:res[content-length],:response-time,:id'

function assignId(req: Request, res: Response, next: NextFunction) {
    req.id = nanoid()
    return next()
}

morgan.token('id', function getId(req) {
    // tech-debts
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return req.id
})

function useMorgan(app: Express) {
    app.use(
        morgan(LOGGER_FORMAT, {
            // specify a stream for requests logging
            stream: {
                write: (msg) => {
                    // https://www.titanwolf.org/Network/q/5c84bf29-ed66-4443-991f-e8ba44455db1/y
                    const msgWithoutNewline = removeNewlineAtEnd(msg)
                    logger.http(msgWithoutNewline)
                },
            },
        }),
    )
}

export function useLog(app: Express) {
    app.use(assignId)

    if (config.logger.morgan) useMorgan(app)

    if (config.logger.morganBody) {
        morganBody(app)
    }
}
