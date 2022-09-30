import { concatStrings } from '../createPrepayOrder'

describe('concatStrings', () => {
    it('should append text', () => {
        const result = concatStrings('a', 'b')
        expect(result).toBe('a\nb\n')
    })
})
