import request from 'supertest'
import { Express } from 'express-serve-static-core'

import wxService from '../../wxService'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import User from '../../models/user'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await db.close()
})

describe('微信登录', () => {
    it('should require loginCode in body', async () => {
        const response = await request(app).post(
            '/api/v1/users/login/wx/miniApp',
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('没有收到 loginCode')
    })

    it('should check platform parameter', async () => {
        const response = await request(app)
            .post('/api/v1/users/login/wx/wrongPlatform')
            .send({ loginCode: '123' })
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('platform 参数错误: wrongPlatform')
    })
})

describe('微信登录：小程序 ', () => {
    const mock = jest.spyOn(wxService, 'getUnionIdByMiniAppCode')

    afterEach(async () => {
        await User.deleteMany({})
    })

    it('should create a new user when wxUnionId is new', async () => {
        const wxUnionId = 'wxUnionId'
        const userBefore = await User.findOne({ wxUnionId })
        expect(userBefore).toBeNull()

        mock.mockImplementation(() => Promise.resolve(wxUnionId))

        const loginCode = 'loginCode'
        const response = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode })
        expect(mock).toHaveBeenCalledWith(loginCode)
        expect(response.status).toBe(201)
        expect(response.body.token).toBeDefined()

        const userAfter = await User.findOne({ wxUnionId })
        expect(userAfter).not.toBeNull()
    })

    it('should not create a new user when wxUnionId is old', async () => {
        mock.mockImplementation(() => Promise.resolve('wxUnionId'))

        const count_1 = await User.countDocuments({})

        const loginCode = 'loginCode'
        const responseOne = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode })
        expect(responseOne.status).toBe(201)

        const count_2 = await User.countDocuments({})
        expect(count_2).toBe(count_1 + 1)

        const responseTwo = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode })
        expect(responseTwo.status).toBe(201)

        const count_3 = await User.countDocuments({})
        expect(count_3).toBe(count_1 + 1)
    })

    it('should return error message when wxService.getUnionIdByMiniAppCode fails', async () => {
        mock.mockImplementation(() => Promise.reject(new Error('some error')))

        const loginCode = 'loginCode'
        const response = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode })
        expect(response.status).toBe(500)
        expect(response.body.message).toMatch(/获取 union id 失败/)
        expect(response.body.message).toMatch(/some error/)
    })

    it('should return user info', async () => {
        mock.mockImplementation(() => Promise.resolve('wxUnionId'))

        const loginCode = 'loginCode'
        const res = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode })
        expect(res.status).toBe(201)
        expect(res.body.user).toBeDefined()

        expect(res.body.user).toMatchObject({
            displayId: expect.any(String),
        })

        expect(res.body.user).not.toHaveProperty('wxUnionId')
    })
})

describe('微信登录：网页版', () => {
    const mock = jest.spyOn(wxService, 'getUnionIdByWebCode')

    afterEach(async () => {
        await User.deleteMany({})
    })

    it('should call getUnionIdByWebCode', async () => {
        const wxUnionId = 'wxUnionId'
        const userBefore = await User.findOne({ wxUnionId })
        expect(userBefore).toBeNull()

        mock.mockImplementation(() => Promise.resolve(wxUnionId))

        const loginCode = 'loginCode'
        const response = await request(app)
            .post('/api/v1/users/login/wx/web')
            .send({ loginCode })
        expect(mock).toHaveBeenCalledWith(loginCode)

        expect(response.status).toBe(201)
        expect(response.body.token).toBeDefined()

        const userAfter = await User.findOne({ wxUnionId })
        expect(userAfter).not.toBeNull()
    })
})
