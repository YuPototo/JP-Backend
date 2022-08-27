import { createApp } from './app'
import db from '@/utils/db/dbSingleton'
import redis from '@/utils/redis/cacheSingleton'

import logger from '@/utils/logger/logger'
import { getErrorMessage } from './utils/errorUtil/errorHandler'

import config from '@/config/config'

// import addFakeData from './devScripts/fakeData'

redis
    .open()
    .then(() => {
        db.open()
    })
    .then(() => createApp())
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`)
        })
    })
    .then(() => {
        //  todo: add fake data
        // addFakeData()
    })
    .catch((err) => {
        logger.error(getErrorMessage(err))
    })
