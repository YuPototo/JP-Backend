import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { addDays } from 'date-fns'

import wxService from '../../wxService'

import { createApp } from '../../app'
import db from '../../utils/db/dbSingleton'
import User, { Role } from '../../models/user'
import testUtils from '../../utils/testUtils/testUtils'

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
    const mock = jest.spyOn(wxService, 'getIdByMiniAppCode')

    afterEach(async () => {
        await User.deleteMany({})
    })

    // 场景：新用户首次登录发生在小程序
    it('should create a new user when wxUnionId is new', async () => {
        const wxUnionId = 'wxUnionId'
        const wxMiniOpenId = 'wxMiniOpenId'
        const userBefore = await User.findOne({ wxUnionId, wxMiniOpenId })
        expect(userBefore).toBeNull()

        mock.mockImplementation(() =>
            Promise.resolve({ wxUnionId, wxMiniOpenId }),
        )

        const loginCode = 'loginCode'
        const response = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode })
        expect(mock).toHaveBeenCalledWith(loginCode)
        expect(response.status).toBe(201)
        expect(response.body.token).toBeDefined()

        const userAfter = await User.findOne({ wxUnionId, wxMiniOpenId })
        expect(userAfter).not.toBeNull()
    })

    // 场景：老用户在小程序登录（之前已经在小程序登录过）
    it('should not create a new user when wxUnionId is old', async () => {
        const wxUnionId = 'wxUnionId'
        const wxMiniOpenId = 'wxMiniOpenId'
        mock.mockImplementation(() =>
            Promise.resolve({ wxUnionId, wxMiniOpenId }),
        )
        const user_t0 = await User.findOne({ wxUnionId, wxMiniOpenId })
        expect(user_t0).toBeNull()

        // 首次登录：创建用户
        const responseOne = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode: 'loginCode_1' })
        expect(responseOne.status).toBe(201)

        const user_t1 = await User.findOne({ wxUnionId, wxMiniOpenId })
        expect(user_t1).not.toBeNull()

        // 再次登录
        const responseTwo = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode: 'loginCode_2' })
        expect(responseTwo.status).toBe(201)
        const user_t2 = await User.findOne({ wxUnionId, wxMiniOpenId })
        expect(user_t2!.id).toBe(user_t1!.id)
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
        const wxUnionId = 'wxUnionId'
        const wxMiniOpenId = 'wxMiniOpenId'
        mock.mockImplementation(() =>
            Promise.resolve({ wxUnionId, wxMiniOpenId }),
        )
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

        mock.mockImplementation(() => Promise.resolve({ wxUnionId }))

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

describe('微信登录：网页和小程序先后登陆', () => {
    const mockGetIdByMiniAppCode = jest.spyOn(wxService, 'getIdByMiniAppCode')
    const mockGetUnionIdByWebCode = jest.spyOn(wxService, 'getUnionIdByWebCode')

    afterEach(async () => {
        await User.deleteMany({})
    })

    it('先小程序后网页', async () => {
        const wxUnionId = 'wxUnionId'
        const wxMiniOpenId = 'wxMiniOpenId'
        mockGetIdByMiniAppCode.mockImplementation(() =>
            Promise.resolve({ wxUnionId, wxMiniOpenId }),
        )
        mockGetUnionIdByWebCode.mockImplementation(() =>
            Promise.resolve({ wxUnionId }),
        )

        // 先小程序登录
        const loginCodeMiniApp = 'loginCodeMiniApp'
        const responseMiniApp = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode: loginCodeMiniApp })
        expect(responseMiniApp.status).toBe(201)
        expect(responseMiniApp.body.token).toBeDefined()

        // 再网页登录
        const loginCodeWeb = 'loginCodeWeb'
        const responseWeb = await request(app)
            .post('/api/v1/users/login/wx/web')
            .send({ loginCode: loginCodeWeb })
        expect(responseWeb.status).toBe(201)
        expect(responseWeb.body.token).toBeDefined()

        // 确认只创建了一个用户
        const users = await User.find({})
        expect(users.length).toBe(1)
    })

    it('先网页后小程序', async () => {
        const wxUnionId = 'wxUnionId'
        const wxMiniOpenId = 'wxMiniOpenId'
        mockGetIdByMiniAppCode.mockImplementation(() =>
            Promise.resolve({ wxUnionId, wxMiniOpenId }),
        )
        mockGetUnionIdByWebCode.mockImplementation(() =>
            Promise.resolve({ wxUnionId }),
        )

        // 先网页登录
        const loginCodeWeb = 'loginCodeWeb'
        const responseWeb = await request(app)
            .post('/api/v1/users/login/wx/web')
            .send({ loginCode: loginCodeWeb })
        expect(responseWeb.status).toBe(201)
        expect(responseWeb.body.token).toBeDefined()

        // 确认此时没有 open id
        const userBefore = await User.findOne({ wxUnionId })
        expect(userBefore!.wxMiniOpenId).not.toBeDefined()

        // 再小程序登录
        const loginCodeMiniApp = 'loginCodeMiniApp'
        const responseMiniApp = await request(app)
            .post('/api/v1/users/login/wx/miniApp')
            .send({ loginCode: loginCodeMiniApp })
        expect(responseMiniApp.status).toBe(201)
        expect(responseMiniApp.body.token).toBeDefined()

        // 确认只创建了一个用户
        const users = await User.find({})
        expect(users.length).toBe(1)

        // 确认此时有 open id
        const userAfter = await User.findOne({ wxUnionId })
        expect(userAfter!.wxMiniOpenId).toBeDefined()
    })
})

