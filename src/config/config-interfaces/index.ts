import { MergeResquestDiffStatsQueryGQL } from '../../../generated/graphql/graphql-sdk';

export interface IConcurrencyLimitter {
    add<T>(action: () => Promise<T>): Promise<T>;
    pause(timeout: number): void;
}

export type RequestsManagerGET = <T>(resource: string, query?: Record<string, string | number>) => Promise<IRestClientResult<T>>;

export type RequestManagerGetMRStats = (projectId: string, mergeRequestId: string) => Promise<MergeResquestDiffStatsQueryGQL>;

export interface IRequestsManager {
    get: RequestsManagerGET;
    getMergeResquestDiffStats: RequestManagerGetMRStats;
}

export interface IRestClientResult<T> {
    getData(): T;
    getHeaders(): Record<string, string>;
}

export interface IRestClient {
    get<T>(resource: string, query?: Record<string, string | number>): Promise<IRestClientResult<T>>
}

export interface IGraphqlClient {
    getMergeResquestDiffStats: RequestManagerGetMRStats;
}

interface LogFn {
    /* tslint:disable:no-unnecessary-generics */
    <T extends object>(obj: T, msg?: string, ...args: any[]): void;
    (msg: string, ...args: any[]): void;
}
export interface ILogger {
    info: LogFn;
}
