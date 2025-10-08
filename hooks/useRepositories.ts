import { AuthRepository } from "@/apis/AuthRepository";
import { GameRepository } from "@/apis/GameRepository";
import { GameV2Repository } from "@/apis/GameV2Repository";
import { useRef } from "react";

function getBaseURL () {
    return process.env.EXPO_PUBLIC_API_BASE_URL || "https://job8001.dobybot.com"
}


export default function useRepositories (accessToken: string) {
    const baseURL = getBaseURL()
    
    const repositories = useRef({
        auth: new AuthRepository(baseURL, accessToken),
        game: new GameRepository(baseURL, accessToken),
        gamev2: new GameV2Repository(baseURL, accessToken),
    })

    return repositories
}
