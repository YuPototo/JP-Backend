import { nanoid } from '@/utils/nanoid'
import wxServiceConstants from './constants'
import { createAuthToken, createTextToSign, sign } from './createAuthToken'
import fetch, { Request } from 'cross-fetch'
import { logger } from '@/utils/logger/winstonLogger'

const JSAPI_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi'
const JSAPI_PATH = '/v3/pay/transactions/jsapi'

export const concatStrings = (...args: string[]): string => {
    return args.join('\n') + '\n'
}

/* 
JSAPI
https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_1.shtml 
*/

// interface WxOrderInfo {
//     trade_state:
//         | 'SUCCESS'
//         | 'REFUND'
//         | 'NOTPAY'
//         | 'CLOSED'
//         | 'REVOKED'
//         | 'USERPAYING'
//         | 'PAYERROR'
// }

interface JsApiError {
    code: string | number
    message: string
}

// JS API 下单成功后的返回值
interface JsApiSuccessRes {
    prepay_id: string
}

interface JsApiBody {
    mchid: string
    out_trade_no: string
    appid: string
    description: string
    notify_url: string
    amount: {
        total: number
        currency: 'CNY'
    }
    payer: {
        openid: string
    }
}

interface PrepayData {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
}

const createPackage = (prepayId: string) => {
    return `prepay_id=${prepayId}`
}

interface CreateOrderArgs {
    mchid: string
    appid: string
    notifyUrl: string
    outTradeNo: string
    description: string
    amountTotal: number
    openId: string
}

const createOrderBody = (args: CreateOrderArgs): JsApiBody => {
    const {
        mchid,
        appid,
        notifyUrl,
        outTradeNo,
        description,
        amountTotal,
        openId,
    } = args
    return {
        mchid,
        appid,
        notify_url: notifyUrl,

        out_trade_no: outTradeNo,
        description,
        amount: {
            total: amountTotal,
            currency: 'CNY',
        },
        payer: {
            openid: openId,
        },
    }
}

interface OrderPayload {
    openId: string
    outTradeNo: string
    description: string
    amountTotal: number
}

/**
 * 创建微信支付的 prepay 订单
 */
export const createPrepayOrder = async (
    payload: OrderPayload,
): Promise<PrepayData> => {
    const { openId, outTradeNo, description, amountTotal } = payload

    const nonceStr = nanoid(32)
    const timeStamp = Math.floor(Date.now() / 1000).toString()

    const body = createOrderBody({
        mchid: wxServiceConstants.merchantId,
        appid: wxServiceConstants.miniAppId,
        notifyUrl: wxServiceConstants.merchantNotifyUrl,
        openId,
        outTradeNo: outTradeNo,
        description,
        amountTotal,
    })

    const textToSign = createTextToSign(
        'POST',
        JSAPI_PATH,
        timeStamp,
        nonceStr,
        JSON.stringify(body),
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
        'Content-Type': 'application/json',
    }

    const request = new Request(JSAPI_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    })

    const res = await fetch(request)

    if (res.status >= 400) {
        const resData: JsApiError = await res.json()
        const message = `获取微信支付 prepay 订单失败。状态码：${res.status}。`
        logger.error(`微信支付返回的消息：${resData.message}`)
        throw new Error(message)
    }

    const resData: JsApiSuccessRes = await res.json()

    const prepayText = concatStrings(
        wxServiceConstants.miniAppId,
        timeStamp,
        nonceStr,
        createPackage(resData.prepay_id),
    )
    const prePaySignature = sign(
        wxServiceConstants.merchantPrivateKey,
        prepayText,
    )

    return {
        timeStamp: timeStamp,
        nonceStr,
        package: createPackage(resData.prepay_id),
        signType: 'RSA',
        paySign: prePaySignature,
    }
}
