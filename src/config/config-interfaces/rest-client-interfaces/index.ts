
export interface IRestClientResult<T> {
    getData(): T;
    getHeaders(): Record<string, string>;
}

export interface IRestClient {
    get<T>(resource: string, query?: Record<string, string | number>): Promise<IRestClientResult<T>>
}

export type MergeRequestREST = {
    iid: string;
    id: string;
}
