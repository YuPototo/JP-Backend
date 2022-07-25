import { createClient, RedisClientType } from 'redis'
import config from '@/config/config'
import logger from '@/utils/logger/logger'

class RedisCache {
    private static _instance: RedisCache
    private _client?: RedisClientType
    private _initialConnection: boolean

    private constructor() {
        this._initialConnection = true
    }

    public static getInstance(): RedisCache {
        if (!RedisCache._instance) {
            RedisCache._instance = new RedisCache()
        }
        return RedisCache._instance
    }

    public open(): Promise<void> {
        return new Promise((resolve) => {
            this._client = createClient({ url: config.redisUrl })
            const client = this._client

            client.connect().then(() => {
                logger.info('Redis: connected')
            })

            client.on('ready', () => {
                if (this._initialConnection) {
                    this._initialConnection = false
                    resolve()
                }
                logger.info('Redis: ready')
            })

            client.on('reconnecting', () => {
                logger.info('Redis: reconnecting')
            })

            client.on('end', () => {
                logger.info('Redis: end')
            })

            client.on('disconnected', () => {
                logger.error('Redis: disconnected')
            })

            client.on('error', function (err: unknown) {
                logger.error(`Redis: error: ${err}`)
            })
        })
    }

    public async close() {
        const client = this._client
        if (!client) {
            logger.error('Redis: client is not initialized')
            throw new Error('Redis: client is not initialized')
        }
        client.quit()
    }

    //** expireAfter: seconds */
    public async set(key: string, value: string, expireAfter: number) {
        const client = this._client
        if (!client) {
            logger.error('Redis: client is not initialized')
            throw new Error('Redis: client is not initialized')
        }
        client.set(key, value, { EX: expireAfter })
    }

    public async get(key: string) {
        const client = this._client
        if (!client) {
            logger.error('Redis: client is not initialized')
            throw new Error('Redis: client is not initialized')
        }
        const value = await client.get(key)
        return value
    }

    public async del(key: string) {
        const client = this._client
        if (!client) {
            logger.error('Redis: client is not initialized')
            throw new Error('Redis: client is not initialized')
        }
        await client.del(key)
    }
}

export default RedisCache.getInstance()
