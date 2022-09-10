import User from '../../models/user'
import Book from '../../models/book'
import BookFav from '../../models/bookFav'
import ChapterDone from '../../models/chapterDone'
import Chapter from '@/models/chapter'
import Notebook from '@/models/notebook'
import { nanoid } from '../logger/nanoid'

const createUser = async (): Promise<string> => {
    const displayId = nanoid(6)
    const wxUnionId = nanoid(6)
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

const createNotebook = async (
    userId: string,
    title: string,
    isDefault = false,
): Promise<string> => {
    const notebook = new Notebook({
        title,
        user: userId,
        isDefault,
    })
    await notebook.save()
    return notebook.id
}

const cleanDatabase = async () => {
    await Book.deleteMany()
    await User.deleteMany()
    await BookFav.deleteMany()
    await ChapterDone.deleteMany()
    await Notebook.deleteMany()
}

const testUtils = {
    createUser,
    createBook,
    createToken,
    cleanDatabase,
    createChapter,
    createNotebook,
}

export default testUtils
