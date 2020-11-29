import { isDeepStrictEqual } from 'util';
import { IRestClient, IRestClientResult } from "../../src/config/config-interfaces/rest-client-interfaces";

type Result<T> = {data: T; headers: Record<string, string>};
type Response<T> = {
    resource: string;
    query?: Record<string, string | number>;
    result: Result<T>;
    delay: number;
}

export class MockedRestClient implements IRestClient {

    private responses: Response<unknown>[] = [];

    addMockedResponse = <T>({resource, query, result, delay}: Response<T>) => {
        this.responses.push({
            resource,
            query,
            result,
            delay
        });
    }

    get = <T>(resource: string, query?: Record<string, string>) => {
        const response = this.responses.find(
            ({resource: responseResource, query: responseQuery}) => 
                responseResource === resource && isDeepStrictEqual(responseQuery, query)
        )
        return new Promise<RestClientResult<T>>(resolve => {
            setTimeout(() => resolve(new RestClientResult<T>(response.result as Result<T>)), response.delay);
        });
    }
}

class RestClientResult<T> implements IRestClientResult<T> {
    private result: Result<T>;

    constructor(result: Result<T>) {
        this.result = result;
    }

    getData() {
        return this.result.data;
    }

    getHeaders() {
        return this.result.headers;
    }
}

export class MockedResultFactory<T> {
    private result: Result<T> = {
        data: null,
        headers: {}
    };

    withData = (data: T) => {
        this.result.data = data;
        return this;
    }

    withHeaders = (headers: Record<string, string>) => {
        this.result.headers = headers;
        return this;
    }

    getMockedResult = () => this.result;
}

export class MockedResponseFactory<T> {
    private response: Response<T> = {
        delay: 300,
        result: new MockedResultFactory<T>().getMockedResult(),
        resource: 'dummy-resource'
    };

    withDelay = (delay: number) => {
        this.response.delay = delay;
        return this;
    }

    forResource = (resource: string) => {
        this.response.resource = resource;
        return this;
    }

    forQuery = (query: Record<string, string | number>) => {
        this.response.query = query;
        return this;
    }

    withResult = (result: Result<T>) => {
        this.response.result = result;
        return this;
    }

    getMockedResponse = () => this.response;
}
