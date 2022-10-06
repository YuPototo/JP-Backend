import config from '@/config/config'
import constants from '@/constants'
import COS from 'cos-nodejs-sdk-v5'
import { logger } from '../logger/winstonLogger'

const cos = new COS({
    SecretId: config.tencentCloud.id,
    SecretKey: config.tencentCloud.key,
})

export function hasObject(key: string) {
    return new Promise<boolean>((resolve, reject) => {
        cos.getBucket(
            {
                Bucket: constants.bucketId,
                Region: constants.bucketRegion,
                Prefix: key,
            },
            function (err, data) {
                if (err) {
                    logger.error('获取腾讯云 COS bucket 数据失败')
                    logger.error(err)
                    reject(err)
                }
                const hasObject = data.Contents.length > 0
                resolve(hasObject)
            },
        )
    })
}

export function upload(file: Buffer, key: string) {
    return new Promise<COS.PutObjectAclResult>((resolve, reject) => {
        cos.putObject(
            {
                Bucket: constants.bucketId,
                Region: constants.bucketRegion,
                Key: key,
                StorageClass: 'STANDARD',
                Body: file,
            },
            function (err, data) {
                if (err) {
                    logger.error('上传腾讯云 COS 失败')
                    logger.error(err)
                    reject(err)
                }

                resolve(data)
            },
        )
    })
}

const cosMethods = {
    upload,
    hasObject,
}

export class ImageFormatError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ImageFormatError'
    }
}

export class AudioFormatError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AudioFormatError'
    }
}

export default cosMethods
