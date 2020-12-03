import { IRequestsManager, RequestsManagerGET } from '../config/config-interfaces/requests-manger-interface';
import { IRestClient } from '../config/config-interfaces/rest-client-interfaces';

const ONE_MIN = 60_000;
const TOO_MANY_REQUESTS_CODE = 429;

const isRecoverable = (error: any) => {
    return error.response?.status === TOO_MANY_REQUESTS_CODE;
}

export const createRequestsManager = (restClient: IRestClient, concurrencyLimitter: IConcurrencyLimitter): IRequestsManager => {
    const get: RequestsManagerGET = async <T>(resource: string, query: Record<string, string | number> | undefined) => {
        try {
            return await concurrencyLimitter.add(() => restClient.get<T>(resource, query));
        } catch (error) {
            if (isRecoverable(error)) {
                concurrencyLimitter.pause(ONE_MIN);
                return get<T>(resource, query);
            } else {
                throw error;
            }
        }
    }

    return {
        get
    }
}
