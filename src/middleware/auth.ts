import { RequestHandler } from 'express'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

import config from '@/config/config'
import User from '@/models/user'
import logger from '@/utils/logger/logger'
import { getErrorMessage } from '@/utils/errorUtil/errorHandler'

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

    return id
}

/**
 * tech debt: no tests for this middleware
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

    let userId: string
    try {
        userId = decipferToken(token)
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

    try {
        const user = await User.findById(userId)
        if (!user) {
            logger.error('Auth middleware，用户找不到：${userId}')
            res.status(401).send({ message: '用户不存在' })
            return
        }
        req.user = user
        next()
    } catch (err) {
        next(err)
        return
    }
}
