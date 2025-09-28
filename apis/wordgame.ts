import { ofetch } from 'ofetch'
import type { QuizAnswerResponse, RandomQuizResponse } from './types'

const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU5NjYwNTYzLCJpYXQiOjE3NTkwNTU3NjMsImp0aSI6IjJmMTEyOGIxMTAyNDRjMDM5YjRlOTI2MTdmZmQzOTljIiwidXNlcl9pZCI6IjEifQ.hti4hNLT9Ocw52V9rhkDAm4E5BJcQwhflDCp0ehyBRI"
const $fetch = ofetch.create({
    baseURL: 'https://job8001.dobybot.com',
    headers: {
        Authorization: `Bearer ${access_token}`
    }
})

/**
 * Fetches a random quiz question from the API
 * @returns Promise<RandomQuizQuestion> - A random quiz question with choices
 */
export async function fetchRandomQuestion(): Promise<RandomQuizResponse> {
    const data = await $fetch('/quizzes/api/random-quiz/')
    return data
}

/**
 * Submits an answer for a quiz question
 * @param question_id - The ID of the question being answered
 * @param choice_id - The ID of the selected choice
 * @returns Promise<QuizAnswerResponse> - Detailed response with correct answer and explanations
 */
export async function fetchSubmitAnswer(question_id: number, choice_id: number): Promise<QuizAnswerResponse> {
    const data = await $fetch('/quizzes/api/answer/', {
        method: 'POST',
        body: {
            question: question_id,
            choice: choice_id
        }
    })
    return data
}
