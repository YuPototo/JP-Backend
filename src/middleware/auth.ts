import { RequestHandler } from 'express'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

import config from '@/config/config'
import User from '@/models/user'
import logger from '@/utils/logger/logger'
import { getErrorMessage } from '@/utils/errorUtil/errorHandler'
import redis from '@/utils/redis/redisSingleton'

export const getAuthToken = (authHeader: string | undefined) => {
    if (!authHeader) {
        throw new Error('request header 里没有 authorization')
    }
    const authorizationStrings = authHeader.split(' ')

    const authType = authorizationStrings[0]
    if (authType !== 'Bearer') {
        throw new Error('Authorization 不是 Bearer Type')
    }

    const token = authorizationStrings[1]

    if (!token) {
        throw new Error('authHeader 里没有 token')
    }

    return token
}

export const decipferToken = (token: string) => {
    const secret = config.appSecret
    const decoded = jwt.verify(token, secret)

    if (typeof decoded === 'string') {
        throw new Error('token 解密出来是 string')
    }

    if (!decoded.id) {
        throw new Error('jwt payload 里没有 id property')
    }

    const id = decoded['id']

    if (typeof id !== 'string') {
        throw new Error('payload.id 不是 string')
    }

    // number of seconds since the epoch
    const exp = decoded['exp']

    if (typeof exp !== 'number') {
        throw new Error('payload.exp 不是 number')
    }

    return { id, exp }
}

/**
 * tech debt: no tests for this middleware
 * I don't create tests for this middleware because the codes has been running for two years without any problems
 */
export const auth: RequestHandler = async (req, res, next) => {
    let token: string
    const authHeader = req.header('Authorization')

    try {
        token = getAuthToken(authHeader)
    } catch (err) {
        const message = getErrorMessage(err)
        res.status(401).json({ message })
        logger.error(message)
        logger.error('authHeader: ', authHeader)
        return
    }

    let cacheUserId: string | null
    try {
        cacheUserId = await redis.get(token)
    } catch (err) {
        logger.error('Auth middleware: Redis erorr ' + getErrorMessage(err))
        cacheUserId = null
    }

    let userId: string
    if (cacheUserId) {
        userId = cacheUserId
    } else {
        try {
            const { id, exp } = decipferToken(token)
            userId = id
            saveTokenToRedis(token, userId, exp)
        } catch (err) {
            if (err instanceof JsonWebTokenError) {
                res.status(401).send({ message: err.message })
                return
            } else if (err instanceof TokenExpiredError) {
                res.status(401).send({ message: err.message })
                return
            } else {
                logger.error('unknown auth error')
                next(err)
                return
            }
        }
    }

    try {
        const user = await User.findById(userId)
        if (!user) {
            logger.error(`Auth middleware，用户找不到：${userId}`)
            res.status(401).send({ message: '用户不存在' })
            return
        }
        req.user = user
        next()
    } catch (err) {
        return next(err)
    }
}

export const optionalAuth: RequestHandler = async (req, res, next) => {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
        next()
    } else {
        auth(req, res, next)
    }
}

const saveTokenToRedis = async (token: string, userId: string, exp: number) => {
    try {
        await redis.set(token, userId, secondsTillExpire(exp))
    } catch (err) {
        logger.error('Auth middleware: Redis erorr ' + getErrorMessage(err))
    }
}

const secondsTillExpire = (exp: number) => {
    const now = Math.floor(Date.now() / 1000)
    return exp - now
}
