import QuestionSet from '@/models/questionSet'

function addQuestionSet1(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是 question set 的 body。这是一个简单的题目。',
                },
            ],
        },
    ]

    const explanationData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一个简单的解析。',
                },
            ],
        },
    ]

    const optionOne = [
        {
            text: '这是第一个选项。',
        },
    ]

    const optionTwo = [
        {
            text: '这是第二个选项。（正确）',
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        explanation: explanationData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
    }
}

function addQuestionSet2(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是 question set 的 body。这题有2个 questions',
                },
            ],
        },
    ]

    const explanationData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一个 question set 的解析。',
                },
            ],
        },
    ]

    const body_1 = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是第1个 question 的 body。',
                },
            ],
        },
    ]

    const explanation_1 = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是第1个 question 的 explanation',
                },
            ],
        },
    ]

    const option_1_1 = [
        {
            text: '这是第1题第一个选项。',
        },
    ]

    const option_1_2 = [
        {
            text: '这是第1题第二个选项。（正确答案）',
        },
    ]

    const questionOne = {
        body: body_1,
        options: [option_1_1, option_1_2],
        answer: 1,
        explanation: explanation_1,
    }

    const option_2_1 = [
        {
            text: '这是第2题第一个选项。（正确答案）',
        },
    ]

    const option_2_2 = [
        {
            text: '这是第2题第二个选项。',
        },
    ]

    const questionTwo = {
        options: [option_2_1, option_2_2],
        answer: 0,
    }

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        explanation: explanationData,
        questions: [questionOne, questionTwo],
    }
}

// 这题有图片
function addQuestionSet3(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是 question set 的 body。这个题目会有图片出现在 question set body 和选项',
                },
            ],
        },
        {
            type: 'image',
            alt: '',
            src: 'https://picsum.photos/200/300',
            children: [{ text: '' }],
        },
    ]

    const optionOne = [
        {
            type: 'image',
            alt: '',
            src: 'https://picsum.photos/200/300',
            children: [{ text: '' }],
        },
    ]

    const optionTwo = [
        {
            type: 'image',
            alt: '',
            src: 'https://picsum.photos/200/300',
            children: [{ text: '' }],
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
    }
}

// 这是一道听力题
function addQuestionSet4(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一道听力题',
                },
            ],
        },
    ]

    const explanationData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一个简单的解析。',
                },
            ],
        },
    ]

    const optionOne = [
        {
            text: '这是第一个选项。',
        },
    ]

    const optionTwo = [
        {
            text: '这是第二个选项。',
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        explanation: explanationData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
        audio: '62ff846994d4a5032e425e22',
    }
}

// 这是又一道听力题
function addQuestionSet5(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是又一道听力题',
                },
            ],
        },
    ]

    const explanationData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一个简单的解析。',
                },
            ],
        },
    ]

    const optionOne = [
        {
            text: '这是第一个选项。',
        },
    ]

    const optionTwo = [
        {
            text: '这是第二个选项。',
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        explanation: explanationData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
        audio: '62ff846994d4a5032e425992',
    }
}

// 这道听力题的听力资源是肯定找不到的
function addQuestionSet6(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这道听力题的听力资源是肯定找不到的',
                },
            ],
        },
    ]

    const explanationData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一个简单的解析。',
                },
            ],
        },
    ]

    const optionOne = [
        {
            text: '这是第一个选项。',
        },
    ]

    const optionTwo = [
        {
            text: '这是第二个选项。',
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        explanation: explanationData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
        audio: '62ff846994d4a5032e425882',
    }
}

// 富文本：加粗、下划线、空格和假名提示
function addQuestionSet7(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是',
                },
                {
                    text: '加粗',
                    bold: true,
                },
            ],
        },
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是',
                },
                {
                    text: '下划线',
                    underline: true,
                },
            ],
        },
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是',
                },
                {
                    text: '加粗和下划线下划线',
                    underline: true,
                    bold: true,
                },
            ],
        },
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是空格',
                },
                { type: 'filler', children: [{ text: '' }] },
            ],
        },
        {
            type: 'paragraph',
            children: [
                { text: '假名提示：' },
                {
                    type: 'tip',
                    tip: '这是 tip',
                    children: [{ text: '这是文本' }],
                },
            ],
        },
    ]

    const optionOne = [
        {
            text: '这是第一个选项。',
        },
    ]

    const optionTwo = [
        {
            text: '这是第二个选项。（正确）',
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
    }
}

// 富文本：图片
function addQuestionSet8(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这个题目会有图片，出现在 question set body 和选项和解析',
                },
            ],
        },
        {
            type: 'image',
            alt: 'question set body 里的图片',
            src: 'https://picsum.photos/250/300',
            children: [{ text: '' }],
        },
        {
            type: 'paragraph',
            children: [
                {
                    text: '这个题目会有图片，出现在 question set body 和选项和解析',
                },
            ],
        },
    ]

    const explanationData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是一个简单的解析。下面也有图片链接是不存在的。',
                },
            ],
        },
        {
            type: 'image',
            alt: '解析图片',
            src: 'https://assets.riyu.love/images/not_exist.jpg',
            children: [{ text: '' }],
        },
    ]

    const optionOne = [
        {
            type: 'image',
            alt: '选项1图片',
            src: 'https://picsum.photos/200/200',
            children: [{ text: '' }],
        },
    ]

    const optionTwo = [
        {
            type: 'image',
            alt: '选项2图片',
            src: 'https://picsum.photos/200/210',
            children: [{ text: '' }],
        },
    ]

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        explanation: explanationData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
    }
}

// 富文本：无法解析的文本
function addQuestionSet9(id: string, chapterId: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这题的选项会出现 rich text parse 错误',
                },
            ],
        },
    ]

    const optionOne = [
        {
            tex: '这是第一个选项。',
        },
    ]

    const optionTwo = 'some bad string'

    return {
        _id: id,
        chapters: [chapterId],
        body: bodyData,
        questions: [
            {
                options: [optionOne, optionTwo],
                answer: 1,
            },
        ],
    }
}

// questionSets
export async function addQuestionSets() {
    await QuestionSet.insertMany([
        addQuestionSet1('62ff846994d4a5032e425e3e', '62ee08ee3ca7977c375aabec'),
        addQuestionSet2('62ff846994d4a5032e425e31', '62ee08ee3ca7977c375aabec'),
        addQuestionSet3('62ff846994d4a5032e425e32', '62ee08ee3ca7977c375aabec'),
        addQuestionSet4('62ff846994d4a5032e425e30', '62ee08ee3ca7977c375aabec'),
        addQuestionSet5('62ff846994d4a5032e425111', '62ee08f73ca7977c375aabaa'),
        addQuestionSet6('62ff846994d4a5032e428888', '62ee08f73ca7977c375aabaa'),
        addQuestionSet7('62ff846994d4a50321428881', '62ee08f73ca7977c375aabf1'),
        addQuestionSet8('62ff846994d4a50321428882', '62ee08f73ca7977c375aabf1'),
        addQuestionSet9('62ff846994d4a50321428772', '62ee08f73ca7977c375aabf1'),
    ])
}
