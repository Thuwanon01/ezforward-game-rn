import { BaseRepository } from "./BaseRepository";

interface LoginResponse {
    access: string
    refresh: string
}

interface LoggedInUserResponse {
    id: number
    username: string
}

export class AuthRepository extends BaseRepository {
    async login (username: string, password: string): Promise<LoginResponse> {
        const response: LoginResponse = await this.ofetch("/users/api/token/", {
            method: "post",
            body: {
                username: username,
                password: password
            }
        })
        this.accessToken = response.access
        return response
    } 

    async getLoggedInUser(): Promise<LoggedInUserResponse> {
        return await this.sfetch("/users/me/")
    }

    async loginWithRefreshToken(refreshToken: string): Promise<LoginResponse> {
        const response: LoginResponse = await this.ofetch("/users/api/token/refresh/", {
            method: "post",
            body: {
                refresh: refreshToken
            }
        })
        this.accessToken = response.access
        return response
    }
}