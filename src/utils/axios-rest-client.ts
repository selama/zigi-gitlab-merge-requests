
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IRestClient, IRestClientResult } from '../config/config-interfaces';
import { setupCache } from 'axios-cache-adapter';

export class RestClient implements IRestClient {

    private clientInstance: AxiosInstance;

    constructor(baseURL: string, headers: Record<string, string>) {
        const cache = setupCache({
            maxAge: 30 * 60 * 1000
        });
 
        this.clientInstance = axios.create({
                adapter: cache.adapter,
                baseURL,
                headers
            });
    }

    async get<T>(resource: string, query?: Record<string, string | number>) {
        const result = await this.clientInstance.get<T>(resource, {
            params: query
        })
        return new RestClientResult<T>(result);
    }
}

class RestClientResult<T> implements IRestClientResult<T> {
    result: AxiosResponse<T>;

    constructor(result: AxiosResponse<T>) {
        this.result = result;
    }

    getData() {
        return this.result.data;
    }

    getHeaders() {
        return this.result.headers;
    }
}
