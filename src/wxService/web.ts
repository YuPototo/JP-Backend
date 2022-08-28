import config from '@/config/config'
import fetch from 'cross-fetch'

export async function getUnionIdByWebCode(loginCode: string) {
    const appId = config.wxWebApp.id
    const appSecret = config.wxWebApp.secret

    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${loginCode}&grant_type=authorization_code`

    const res = await fetch(url)

    const resData = await res.json()

    if (!resData.errcode) {
        if (resData.unionid) {
            return resData.unionid
        } else {
            throw new Error('微信 oauth2 请求返回的数据里没有 unionid')
        }
    } else {
        const messagae = `微信 oauth2 请求失败: ${resData.errmsg}`
        throw new Error(messagae)
    }
}
