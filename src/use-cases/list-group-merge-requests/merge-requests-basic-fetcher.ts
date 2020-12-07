import { MergeRequestDTO } from '../../types/dto';
import { fetchGitlabResources } from '../../utils/fetch-all-gitlab-resource';

const OPEN_MERGE_REQUEST_STATE = 'opened';

const getMergeRequestsQuery = (query: Record<string, string>) => {
    const { since } = query;
    const useCaseQuery = since ? {
        updated_after: since
    } : {
        state: OPEN_MERGE_REQUEST_STATE
    };
    return useCaseQuery;
}

export const fetchAllMergeRequestsForAGroup = (groupId: string, query: Record<string, string>) => {
    const mergeRequestsQuery = getMergeRequestsQuery(query);
    return fetchGitlabResources<MergeRequestDTO>(`groups/${groupId}/merge_requests`, mergeRequestsQuery)
}
