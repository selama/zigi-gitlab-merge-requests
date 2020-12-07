import { 
    IRequestsManager, 
    RequestsManagerGET, 
    IRestClient, 
    IConcurrencyLimitter, 
    IGraphqlClient, 
    RequestManagerGetMRStats 
} from '../config/config-interfaces';

const ONE_MIN = 60_000;
const TOO_MANY_REQUESTS_CODE = 429;

const isRecoverable = (error: any) => {
    return error.response?.status === TOO_MANY_REQUESTS_CODE;
}

export const createRequestsManager = (
    restClient: IRestClient, 
    graphqlClient: IGraphqlClient,
    concurrencyLimitter: IConcurrencyLimitter): IRequestsManager  => {

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
        
    const getMergeResquestDiffStats: RequestManagerGetMRStats = async (projectId: string, mergeRequestId: string) => {
        try {
            return await concurrencyLimitter.add(() => graphqlClient.getMergeResquestDiffStats(projectId, mergeRequestId));
        } catch (error) {
            if (isRecoverable(error)) {
                concurrencyLimitter.pause(ONE_MIN);
                return getMergeResquestDiffStats(projectId, mergeRequestId);
            } else {
                throw error;
            }
        }
    }

    return {
        get,
        getMergeResquestDiffStats
    }
}
