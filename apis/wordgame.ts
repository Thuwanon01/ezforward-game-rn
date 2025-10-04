import { ofetch } from 'ofetch'
import type { QuizAnswerResponse, RandomQuizResponse } from './types'

const $fetch = ofetch.create({
    baseURL: 'https://job8001.dobybot.com',
    
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
