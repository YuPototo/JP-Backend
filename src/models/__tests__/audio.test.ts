import Audio from '../audio'

import db from '../../utils/db/dbSingleton'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await Audio.deleteMany()
    await db.close()
})

describe('Audio model', () => {
    it('should successfully save data', async () => {
        const audio = new Audio({
            key: 'audio_key',
            transcription: 'audio_transcription',
            title: 'title',
        })
        await audio.save()

        const audioDoc = await Audio.findById(audio.id)
        expect(audioDoc?.toJSON()).toMatchObject({
            id: expect.any(String),
            key: expect.any(String),
            transcription: 'audio_transcription',
        })
    })

    it('should save data when trnascription is missing', async () => {
        const audio = new Audio({
            key: 'audio_key',
            title: 'title',
        })
        await audio.save()

        const audioDoc = await Audio.findById(audio.id)
        expect(audioDoc?.toJSON()).toMatchObject({
            id: expect.any(String),
            key: expect.any(String),
        })
    })

    it('Add cdn domain to key field  ', async () => {
        const audio = new Audio({
            key: 'audio_key',
            transcription: 'audio_transcription',
            title: 'title',
        })
        await audio.save()

        const audioDoc = await Audio.findById(audio.id)
        expect(audioDoc?.toJSON()).toHaveProperty('key')
        expect(audioDoc?.toJSON().key).toEqual('https://cdn.test.com/audio_key')
    })
})
