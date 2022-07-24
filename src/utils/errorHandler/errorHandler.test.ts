import { isErrorWithMessage, toErrorWithMessage } from './index'

describe('isErrorWithMessage()', () => {
    it('should return false when arg is not object', () => {
        expect(isErrorWithMessage('string')).toBe(false)
    })

    it('should return false when error is null', () => {
        expect(isErrorWithMessage(null)).toBe(false)
    })

    it('should return false when error has no message property', () => {
        expect(isErrorWithMessage({})).toBe(false)
    })

    it('should return false when error message is not string', () => {
        expect(isErrorWithMessage({ message: 1 })).toBe(false)
    })

    it('should return true when error is Error with message property', () => {
        expect(isErrorWithMessage({ message: 'string' })).toBe(true)
    })
})

describe('toErrorWithMessage', () => {
    it('should return an error with message when error is string', () => {
        const maybeError = 'string'
        const error = toErrorWithMessage(maybeError)
        expect(error.message).toMatch(/string/) // 会返回 "string"
    })
})
