
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IRestClient, IRestClientResult } from '../config/config-interfaces/rest-client-interfaces';

export class RestClient implements IRestClient {

    private clientInstance: AxiosInstance;

    constructor(baseURL: string, headers: Record<string, string>) {
        this.clientInstance = axios.create({
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
