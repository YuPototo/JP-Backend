import User, { Role } from '../user'
import Notebook from '../notebook'
import config from '../../config/config'
import db from '../../utils/db/dbSingleton'
import jwt from 'jsonwebtoken'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await db.close()
})

afterEach(async () => {
    await User.deleteMany({})
})

describe('create user with new keyword', () => {
    afterEach(async () => {
        await User.deleteMany({})
    })

    it('should create user', async () => {
        const displayId = await User.createDisplayId(6)
        const wxUnionId = 'wxUnionId'
        const user = new User({ displayId, wxUnionId })
        await user.save()

        const userFound = await User.findOne({ wxUnionId })

        expect(userFound).not.toBeNull()
        expect(userFound!.displayId).toEqual(displayId)
        expect(userFound!.wxUnionId).toEqual(wxUnionId)
        expect(userFound!.createdAt).not.toBeNull()
        expect(userFound!.role).toBe(Role.User)
    })

    it('should throw error when displayId is not unique', async () => {
        const displayId = '123456'
        const user = new User({ displayId, wxUnionId: 'wxUnionId_1' })
        await user.save()

        const user2 = new User({
            displayId,
            wxUnionId: 'wxUnionId_2',
        })

        await expect(user2.save()).rejects.toThrow(/displayId/)
    })

    it('should throw error when wxUnionId is not unique', async () => {
        const user = new User({
            displayId: await User.createDisplayId(6),
            wxUnionId: 'wxUnionId_1',
        })
        await user.save()

        const user2 = new User({
            displayId: await User.createDisplayId(6),
            wxUnionId: 'wxUnionId_1',
        })

        await expect(user2.save()).rejects.toThrow(/wxUnionId/)
    })
})

describe('static method createDisplayId()', () => {
    it('should generate a display id', async () => {
        const displayId = await User.createDisplayId(6)
        expect(displayId.length).toBe(6)
        expect(displayId).toMatch(/^[0-9]{6}$/)
    })

    it('should generate a unique display id', async () => {
        const displayId = await User.createDisplayId(6)
        const displayId2 = await User.createDisplayId(6)
        expect(displayId).not.toEqual(displayId2)
    })
})

describe('static method createNewUser()', () => {
    afterEach(async () => {
        await User.deleteMany({})
    })

    it('should create a new user with wxUnionId', async () => {
        const wxUnionId = 'wxUnionId'
        const user = await User.createNewUser(wxUnionId)
        expect(user.wxUnionId).toEqual(wxUnionId)

        const userFound = await User.findOne({ wxUnionId })
        expect(userFound).not.toBeNull()
    })

    it('should throw error when wxUnionId is not unique', async () => {
        const wxUnionId = 'wxUnionId'
        const user = await User.createNewUser(wxUnionId)
        expect(user.wxUnionId).toEqual(wxUnionId)

        await expect(User.createNewUser(wxUnionId)).rejects.toThrow(/wxUnionId/)
    })

    it('should create a user with wxUnionId and wxMiniOpenId', async () => {
        const wxUnionId = 'wxUnionId'
        const wxMiniOpenId = 'wxMiniOpenId'
        const user = await User.createNewUser(wxUnionId, wxMiniOpenId)
        expect(user.wxUnionId).toEqual(wxUnionId)
        expect(user.wxMiniOpenId).toEqual(wxMiniOpenId)

        const userFound = await User.findOne({ wxUnionId, wxMiniOpenId })
        expect(userFound).not.toBeNull()
    })
})

describe('static method generate token()', () => {
    it('should generate a token', async () => {
        const user = await User.createNewUser('wxUnionId')
        const token = await user.createToken()
        expect(token).not.toBeNull()

        const decoded = jwt.verify(token, config.appSecret)
        expect(decoded).toHaveProperty('id')

        //@ts-ignore
        const userFound = await User.findById(decoded.id)
        expect(userFound).not.toBeNull()
    })
})

describe('json()', () => {
    it('should return jsonified obj', async () => {
        const user = await User.createNewUser('wxUnionId')
        expect(user.toJSON()).toMatchObject({
            displayId: expect.any(String),
            quizChance: expect.any(Number),
        })
    })

    it('should return isMember', async () => {
        const user = await User.createNewUser('wxUnionId')
        expect(user.toJSON()).toMatchObject({
            displayId: expect.any(String),
            quizChance: expect.any(Number),
            isMember: false,
        })
    })
})

describe('when usr is created, should create default notebook', () => {
    it('should create default notebook', async () => {
        const user = await User.createNewUser('wxUnionId')
        const notebook = await Notebook.findOne({
            user: user._id,
            isDefault: true,
        })
        expect(notebook).not.toBeNull()
    })
})
