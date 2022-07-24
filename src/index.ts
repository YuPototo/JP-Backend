import { createApp } from './app'
import db from '@/utils/db'
import logger from '@/utils/logger'
import { getErrorMessage } from './utils/errorHandler'

import config from '@/config'

db.open()
    .then(() => createApp())
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`)
        })
    })
    .catch((err) => {
        logger.error(getErrorMessage(err))
    })
