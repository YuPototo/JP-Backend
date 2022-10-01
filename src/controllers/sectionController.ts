import type { RequestHandler } from 'express'
import Section from '@/models/section'

export const updateSection: RequestHandler = async (req, res, next) => {
    const sectionId = req.params.sectionId

    const { title } = req.body

    if (!title) {
        res.status(400).send({ message: '标题不能为空' })
        return
    }

    let section
    try {
        section = await Section.findById(sectionId)
    } catch (err) {
        next(err)
        return
    }

    if (!section) {
        res.status(404).send({ message: 'Section 不存在' })
        return
    }

    section.title = title

    try {
        await section.save()
        return res.json({ section })
    } catch (err) {
        next(err)
        return
    }
}
