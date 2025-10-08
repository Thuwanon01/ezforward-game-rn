import { BaseRepository } from "./BaseRepository";
import { QuizAnswerResponse, QuizAnswerSubmissionV2, QuizResponse } from "./types";

export class GameV2Repository extends BaseRepository {
    async fetchSubmitAnswer(
        question_gid: string,
        answer_gid: string,
        time_taken_ms: number,
        time_read_answer_ms: number,
        use_helper: string[] = [],
        choice_cutting: string[] = []
    ): Promise<QuizAnswerResponse> {
        const requestBody: QuizAnswerSubmissionV2 = {
            question_gid,
            answer_gid,
            time_taken_ms,
            time_read_answer_ms,
            use_helper,
            choice_cutting
        };

        const data = await this.sfetch("/api/answers/", {
            method: "post",
            body: requestBody
        });

        return data;
    }

    async fetchSuggestedQuestion(): Promise<QuizResponse> {
        const data: any = await this.sfetch('/api/learning-plans/suggested-question/?subject=RAM1111')
        return data.question
    }
}
