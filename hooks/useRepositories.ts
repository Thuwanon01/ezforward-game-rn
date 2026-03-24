import { AuthRepository } from "@/apis/AuthRepository";
import { GameRepository } from "@/apis/GameRepository";
import { GameV2Repository } from "@/apis/GameV2Repository";
import { LLMRepository } from "@/apis/LLMRepository";
import { useMemo, useRef } from "react";

function getBaseURL () {
    return process.env.EXPO_PUBLIC_API_BASE_URL || "https://uat-ezram-game-service.ez-zone.com"
}


export default function useRepositories (accessToken: string) {
    const baseURL = getBaseURL()

    // useMemo ensures new instances are created when accessToken changes (fixes stale token bug)
    const repos = useMemo(() => ({
        auth: new AuthRepository(baseURL, accessToken),
        game: new GameRepository(baseURL, accessToken),
        gamev2: new GameV2Repository(baseURL, accessToken),
        llm: new LLMRepository(baseURL, accessToken)
    }), [accessToken])

    // Keep ref.current up-to-date so callers using .current always get fresh repos
    const ref = useRef(repos)
    ref.current = repos

    return ref
}
