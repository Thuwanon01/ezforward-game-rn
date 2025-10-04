import { BaseRepository } from "./BaseRepository";

export class GameRepository extends BaseRepository {
    async getQuestion() {
        const data = await this.sfetch("")
    }

    async submitAnswer(question_id: string, choice_id: string) {
        const data = await this.sfetch("", {
            method: "post",
            body: {
                
            }
        })
    }
}