import User, { IUserDoc } from '../user'
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

        const userFound = await User.findOne()

        expect(userFound).not.toBeNull()
        expect(userFound!.displayId).toEqual(displayId)
        expect(userFound!.wxUnionId).toEqual(wxUnionId)
        expect(userFound!.createdAt).not.toBeNull()
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

    it('should create a new user', async () => {
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
})

describe('static method generate token()', () => {
    let user: IUserDoc

    beforeAll(async () => {
        user = new User({ wxUnionId: 'wxUnionId', displayId: 'displayId' })
        await user.save()
    })

    it('should generate a token', async () => {
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
    let user: IUserDoc

    it('should return display id', async () => {
        user = new User({ wxUnionId: 'wxUnionId', displayId: 'displayId' })
        await user.save()
        expect(user.toJSON()).toEqual({ displayId: 'displayId' })
    })
})

describe('when usr is created, should create default notebook', () => {
    it('should create default notebook', async () => {
        const user = new User({
            wxUnionId: 'wxUnionId',
            displayId: 'displayId',
        })
        await user.save()

        const notebook = await Notebook.findOne({
            user: user._id,
            isDefault: true,
        })
        expect(notebook).not.toBeNull()
    })
})
