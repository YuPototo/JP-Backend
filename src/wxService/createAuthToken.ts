import crypto from 'crypto'

export const createTextToSign = (
    method: string,
    url: string,
    timestamp: string,
    nonceStr: string,
    body: string,
): string => {
    return `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`
}

export const sign = (prvateKey: string, text: string) => {
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(text)
    signer.end()
    const signature = signer.sign(prvateKey, 'base64')
    return signature
}

interface CreateAuthArgs {
    mchId: string
    serialNo: string
    nonceStr: string
    timeStamp: string | number
    signature: string
}

export const createAuthToken = (args: CreateAuthArgs): string => {
    const { mchId, serialNo, nonceStr, timeStamp, signature } = args
    return `mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timeStamp}",serial_no="${serialNo}"`
}
