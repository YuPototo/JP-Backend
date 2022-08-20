import QuestionSet from '@/models/questionSet'

function addQuestionSetOne(id: string) {
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
            text: '这是第二个选项。',
        },
    ]

    return {
        _id: id,
        body: JSON.stringify(bodyData),
        explanation: JSON.stringify(explanationData),
        questions: [
            {
                options: [JSON.stringify(optionOne), JSON.stringify(optionTwo)],
                answer: 1,
            },
        ],
    }
}

function addQuestionSetTwo(id: string) {
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
            text: '这是第1题第二个选项。',
        },
    ]

    const questionOne = {
        body: JSON.stringify(body_1),
        options: [JSON.stringify(option_1_1), JSON.stringify(option_1_2)],
        answer: 1,
        explanation: JSON.stringify(explanation_1),
    }

    const option_2_1 = [
        {
            text: '这是第2题第一个选项。',
        },
    ]

    const option_2_2 = [
        {
            text: '这是第2题第二个选项。',
        },
    ]

    const questionTwo = {
        options: [JSON.stringify(option_2_1), JSON.stringify(option_2_2)],
        answer: 0,
    }

    return {
        _id: id,
        body: JSON.stringify(bodyData),
        explanation: JSON.stringify(explanationData),
        questions: [questionOne, questionTwo],
    }
}

function addQuestionSetThree(id: string) {
    const bodyData = [
        {
            type: 'paragraph',
            children: [
                {
                    text: '这是 question set 的 body。这个题目会有图片出现在 question set body 和选项。',
                },
            ],
        },
        {
            type: 'image',
            src: 'https://picsum.photos/200/300',
            children: [{ text: '' }],
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
            type: 'image',
            src: 'https://picsum.photos/200/300',
            children: [{ text: '' }],
        },
    ]

    const optionTwo = [
        {
            type: 'image',
            src: 'https://picsum.photos/200/300',
            children: [{ text: '' }],
        },
    ]

    return {
        _id: id,
        body: JSON.stringify(bodyData),
        explanation: JSON.stringify(explanationData),
        questions: [
            {
                options: [JSON.stringify(optionOne), JSON.stringify(optionTwo)],
                answer: 1,
            },
        ],
    }
}

function addQuestionFour(id: string) {
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
        body: JSON.stringify(bodyData),
        explanation: JSON.stringify(explanationData),
        questions: [
            {
                options: [JSON.stringify(optionOne), JSON.stringify(optionTwo)],
                answer: 1,
            },
        ],
        audio: '62ff846994d4a5032e425e22',
    }
}

// questionSets
export async function addQuestionSets() {
    await QuestionSet.insertMany([
        addQuestionSetOne('62ff846994d4a5032e425e3e'),
        addQuestionSetTwo('62ff846994d4a5032e425e31'),
        addQuestionSetThree('62ff846994d4a5032e425e32'),
        addQuestionFour('62ff846994d4a5032e425e30'),
    ])
}
