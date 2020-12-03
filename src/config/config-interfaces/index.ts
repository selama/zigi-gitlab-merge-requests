export interface IConcurrencyLimitter {
    add<T>(action: () => Promise<T>): Promise<T>;
    pause(timeout: number): void;
}

export type RequestsManagerGET = <T>(resource: string, query?: Record<string, string | number>) => Promise<IRestClientResult<T>>;

export interface IRequestsManager {
    get: RequestsManagerGET;
}


export interface IRestClientResult<T> {
    getData(): T;
    getHeaders(): Record<string, string>;
}

export interface IRestClient {
    get<T>(resource: string, query?: Record<string, string | number>): Promise<IRestClientResult<T>>
}
