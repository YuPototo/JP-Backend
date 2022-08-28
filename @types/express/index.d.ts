import { IUser } from '../../src/models/user'

declare global {
    namespace Express {
        interface Request {
            id: string
            user: IUser
        }
    }
}
