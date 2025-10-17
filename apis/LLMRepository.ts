import { BaseRepository } from "./BaseRepository";

export class LLMRepository extends BaseRepository {
    async generateText(prompt: string) {
        return "Hello"
        // const data = await this.sfetch("/llm/generate-text/", {
        //     method: "post",
        //     body: {
        //         prompt: prompt
        //     }
        // })
        // return data
    }
}