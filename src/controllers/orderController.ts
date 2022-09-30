import type { RequestHandler } from 'express'
import Order from '@/models/order'
import Good from '@/models/good'
import wxServices from '@/wxService'

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
        outTradeNo: order.tradeId,
        description: good.name,
        amountTotal: good.price,
    }

    try {
        const prepayOrder = await wxServices.createPrepayOrder(payload)
        return res.status(201).json({ prepayOrder })
    } catch (err) {
        // todo: handle payment error
        next(err)
        return
    }
}
