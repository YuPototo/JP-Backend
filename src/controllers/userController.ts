import type { RequestHandler } from 'express'
import User from '@/models/user'
import wxService from '@/wxService'
import logger from '@/utils/logger/logger'
import { getErrorMessage } from '@/utils/errorUtil/errorHandler'
import { addReqMetaData } from '@/utils/logger/winstonLogger'

enum Platform {
    miniApp = 'miniApp',
    web = 'web',
}

function isValidPlatform(maybePlatform: string): maybePlatform is Platform {
    return Object.values(Platform).includes(maybePlatform as Platform)
}

export const wxLoginHandler: RequestHandler = async (req, res, next) => {
    logger.info(
        `开始微信用户创建的请求, loginCode: ${req.body.loginCode}`,
        addReqMetaData(req),
    )

    const { loginPlatform } = req.params
    const { loginCode } = req.body

    if (!loginCode) {
        res.status(400).json({ message: '没有收到 loginCode' })
        logger.error('没有收到 loginCode', addReqMetaData(req))
        return
    }

    if (!isValidPlatform(loginPlatform)) {
        const message = `platform 参数错误: ${loginPlatform}`
        res.status(400).json({ message })
        return logger.error(message, addReqMetaData(req))
    }

    // 访问微信的 code2session api，获取 union_id
    let wxUnionId: string
    try {
        if (loginPlatform === Platform.miniApp) {
            wxUnionId = await wxService.getUnionIdByMiniAppCode(loginCode)
        } else if (loginPlatform === Platform.web) {
            wxUnionId = await wxService.getUnionIdByWebCode(loginCode)
        } else {
            /*
             * tech debt: 增加这个 branch 是为了消除 ts 的报错
             */
            return next(new Error('unreachable'))
        }
    } catch (err) {
        const errorMessage = getErrorMessage(err)
        const message = `平台 ${loginPlatform} - 获取 union id 失败: ${errorMessage}`
        logger.error(message, addReqMetaData(req))
        return res.status(500).json({ message })
    }

    // 根据 union id 查找 user
    let user
    try {
        user = await User.findOne({ wxUnionId })
    } catch (err) {
        return next(err)
    }

    // 如果不存在 user，就创建一个新的 user
    if (!user) {
        logger.info(`新用户：${wxUnionId}`, addReqMetaData(req))
        try {
            user = await User.createNewUser(wxUnionId)
        } catch (err) {
            return next(err)
        }
    } else {
        logger.info('这是一个老用户', addReqMetaData(req))
    }

    // 生成 token 并返回
    let token: string
    try {
        token = user.createToken()
    } catch (err) {
        return next(err)
    }

    return res.status(201).json({ token, user })
}

export const reduceQuizChanceHandler: RequestHandler = async (
    req,
    res,
    next,
) => {
    const user = req.user

    try {
        user.quizChance = user.quizChance - 1 < 0 ? 0 : user.quizChance - 1 
        await user.save()
    } catch (err) {
        return next(err)
    }

    return res.status(200).json({ message: '已减少一次答题机会' })
}

export const getUserInfoHandler: RequestHandler = async (req, res) => {
    const user = req.user

    return res.status(200).json({ user })
}
