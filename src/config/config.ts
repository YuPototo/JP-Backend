import dotenvExtended from 'dotenv-extended'
import dotenvParseVariables from 'dotenv-parse-variables'

import type { LogLevel } from '@/utils/logger/logger'

const env = dotenvExtended.load({
    path: process.env.ENV_FILE,
    defaults: './config/.env.defaults',
    schema: './config/.env.schema',
    includeProcessEnv: true,
    silent: false,
    errorOnMissing: true,
    errorOnExtra: true,
})

const parsedEnv = dotenvParseVariables(env)

interface Config {
    appSecret: string
    jwtExpireDays: string
    cdnDomain: string
    port: number

    logger: {
        morgan: boolean
        morganBody: boolean
        loggerLevel: LogLevel
        httpLogDir: string
        errorLogDir: string
        combinedLogDir: string
    }

    // mongo
    mongo: {
        url: string
        autoIndex: boolean
    }

    redisUrl: string

    // 小程序
    wxMiniApp: {
        id: string
        secret: string
    }

    // 网页应用：微信开放平台
    wxWebApp: {
        id: string
        secret: string
    }

    // 微信商户平台
    wxMerchant: {
        id: string
        notifyURL: string
        serialNo: string
        apiKey: string
        privateKeyFile: string
        publicKeyFile: string
    }
}

const config: Config = {
    appSecret: parsedEnv.APP_SECRET as string,
    jwtExpireDays: parsedEnv.JWT_EXPIRE_DAYS as string,

    cdnDomain: parsedEnv.CDN_DOMAIN as string,
    port: parsedEnv.PORT as number,

    logger: {
        morgan: parsedEnv.MORGAN_LOGGER as boolean,
        morganBody: parsedEnv.MORGAN_BODY_LOGGER as boolean,
        loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
        httpLogDir: parsedEnv.HTTP_LOG_DIR as string,
        errorLogDir: parsedEnv.ERROR_LOG_DIR as string,
        combinedLogDir: parsedEnv.COMBINED_LOG_DIR as string,
    },

    mongo: {
        url: parsedEnv.MONGO_URL as string,
        autoIndex: parsedEnv.MONGO_AUTO_INDEX as boolean,
    },

    redisUrl: parsedEnv.REDIS_URL as string,

    wxMiniApp: {
        id: parsedEnv.WX_MINI_APP_ID as string,
        secret: parsedEnv.WX_MINI_APP_SECRET as string,
    },

    wxWebApp: {
        id: parsedEnv.WX_WEB_APP_ID as string,
        secret: parsedEnv.WX_WEB_APP_SECRET as string,
    },

    wxMerchant: {
        id: (parsedEnv.WX_MERCHANT_ID as number).toString(),
        apiKey: parsedEnv.WX_MERCHANT_API_KEY as string,
        notifyURL: parsedEnv.WX_MERCHANT_NOTIFY_URL as string,
        serialNo: parsedEnv.WX_MERCHANT_SERIAL_NO as string,
        privateKeyFile: parsedEnv.WX_MERCHANT_PRIVATE_KEY_FILE as string,
        publicKeyFile: parsedEnv.WX_MERCHANT_PUBLIC_KEY_FILE as string,
    },
}

export default config
