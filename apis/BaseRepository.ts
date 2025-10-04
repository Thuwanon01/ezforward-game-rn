import { FetchOptions, ofetch } from 'ofetch'

export class BaseRepository {
    protected baseURL: string
    protected accessToken: string
    
    constructor (baseURL: string, accessToken: string) {
        this.baseURL = baseURL
        this.accessToken = accessToken
    }

    async ofetch(path: string, options?: FetchOptions<"json", any>) {
        return await ofetch(this.baseURL + path, options)
    }

    async sfetch(path: string, options?: FetchOptions<"json", any>) {
        options = options || {}
        options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${this.accessToken}`
        }
        return await ofetch(this.baseURL + path, options)
    }
}