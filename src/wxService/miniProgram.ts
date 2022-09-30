import config from '@/config/config'
import fetch from 'cross-fetch'

/**
 * Code2Session 返回值参考：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
 */
export async function getIdByMiniAppCode(loginCode: string) {
    const appId = config.wxMiniApp.id
    const appSecret = config.wxMiniApp.secret

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${loginCode}&grant_type=authorization_code`

    const res = await fetch(url)

    const resData = await res.json()

    if (!resData.errcode) {
        if (!resData.unionid) {
            throw new Error('code2Session 请求返回的数据里没有 unionid')
        }
        return { wxUnionId: resData.unionid, wxMiniOpenId: resData.openid }
    } else {
        const messagae = `小程序获取 code2Session 请求失败: ${resData.errmsg}`
        throw new Error(messagae)
    }
}
