import { BaseRepository } from "./BaseRepository";
import { QuizAnswerResponse, QuizAnswerSubmissionV2, QuizResponse, Subject } from "./types";

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

    async fetchSubjects(): Promise<Subject[]> {
        return [
            {
                gid: "eng",
                name: "English",
                topics: [
                    { name: "Present Simple Tense", gid: "eng101" },
                    { name: "Present Continuous Tense", gid: "eng102" },
                    { name: "Past Simple Tense", gid: "eng103" }
                ],
                levels: [
                    { name: "A1", gid: "a1" },
                    { name: "A2", gid: "a2" },
                    { name: "B1", gid: "b1" },
                    { name: "B2", gid: "b2" },
                    { name: "C1", gid: "c1" },
                    { name: "C2", gid: "c2" }
                ]
            },
            {
                gid: "math",
                name: "Mathematics",
                topics: [
                    { name: "Set", gid: "math101" },
                    { name: "Trigone", gid: "math102" },
                    { name: "Exponential", gid: "math103" }
                ],
                levels: [
                    { name: "A1", gid: "a1" },
                    { name: "A2", gid: "a2" },
                    { name: "B1", gid: "b1" },
                    { name: "B2", gid: "b2" },
                    { name: "C1", gid: "c1" },
                    { name: "C2", gid: "c2" }
                ]
            }
        ]
    }
}
