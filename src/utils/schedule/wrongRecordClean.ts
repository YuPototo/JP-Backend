import schedule from 'node-schedule'

import WrongRecord from '@/models/wrongRecord'
import { logger } from '../logger/winstonLogger'

export function createWrongRecordScheduler() {
    const rule = '* 4 * * *'
    logger.info(`create schedule with config ${rule}`)

    schedule.scheduleJob(rule, function () {
        logger.info('删除过期的错题记录')
        WrongRecord.deleteOutdatedRecord(10)
    })
}
