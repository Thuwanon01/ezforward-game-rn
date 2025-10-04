import { BaseRepository } from "./BaseRepository";
import { QuizAnswerResponse, RandomQuizResponse } from "./types";

export class GameRepository extends BaseRepository {
    async getQuestion() {
        const data = await this.sfetch("")
    }

    async fetchSubmitAnswer(question_id: number, choice_id: number): Promise<QuizAnswerResponse> {
        const data = await this.sfetch("/quizzes/api/answer/", {
            method: "post",
            body: {
                question: question_id,
                choice: choice_id
            }
        })
        return data
    }

    async fetchRandomQuestion(): Promise<RandomQuizResponse> {
        const data = this.sfetch('/quizzes/api/random-quiz/')
        return data
    }
}