import { fetchMergeRequests } from './merge-requests-fetcher';

export const listGroupMergeRequests = async (groupId: string, query: Record<string, string>) => {
    const result = await fetchMergeRequests(groupId, query);
    return result.map(({title, updated_at, state}) => ({title, updated_at, state}));
}
