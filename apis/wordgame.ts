const ofetch = require('ofetch')


const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU5NjYwNTYzLCJpYXQiOjE3NTkwNTU3NjMsImp0aSI6IjJmMTEyOGIxMTAyNDRjMDM5YjRlOTI2MTdmZmQzOTljIiwidXNlcl9pZCI6IjEifQ.hti4hNLT9Ocw52V9rhkDAm4E5BJcQwhflDCp0ehyBRI"
const $fetch = ofetch.create({
    baseURL: 'https://job8001.dobybot.com',
    headers: {
        Authorization: `Bearer ${access_token}`
    }
})


export async function fetchQuestion() {
    const data = await $fetch('/quizzes/api/random-quiz/')
    return data
}


export async function fetchSubmitAnswer(question_id: number, choice_id: number) {
    const data = await $fetch('/quizzes/api/answer/', {
        method: 'POST',
        body: {
            question: question_id,
            choice: choice_id
        }
    })
    return data
}
