import type { RequestHandler } from 'express'
import User, { IUser } from '@/models/user'
import wxService from '@/wxService'
import logger from '@/utils/logger/logger'
import { getErrorMessage } from '@/utils/errorUtil/errorHandler'

enum Platform {
    miniApp = 'miniApp',
    web = 'web',
}

function isValidPlatform(maybePlatform: string): maybePlatform is Platform {
    return Object.values(Platform).includes(maybePlatform as Platform)
}

export const wxLoginHandler: RequestHandler = async (req, res, next) => {
    const { loginPlatform } = req.params

    const { loginCode } = req.body

    if (!loginCode) {
        res.status(400).json({ message: '没有收到 loginCode' })
        return
    }

    if (!isValidPlatform(loginPlatform)) {
        res.status(400).json({ message: `platform 参数错误: ${loginPlatform}` })
        return
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
        const message = `获取 union id 失败: ${errorMessage}`
        logger.error(message)

        return res.status(500).json({ message })
    }

    // 根据 union id 查找 user
    let user: IUser | null = null
    try {
        user = await User.findOne({ wxUnionId })
    } catch (err) {
        logger.error(err)
        return next(err)
    }

    // 如果不存在 user，就创建一个新的 user
    if (!user) {
        logger.info(`新用户：${wxUnionId}`)
        try {
            user = await User.createNewUser(wxUnionId)
        } catch (err) {
            logger.error(err)
            return next(err)
        }
    }

    // 生成 token 并返回
    let token: string
    try {
        token = user.createToken()
    } catch (err) {
        logger.error(err)
        return next(err)
    }

    return res.status(201).json({ token })
}
