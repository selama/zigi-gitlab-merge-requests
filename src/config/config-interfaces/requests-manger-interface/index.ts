import { IRestClientResult } from '../rest-client-interfaces';

export type RequestsManagerGET = <T>(resource: string, query?: Record<string, string | number>) => Promise<IRestClientResult<T>>;

export interface IRequestsManager {
    get: RequestsManagerGET;
}
