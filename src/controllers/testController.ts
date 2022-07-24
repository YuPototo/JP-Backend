import Dummy from '@/models/dummy'
import { RequestHandler } from 'express'

export const simpleTestController: RequestHandler = async (req, res) => {
    res.json({ message: 'This is a message return from bakcend API' })
}

export const createDummy: RequestHandler = async (req, res, next) => {
    const name = req.body.name

    if (name === undefined) {
        return res.status(400).json({ message: 'name is required' })
    }

    try {
        const dummy = new Dummy({ name })
        await dummy.save()
        res.status(201).json({ dummy })
        return
    } catch (error) {
        next(error)
    }
}
