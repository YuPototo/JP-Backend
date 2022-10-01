import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import Section from '../../models/section'
import testUtils from '../../utils/testUtils/testUtils'
import { Role } from '../../models/user'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await db.close()
})

/**
 * 修改 section
 */
describe('PATCH /sections/:sectionId', () => {
    let editorUserId: string
    let editorToken: string

    beforeAll(async () => {
        editorUserId = await testUtils.createUser({ role: Role.Admin })
        editorToken = await testUtils.createToken(editorUserId)
    })

    it('shoud require auth', async () => {
        const res = await request(app).patch(
            '/api/v1/sections/61502602e94950fbe7a0075d',
        )
        expect(res.statusCode).toBe(401)
    })

    it('should not allow normal user to visit', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)
        const res = await request(app)
            .patch('/api/v1/sections/61502602e94950fbe7a0075d')
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(401)
    })

    it('should check request input', async () => {
        const res = await request(app)
            .patch('/api/v1/sections/61502602e94950fbe7a0075d')
            .set('Authorization', `Bearer ${editorToken}`)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('标题不能为空')
    })

    it('should return 404 if section not exists', async () => {
        const res = await request(app)
            .patch('/api/v1/sections/61502602e94950fbe7a0075d')
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ title: 'test' })
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toBe('Section 不存在')
    })

    it('should update section', async () => {
        const section = new Section({
            title: 'test',
            chapters: [],
        })

        await section.save()

        const sectionBefore = await Section.findById(section.id)
        expect(sectionBefore).not.toBeNull()

        const res = await request(app)
            .patch(`/api/v1/sections/${section.id}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .send({ title: 'new_title' })
        expect(res.statusCode).toBe(200)
        expect(res.body.section.title).toBe('new_title')

        const sectionAfter = await Section.findById(section.id)
        expect(sectionAfter!.title).toBe('new_title')
    })
})
