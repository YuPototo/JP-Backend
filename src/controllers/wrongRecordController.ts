import type { RequestHandler } from 'express'

import WrongRecord from '@/models/wrongRecord'

export const getWrongRecords: RequestHandler = async (req, res, next) => {
    try {
        const wrongRecords = await WrongRecord.find({
            user: req.user,
        })
        const questionSetIds = wrongRecords.map(
            (wrongRecord) => wrongRecord.questionSet,
        )
        res.json({ questionSetIds })
    } catch (err) {
        next(err)
    }
}

export const createWrongRecord: RequestHandler = async (req, res, next) => {
    const { questionSetId } = req.params

    try {
        const wrongRecord = await WrongRecord.findOne({
            user: req.user._id,
            questionSet: questionSetId,
        })

        if (wrongRecord) {
            return res.status(201).json({
                message: 'Wrong record already exists',
            })
        }
    } catch (err) {
        next(err)
        return
    }

    try {
        const newWrongRecord = new WrongRecord({
            user: req.user._id,
            questionSet: questionSetId,
        })

        await newWrongRecord.save()

        return res.status(201).json({
            message: 'Wrong record created',
        })
    } catch (err) {
        return next(err)
    }
}

export const deleteWrongRecord: RequestHandler = async (req, res, next) => {
    const { questionSetId } = req.params

    try {
        const wrongRecord = await WrongRecord.findOne({
            user: req.user._id,
            questionSet: questionSetId,
        })

        if (!wrongRecord) {
            return res.status(200).json({
                message: 'Wrong record not found',
            })
        }

        await wrongRecord.delete()

        return res.status(200).json({
            message: 'Wrong record deleted',
        })
    } catch (err) {
        return next(err)
    }
}
