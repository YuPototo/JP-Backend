import User, { Role } from '../../models/user'
import Book from '../../models/book'
import Chapter from '@/models/chapter'
import Notebook from '@/models/notebook'
import QuestionSet from '@/models/questionSet'
import Good from '@/models/good'
import Paramter from '@/models/parameter'
import { nanoid } from '../nanoid'
import mongoose from 'mongoose'

async function createUser(arg?: {
    memberDueDate?: Date
    role?: Role
}): Promise<string> {
    const wxUnionId = nanoid(6)

    const user = await User.createNewUser(wxUnionId)

    if (arg?.memberDueDate) {
        user.memberDue = arg.memberDueDate
        await user.save()
    }

    if (arg?.role) {
        user.role = arg.role
        await user.save()
    }

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

const createGood = async (arg?: { memberDays: number }): Promise<string> => {
    let memberDays = 31
    if (arg) {
        memberDays = arg.memberDays
    }

    const good = new Good({
        name: 'test good',
        price: 100,
        memberDays,
    })
    await good.save()
    return good.id
}

const createParameter = async ({
    key,
    value,
}: {
    key: string
    value: string
}): Promise<void> => {
    const parameter = new Paramter({
        key,
        value,
    })
    await parameter.save()
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
    createParameter,
}

export default testUtils
