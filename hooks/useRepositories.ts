import { AuthRepository } from "@/apis/AuthRepository";
import { GameRepository } from "@/apis/GameRepository";
import { useRef } from "react";

function getBaseURL () {
    return "https://job8001.dobybot.com"
}


export default function useRepositories (accessToken: string) {
    const baseURL = getBaseURL()
    
    const repositories = useRef({
        auth: new AuthRepository(baseURL, accessToken),
        game: new GameRepository(baseURL, accessToken)
    })

    return repositories
}