import mongoose from 'mongoose'
import config from '@/config/config'
import logger from '@/utils/logger/logger'
import { getErrorMessage } from '@/utils/errorUtil/errorHandler'

const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    autoIndex: config.mongo.autoIndex,
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

mongoose.set('debug', process.env.DEBUG !== undefined)

export class MongoConnection {
    private static _instance: MongoConnection

    static getInstance(): MongoConnection {
        if (!MongoConnection._instance) {
            MongoConnection._instance = new MongoConnection()
        }
        return MongoConnection._instance
    }

    public async open(): Promise<void> {
        try {
            logger.debug('connecting to mongo db: ' + config.mongo.url)
            await mongoose.connect(config.mongo.url, option)
        } catch (err) {
            const message = getErrorMessage(err)
            logger.error(`连接数据库错误: ${message}`)
            throw err
        }

        mongoose.connection.on('connected', () => {
            logger.info('Mongo: 已连接')
        })

        mongoose.connection.on('disconnected', () => {
            if (process.env.NODE_ENV !== 'test') {
                logger.error('Mongo: 已断开连接')
            }
        })

        mongoose.connection.on('error', (err) => {
            const message = getErrorMessage(err)
            logger.error(`Mongo:  ${String(message)}`)
            if (err.name === 'MongoNetworkError') {
                setTimeout(function () {
                    mongoose.connect(config.mongo.url, option)
                }, 5000)
            }
        })
    }

    public async close(): Promise<void> {
        try {
            await mongoose.disconnect()
        } catch (err) {
            const message = getErrorMessage(err)
            logger.error(`db.open: ${message}`)
            throw err
        }
    }
}

export default MongoConnection.getInstance()
