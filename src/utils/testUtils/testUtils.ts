import User from '../../models/user'
import Book from '../../models/book'
import Chapter from '@/models/chapter'
import Notebook from '@/models/notebook'
import QuestionSet from '@/models/questionSet'
import Good from '@/models/good'
import { nanoid } from '../nanoid'
import mongoose from 'mongoose'

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
    title = 'test title',
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

const createQuestionSet = async (): Promise<string> => {
    const minimalQuestionSet = {
        questions: {
            options: ['1', '2'],
            answer: 1,
        },
    }
    const questionSet = new QuestionSet(minimalQuestionSet)
    await questionSet.save()
    return questionSet.id
}

const cleanDatabase = async () => {
    await mongoose.connection.db.dropDatabase()
}

const createRandomMongoId = (): string => {
    const oid = new mongoose.Types.ObjectId()
    return oid.toString()
}

const createGood = async (): Promise<string> => {
    const good = new Good({
        name: 'test good',
        price: 100,
        memberDays: 31,
    })
    await good.save()
    return good.id
}

const testUtils = {
    createUser,
    createBook,
    createToken,
    cleanDatabase,
    createChapter,
    createNotebook,
    createQuestionSet,
    createRandomMongoId,
    createGood,
}

export default testUtils
