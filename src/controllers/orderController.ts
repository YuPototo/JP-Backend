import type { RequestHandler } from 'express'
import Order, { OrderStatus } from '@/models/order'
import Good from '@/models/good'
import wxServices from '@/wxService'
import { decipherGCM } from '@/utils/decipher'
import wxServiceConstants from '@/wxService/constants'
import User from '@/models/user'
import { logger } from '@/utils/logger/winstonLogger'

export const createOrder: RequestHandler = async (req, res, next) => {
    const { goodId } = req.body

    if (!goodId) {
        res.status(400).json({ message: 'body 缺少 goodId' })
        return
    }

    let good
    try {
        good = await Good.findById(goodId)
    } catch (err) {
        next(err)
        return
    }

    if (!good) {
        res.status(400).json({ message: '商品不存在' })
        return
    }

    // 生成我的订单
    const order = new Order({
        good: goodId,
        user: req.user,
        payAmount: good.price,
    })

    try {
        await order.save()
    } catch (err) {
        next(err)
        return
    }

    // 请求下单接口，创建订单
    const payload = {
        openId: req.user.wxMiniOpenId as string, // 在小程序里支付时，一定存在
        outTradeNo: order.id,
        description: good.name,
        amountTotal: good.price,
    }

    try {
        const prepayOrder = await wxServices.createPrepayOrder(payload)
        return res.status(201).json({ prepayOrder })
    } catch (err) {
        next(err)
        return
    }
}

interface PaySuccess {
    id: string
    create_time: string
    resource_type: string
    event_type: string
    summary: string
    resource: {
        original_type: string
        algorithm: 'AEAD_AES_256_GCM'
        ciphertext: string
        associated_data: string
        nonce: string
    }
}

interface ResourceData {
    mchid: string
    appid: string
    out_trade_no: string
    transaction_id: string
    trade_type: string
    trade_state: string
    trade_state_desc: string
    bank_type: string
    attach: string
    success_time: string
    payer: {
        openid: string
    }
    amount: {
        total: number
        payer_total: number
        currency: string
        payer_currency: string
    }
}

/**
 * 判断是否是支付的通知
 */
const isWeChatNotice = (obj: unknown): obj is PaySuccess => {
    return typeof obj === 'object' && obj !== null && 'event_type' in obj
}

/**
 * 接受微信的支付成功通知
 */
export const receiveNoticeHandler: RequestHandler = async (req, res, next) => {
    const reqBody = req.body

    if (!isWeChatNotice(reqBody)) {
        return res.status(400).json({ message: '不是微信支付通知' })
    }

    // 交易状态失败时，也把信息发回给微信
    if (reqBody.event_type !== 'TRANSACTION.SUCCESS') {
        return res.status(200).json({ code: 'SUCCESS', message: '收到' })
    }

    // 解密
    const { resource } = reqBody
    const { ciphertext, associated_data: associatedData, nonce } = resource

    logger.info(resource)
    const resourceText = decipherGCM(
        ciphertext,
        wxServiceConstants.merchantApiKey,
        nonce,
        associatedData,
    )

    const resourceData = JSON.parse(resourceText) as ResourceData // 技术债
    const orderId = resourceData.out_trade_no

    // 获取 orders
    let order
    try {
        order = await Order.findById(orderId)
        if (!order) {
            res.status(400).json({ code: 'FAILURE', message: '找不到订单' })
            return
        }
    } catch (err) {
        next(err)
        return
    }

    if (order.status === OrderStatus.Delivered) {
        return res.json({ code: 'SUCCESS', message: '已处理' })
    }

    // 获取 good
    let good
    try {
        good = await Good.findById(order.good)
        if (!good) {
            return res
                .status(400)
                .json({ code: 'FAILURE', message: '找不到商品' })
        }
    } catch (err) {
        next(err)
        return
    }

    // 获取用户
    let user
    try {
        user = await User.findById(order.user)
        if (!user) {
            res.status(400).json({ code: 'FAILURE', message: '找不到用户' })
            return
        }
    } catch (err) {
        next(err)
        return
    }

    // 添加会员
    try {
        await user.addMemberDays(good.memberDays)
    } catch (err) {
        next(err)
        return
    }

    // 修改订单状态
    try {
        order.status = OrderStatus.Delivered
        await order.save()
    } catch (err) {
        next(err)
        return
    }

    res.json({ code: 'SUCCESS', message: '成功' })
}
