import { createApp } from './app'
import db from '@/utils/db/dbSingleton'
import redis from '@/utils/redis/redisSingleton'

import logger from '@/utils/logger/logger'
import { getErrorMessage } from './utils/errorUtil/errorHandler'

import config from '@/config/config'
import { createWrongRecordScheduler } from './utils/schedule/wrongRecordClean'

// import addFakeData from './devScripts/fakeData'

db.open()
    .then(createApp)
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on port ${config.port}`)
        })
        createWrongRecordScheduler()
    })
    .then(() => {
        redis.open()
    })
    .then(() => {
        //  todo: remove this line
        // addFakeData()
    })
    .catch((err) => {
        logger.error(getErrorMessage(err))
    })