describe('PUT /users/reduceQuizChance', () => {
    it('should require auth', async () => {
        const res = await request(app).put(`/api/v1/users/reduceQuizChance`)
        expect(res.statusCode).toBe(401)
    })

    it('should reducer user quiz chances', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const user = await User.findById(userId)
        const quizChanceBefore = user!.quizChance

        const res = await request(app)
            .put(`/api/v1/users/reduceQuizChance`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)

        const userAfter = await User.findById(userId)
        const quizChanceAfter = userAfter!.quizChance
        expect(quizChanceAfter).toBe(quizChanceBefore - 1)
    })
})

describe('GET /users', () => {
    it('should require auth', async () => {
        const res = await request(app).get(`/api/v1/users`)
        expect(res.statusCode).toBe(401)
    })

    it('should return user info', async () => {
        const userId = await testUtils.createUser()
        const token = await testUtils.createToken(userId)

        const res = await request(app)
            .get(`/api/v1/users`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)

        expect(res.body.user).toMatchObject({
            displayId: expect.any(String),
            quizChance: expect.any(Number),
            isMember: false,
        })
    })

    // 对于会员，返回还有几天到期
    it('should return memberDays', async () => {
        const memberDueDate = addDays(new Date(), 11)
        const userId = await testUtils.createUser({ memberDueDate })
        const token = await testUtils.createToken(userId)

        const res = await request(app)
            .get(`/api/v1/users`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.user).toMatchObject({
            displayId: expect.any(String),
            quizChance: expect.any(Number),
            isMember: true,
            memberDays: 10,
        })
    })

    // 对于已过期会员，返回过期时间
    it('should return memberDays', async () => {
        const memberDueDate = addDays(new Date(), -10)
        const userId = await testUtils.createUser({ memberDueDate })
        const token = await testUtils.createToken(userId)

        const res = await request(app)
            .get(`/api/v1/users`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.user).toMatchObject({
            displayId: expect.any(String),
            quizChance: expect.any(Number),
            isMember: false,
            memberDays: -10,
        })
    })
})

describe('后台登录', () => {
    beforeAll(async () => {
        const user = await User.createNewUser('wxUnionId')

        user.adminPassword = 'adminPassword'
        user.adminUsername = 'adminUsername'
        user.role = Role.Admin
        await user.save()
    })

    afterAll(async () => {
        await User.deleteMany({})
    })

    it('should check body', async () => {
        const res = await request(app).post('/api/v1/users/login/admin')
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('需要 username')

        const res2 = await request(app).post('/api/v1/users/login/admin').send({
            username: 'username',
        })
        expect(res2.status).toBe(400)
        expect(res2.body.message).toBe('需要 password')

        const res3 = await request(app).post('/api/v1/users/login/admin').send({
            password: 'password',
        })
        expect(res3.status).toBe(400)
        expect(res3.body.message).toBe('需要 username')
    })

    it('should return 404 if username not found', async () => {
        const res = await request(app).post('/api/v1/users/login/admin').send({
            username: 'some_username',
            password: 'password',
        })
        expect(res.status).toBe(404)
        expect(res.body.message).toBe('找不到用户')
    })

    it('should return 400 if usernamd and password not match', async () => {
        const res = await request(app).post('/api/v1/users/login/admin').send({
            username: 'adminUsername',
            password: 'wrongPassWord',
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('密码错误')
    })

    it('should return token and user info if matched', async () => {
        const res = await request(app).post('/api/v1/users/login/admin').send({
            username: 'adminUsername',
            password: 'adminPassword',
        })
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
            token: expect.any(String),
            user: {
                adminUsername: 'adminUsername',
                role: Role.Admin,
            },
        })
    })
})
