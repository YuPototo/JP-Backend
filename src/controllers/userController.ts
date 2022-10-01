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
    let wxRes: { wxUnionId: string; wxMiniOpenId?: string }
    try {
        if (loginPlatform === Platform.miniApp) {
            wxRes = await wxService.getIdByMiniAppCode(loginCode)
        } else if (loginPlatform === Platform.web) {
            wxRes = await wxService.getUnionIdByWebCode(loginCode)
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

    // 小程序登录

    if (loginPlatform === Platform.miniApp) {
        const { wxUnionId, wxMiniOpenId } = wxRes

        let user
        try {
            user = await User.findOne({ wxUnionId, wxMiniOpenId })
        } catch (err) {
            const errorMessage = getErrorMessage(err)
            const message = `平台 ${loginPlatform} - 查询用户失败: ${errorMessage}`
            logger.error(message, addReqMetaData(req))
            return res.status(500).json({ message })
        }

        if (!user) {
            // 仅查询 wxUnionId
            try {
                user = await User.findOne({ wxUnionId })
                if (user) {
                    // add open id
                    user.wxMiniOpenId = wxMiniOpenId
                    await user.save()
                }
            } catch (err) {
                const errorMessage = getErrorMessage(err)
                const message = `平台 ${loginPlatform} - 查询用户失败: ${errorMessage}`
                logger.error(message, addReqMetaData(req))
                return res.status(500).json({ message })
            }
        }

        if (!user) {
            // 创建用户
            try {
                user = await User.createNewUser(wxUnionId, wxMiniOpenId)
            } catch (err) {
                const errorMessage = getErrorMessage(err)
                const message = `平台 ${loginPlatform} - 创建用户失败: ${errorMessage}`
                logger.error(message, addReqMetaData(req))
                return res.status(500).json({ message })
            }
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

    // 网页版登录
    if (loginPlatform === Platform.web) {
        const { wxUnionId } = wxRes

        let user
        try {
            user = await User.findOne({ wxUnionId })
        } catch (err) {
            const errorMessage = getErrorMessage(err)
            const message = `平台 ${loginPlatform} - 查询用户失败: ${errorMessage}`
            logger.error(message, addReqMetaData(req))
            return res.status(500).json({ message })
        }

        if (!user) {
            // 创建用户
            try {
                user = await User.createNewUser(wxUnionId)
            } catch (err) {
                const errorMessage = getErrorMessage(err)
                const message = `平台 ${loginPlatform} - 创建用户失败: ${errorMessage}`
                logger.error(message, addReqMetaData(req))
                return res.status(500).json({ message })
            }
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

/**
 * 后台用户的 login
 */
export const adminLoginHandler: RequestHandler = async (req, res, next) => {
    const { username, password } = req.body

    if (!username) {
        return res.status(400).json({ message: '需要 username' })
    }
    if (!password) {
        return res.status(400).json({ message: '需要 password' })
    }

    let user
    try {
        user = await User.findOne({ adminUsername: username })
    } catch (err) {
        next(err)
        return
    }

    if (!user) {
        return res.status(404).json({ message: '找不到用户' })
    }

    if (user.adminPassword !== password) {
        return res.status(400).json({ message: '密码错误' })
    }

    try {
        const token = user.createToken()
        return res.json({
            token,
            user: {
                adminUsername: user.adminUsername,
                role: user.role,
            },
        })
    } catch (err) {
        return next(err)
    }
}
