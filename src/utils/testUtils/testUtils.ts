import User from '../../models/user'
import Book from '../../models/book'
import BookFav from '../../models/bookFav'
import ChapterDone from '../../models/chapterDone'
import Chapter from '@/models/chapter'

const createUser = async (): Promise<string> => {
    const displayId = '123'
    const wxUnionId = 'wxUnionId'
    const user = new User({ displayId, wxUnionId })
    await user.save()
    return user.id
}

const createBook = async (): Promise<string> => {
    const book = new Book({
        title: 'test book',
        cover: 'cover_key',
        category: { key: 'test_category' },
    })
    await book.save()
    return book.id
}

const createChapter = async (): Promise<string> => {
    const chapter = new Chapter({
        title: 'test chapter',
    })
    await chapter.save()
    return chapter.id
}

const createToken = async (userId: string): Promise<string> => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('user not found')
    }
    const token = user.createToken()
    return token
}

const cleanDatabase = async () => {
    await Book.deleteMany()
    await User.deleteMany()
    await BookFav.deleteMany()
    await ChapterDone.deleteMany()
}

const testUtils = {
    createUser,
    createBook,
    createToken,
    cleanDatabase,
    createChapter,
}

export default testUtils
