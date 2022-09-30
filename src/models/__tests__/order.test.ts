import Order from '../order'
import Good from '../good'

import db from '../../utils/db/dbSingleton'
import testUtils from '../../utils/testUtils/testUtils'

let userId: string

beforeAll(async () => {
    await db.open()
    userId = await testUtils.createUser()
})

afterAll(async () => {
    await testUtils.cleanDatabase()
    await db.close()
})

describe('Order model', () => {
    it('should create an order', async () => {
        const good = new Good({
            name: 'testGood',
            price: 100,
            memberDays: 1,
        })
        await good.save()

        const order = new Order({
            user: userId,
            good: good.id,
            payAmount: good.price,
        })
        await order.save()

        const found = await Order.findOne({ id: order.id })
        expect(found).not.toBeNull()
        expect(found?.toJSON()).toMatchObject({
            id: order.id,
            user: userId,
            good: good.id,
            payAmount: good.price,
            status: 'created',
        })
    })
})
