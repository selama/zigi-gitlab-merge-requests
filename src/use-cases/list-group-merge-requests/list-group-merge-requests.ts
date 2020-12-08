import { formatExtendedMergeRequests } from './format-extended-merge-requests';
import { fetchAllMergeRequestsForAGroup } from './merge-requests-basic-fetcher';
import { fetchExtendedMergeRequests } from './merge-requests-extended-fetcher';

export const listGroupMergeRequests = async (groupId: string, query: Record<string, string>): Promise<any> => {
    const mergeRequests = await fetchAllMergeRequestsForAGroup(groupId, query);
    const extendedMergeRequests = await fetchExtendedMergeRequests(mergeRequests);
    const result = formatExtendedMergeRequests(extendedMergeRequests);
    return result;
}
