import { createApp } from './app'
import db from '@/utils/db/dbSingleton'
import redis from '@/utils/redis/cacheSingleton'

import logger from '@/utils/logger/logger'
import { getErrorMessage } from './utils/errorUtil/errorHandler'

import config from '@/config/config'

import Section from '@/models/section'
import Chapter from '@/models/chapter'
import Book from '@/models/book'

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
        // hack: create schema in this way
        Book.findOne()
        Section.findOne()
        Chapter.findOne()
    })
    .catch((err) => {
        logger.error(getErrorMessage(err))
    })
