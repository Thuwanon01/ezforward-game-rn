import { BaseRepository } from "./BaseRepository";

export class LLMRepository extends BaseRepository {
    async generateText(prompt: string) {
        const data = await this.sfetch('/llm/api/test-llm/', {
            method: "post",
            body: {
                prompt: prompt
            }
        })
        return data
    }
}