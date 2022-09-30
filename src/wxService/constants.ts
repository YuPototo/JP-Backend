import config from '@/config/config'
import fs from 'fs'

const wxServiceConstants = {
    miniAppId: config.wxMiniApp.id,

    // 微信商户平台相关
    merchantId: config.wxMerchant.id,
    merchantNotifyUrl: config.wxMerchant.notifyURL,
    merchantSerialNo: config.wxMerchant.serialNo,
    merchantPrivateKey: fs.readFileSync(
        config.wxMerchant.privateKeyFile,
        'utf8',
    ),
}

export default wxServiceConstants
