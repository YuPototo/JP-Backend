import { getAuthToken, decipferToken } from './auth'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import config from '../config/config'

describe('getAuthToken', () => {
    it('should throw error when authHeader is undefined', () => {
        expect(() => getAuthToken(undefined)).toThrow(
            /request header 里没有 authorization/,
        )
    })

    it('should throw error when authType is not Bearer', () => {
        expect(() => getAuthToken('Basic 123')).toThrow(
            /Authorization 不是 Bearer Type/,
        )
    })

    it('should throw error when token is undefined', () => {
        expect(() => getAuthToken('Bearer')).toThrow(/authHeader 里没有 token/)
    })

    it('should return token when authHeader is valid', () => {
        expect(getAuthToken('Bearer 123')).toBe('123')
    })
})

describe('decipferToken', () => {
    it('should throw error if decipfered token is string', () => {
        const token = jwt.sign('some_string', config.appSecret)
        expect(() => decipferToken(token)).toThrow(/token 解密出来是 string/)
    })

    it('should throw error when jwt payload does not have id property', () => {
        const token = jwt.sign({ name: 'some_name' }, config.appSecret)
        expect(() => decipferToken(token)).toThrow(
            /jwt payload 里没有 id property/,
        )
    })

    it('should return id when token is valid', () => {
        const token = jwt.sign({ id: 'some_id' }, config.appSecret)
        expect(decipferToken(token)).toBe('some_id')
    })

    it('should throw JsonWebTokenError when token is invalid', () => {
        const token = jwt.sign({ id: '123' }, 'some_secret')
        expect(() => decipferToken(token)).toThrow(JsonWebTokenError)
    })

    it('should throw TokenExpiredError when token is expired', () => {
        const token = jwt.sign({ id: '123' }, config.appSecret, {
            expiresIn: '1ms',
        })
        setTimeout(() => {
            expect(() => decipferToken(token)).toThrow(TokenExpiredError)
        }, 2)
    })
})
