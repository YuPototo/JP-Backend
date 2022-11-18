import { RequestHandler } from 'express'
import Parameter from '@/models/parameter'

export const getParameter: RequestHandler = async (req, res, next) => {
    const key = req.params.key
    try {
        const parameter = await Parameter.findOne({ key })
        if (!parameter) {
            return res.status(404).json({ message: `key not found for ${key}` })
        }
        return res.json({ key, value: parameter.value })
    } catch (err) {
        next(err)
    }
}
