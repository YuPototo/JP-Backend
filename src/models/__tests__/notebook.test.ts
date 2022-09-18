import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'
import Notebook from '../notebook'

let userId: string

beforeAll(async () => {
    await db.open()
    userId = await testUtils.createUser()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('Create Notebook', () => {
    it('should create a notebook', async () => {
        const notebook = new Notebook({
            title: 'test notebook',
            user: userId,
        })

        await notebook.save()

        const found = await Notebook.findById(notebook.id)
        expect(found).not.toBeNull()
    })
})

describe('Notebook toJSON method', () => {
    it('should not return questionSet', async () => {
        const notebook = new Notebook({
            title: 'test notebook',
            user: userId,
        })

        expect(notebook.toJSON()).toMatchObject({
            title: 'test notebook',
            isDefault: false,
            id: notebook.id,
        })
    })
})
