import { Schema, Document, model, Model } from 'mongoose'
import jwt from 'jsonwebtoken'

import config from '@/config/config'

const COLLECTION_NAME = 'user'

// Book
export interface IUser extends Document {
    displayId: string
    wxUnionId: string
    createdAt: Date
    updatedAt: Date

    createToken: () => string
}

export interface UserModel extends Model<IUser> {
    createDisplayId(length: number): string
    createNewUser(wxUnionId: string): Promise<IUser>
}

const userSchema = new Schema<IUser, UserModel>(
    {
        displayId: { type: String, required: true, unique: true },
        wxUnionId: { type: String, required: true, unique: true },
    },
    { collection: COLLECTION_NAME, timestamps: true },
)

/* Static Methods */
userSchema.statics.createDisplayId = async function (length: number) {
    const isUnique = false
    while (!isUnique) {
        const randomDisplayId = createRandomId(length)
        const user = await this.findOne({ displayId: randomDisplayId })
        if (!user) {
            return randomDisplayId
        }
    }
}

userSchema.statics.createNewUser = async function (wxUnionId: string) {
    const displayId = await this.createDisplayId(6)
    const user = await this.create({ displayId, wxUnionId })
    return user
}

/* Instance Methods */
userSchema.set('toJSON', {
    transform: function (doc: IUser, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

userSchema.methods.createToken = function () {
    const payload = { id: this._id }
    const token = jwt.sign(payload, config.appSecret, {
        expiresIn: config.jwtExpireDays,
    })
    return token
}

export const User = model<IUser, UserModel>('User', userSchema)

export default User

function createRandomId(length: number) {
    let result = ''
    const characters = '0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        )
    }
    return result
}