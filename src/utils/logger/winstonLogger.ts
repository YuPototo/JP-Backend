/* istanbul ignore file */
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import config from '@/config/config'
import type { Request } from 'express-serve-static-core'

export type LogLevel =
    | 'silent'
    | 'error'
    | 'warn'
    | 'info'
    | 'http' // prod
    | 'verbose'
    | 'debug'
    | 'silly'

const stringifyObj = (
    info: winston.Logform.TransformableInfo,
    indent?: number,
) => {
    if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, indent)
    }
    return info
}

const prettyJson = (indent?: number) =>
    winston.format.printf((info) => {
        info = stringifyObj(info, indent)
        return `${info.timestamp} ${info.label || '-'} ${info.level}: ${
            info.message
        }`
    })

const selectLevel = (level: LogLevel) =>
    winston.format((info) => {
        if (info.level !== level) {
            return false
        }
        return info
    })

const toCsvFormat = winston.format.printf((info) => {
    info = stringifyObj(info)
    return `${info.timestamp},${info.level},${info.message}`
})

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    prettyJson(4),
)

const errorLogFormat = winston.format.combine(
    selectLevel('error')(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss ZZ ddd' }),
    winston.format.json(),
)

const combinedFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss ZZ ddd' }),
    winston.format.json(),
)

// http Log: 使用 csv 格式
const httpLogFormat = winston.format.combine(
    selectLevel('http')(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss ZZ ddd' }),
    toCsvFormat,
)

// transports
const combinedTransports: DailyRotateFile = new DailyRotateFile({
    format: combinedFormat,
    dirname: config.logger.combinedLogDir,
    filename: 'combined_%DATE%.log',
    datePattern: 'YYYYMMDD',
    maxSize: '20m',
    maxFiles: 20,
    level: 'http',
})

const httpTransport: DailyRotateFile = new DailyRotateFile({
    format: httpLogFormat,
    dirname: config.logger.httpLogDir,
    filename: 'http_%DATE%.log',
    datePattern: 'YYYYMMDD',
    maxSize: '20m',
    maxFiles: 20,
    level: 'http', // 这里表示 http 以上，但是在 httpLogFormat 里筛选了
})

const errorTransport: DailyRotateFile = new DailyRotateFile({
    format: errorLogFormat,
    dirname: config.logger.errorLogDir,
    filename: 'error_%DATE%.log',
    datePattern: 'YYYY_ww',
    maxSize: '20m',
    maxFiles: 8,
    level: 'error',
})

const transports = [
    new winston.transports.Console({ format: consoleFormat }),
    httpTransport,
    combinedTransports,
    errorTransport,
]

export const logger = winston.createLogger({
    level: config.logger.loggerLevel,
    silent: config.logger.loggerLevel === 'silent',
    transports,
})

export const addReqMetaData = (req: Request) => {
    return { id: req.id, url: req.url }
}
