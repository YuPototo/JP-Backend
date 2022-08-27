import Audio from '@/models/audio'

// audios
export async function addAudios() {
    await Audio.insertMany([
        {
            _id: '62ff846994d4a5032e425e22',
            key: 'audios/60fa250387373_2018_12_n5_1.mp3',
            title: '60fa250387373_2018_12_n5_1',
            transcription: 'This is transcription',
        },
        {
            _id: '62ff846994d4a5032e425992',
            key: 'audios/291370d3ec546a17cfa6404b66e2c4dd.mp3',
            title: '291370d3ec546a17cfa6404b66e2c4dd',
            transcription: 'This is transcription 22',
        },
        {
            _id: '62ff846994d4a5032e425882',
            key: 'not_exist.mp3',
            title: '这个资源是找不到的',
            transcription: 'not exist',
        },
    ])
}
