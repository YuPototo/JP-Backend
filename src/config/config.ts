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
    assetDomain: string
    port: number

    adminSecret: string // 临时方案

    logger: {
        morgan: boolean
        morganBody: boolean
        loggerLevel: LogLevel
        httpLogDir: string
        errorLogDir: string
        infoLogDir: string
    }

    // mongo
    mongo: {
        url: string
        autoIndex: boolean
    }

    redisUrl: string
}

const config: Config = {
    assetDomain: parsedEnv.ASSET_DOMAIN as string,

    port: parsedEnv.PORT as number,

    adminSecret: parsedEnv.ADMIN_SECRET as string,

    logger: {
        morgan: parsedEnv.MORGAN_LOGGER as boolean,
        morganBody: parsedEnv.MORGAN_BODY_LOGGER as boolean,
        loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
        httpLogDir: parsedEnv.HTTP_LOG_DIR as string,
        errorLogDir: parsedEnv.ERROR_LOG_DIR as string,
        infoLogDir: parsedEnv.INFO_LOG_DIR as string,
    },

    mongo: {
        url: parsedEnv.MONGO_URL as string,
        autoIndex: parsedEnv.MONGO_AUTO_INDEX as boolean,
    },

    redisUrl: parsedEnv.REDIS_URL as string,
}

export default config
