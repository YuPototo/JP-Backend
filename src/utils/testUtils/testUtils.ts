import UserModel from '../../models/user'
import BookModel from '../../models/book'
import BookFavModel from '../../models/bookFav'

const createOneUser = async (): Promise<string> => {
    const displayId = '123'
    const wxUnionId = 'wxUnionId'
    const user = new UserModel({ displayId, wxUnionId })
    await user.save()
    return user.id
}

const createOneBook = async (): Promise<string> => {
    const book = new BookModel({
        title: 'test book',
        cover: 'cover_key',
        category: { key: 'test_category' },
    })
    await book.save()
    return book.id
}

const createToken = async (userId: string): Promise<string> => {
    const user = await UserModel.findById(userId)
    if (!user) {
        throw new Error('user not found')
    }
    const token = user.createToken()
    return token
}

const cleanDatabase = async () => {
    await BookModel.deleteMany()
    await UserModel.deleteMany()
    await BookFavModel.deleteMany()
}

const testUtils = {
    createOneUser,
    createOneBook,
    createToken,
    cleanDatabase,
}

export default testUtils
