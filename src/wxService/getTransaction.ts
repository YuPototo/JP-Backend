/* https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_2.shtml */

import { createTextToSign, sign, createAuthToken } from './createAuthToken'

import { nanoid } from '@/utils/nanoid'
import wxServiceConstants from './constants'

interface WxOrderInfo {
    trade_state:
        | 'SUCCESS'
        | 'REFUND'
        | 'NOTPAY'
        | 'CLOSED'
        | 'REVOKED'
        | 'USERPAYING'
        | 'PAYERROR'
}

export const getTransactionByOrderId = async (
    orderId: string,
): Promise<WxOrderInfo> => {
    const url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${orderId}?mchid=${wxServiceConstants.merchantId}`
    const URL_NAME = `/v3/pay/transactions/out-trade-no/${orderId}?mchid=${wxServiceConstants.merchantId}`

    const nonceStr = nanoid(32)
    const timeStamp = Math.floor(Date.now() / 1000).toString()

    const textToSign = createTextToSign(
        'GET',
        URL_NAME,
        timeStamp,
        nonceStr,
        '',
    )

    const authSignature = sign(
        wxServiceConstants.merchantPrivateKey,
        textToSign,
    )

    const authToken = createAuthToken({
        mchId: wxServiceConstants.merchantId,
        serialNo: wxServiceConstants.merchantSerialNo,
        nonceStr: nonceStr,
        timeStamp,
        signature: authSignature,
    })

    const headers = {
        Authorization: `WECHATPAY2-SHA256-RSA2048 ${authToken}`,
    }

    const res = await fetch(url, {
        headers,
    })

    if (res.status >= 400) {
        const message = `查询订单状态请求失败。状态码：${res.status}。`
        throw new Error(message)
    }

    const resData: WxOrderInfo = await res.json()

    return resData
}
