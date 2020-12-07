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


    const requestExecuter: <T>(request: () => Promise<T>) => Promise<T> = async (request) => {
        try {
            return await concurrencyLimitter.add(request);
        } catch (error) {
            if (isRecoverable(error)) {
                concurrencyLimitter.pause(ONE_MIN);
                return requestExecuter(request);
            } else {
                throw error;
            }
        }
    }

    const get: RequestsManagerGET = <T>(resource: string, query: Record<string, string | number> | undefined) => {
        return requestExecuter(() => restClient.get<T>(resource, query));
    }
        
    const getMergeResquestDiffStats: RequestManagerGetMRStats = async (projectId: string, mergeRequestId: string) => {
        return requestExecuter(() => graphqlClient.getMergeResquestDiffStats(projectId, mergeRequestId));
    }

    return {
        get,
        getMergeResquestDiffStats
    }
}
