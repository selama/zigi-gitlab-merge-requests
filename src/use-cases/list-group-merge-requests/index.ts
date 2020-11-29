import { ExtendedMergeRequestsPageQueryGQL, MergeRequestGQL } from '../../../generated/graphql/graphql-sdk';
import { fetchMergeRequestsPages } from './merge-requests-fetcher';

const mergeRequestPagesToMergeRequets = 
    (mergeRequestsArr: MergeRequestGQL[], mergeRequestsPage: MergeRequestGQL[]) => 
        [...mergeRequestsArr, ...mergeRequestsPage];

const extractMergeRequestsFromPages = (extendedMergeRequestsPagesResult: ExtendedMergeRequestsPageQueryGQL[]) => {
    const extendedMergeRequestsPages = extendedMergeRequestsPagesResult.map(page => page?.group?.mergeRequests?.nodes);
    return extendedMergeRequestsPages.reduce(mergeRequestPagesToMergeRequets, []);
}

const formatMergeRequestsData = (extendedMergeRequests: ReturnType<typeof extractMergeRequestsFromPages>) => extendedMergeRequests;

export const listGroupMergeRequests = async (groupId: string, query: Record<string, string>) => {
    const extendedMergeRequestsPages = await fetchMergeRequestsPages(groupId, query);
    const extendedMergeRequests = extractMergeRequestsFromPages(extendedMergeRequestsPages);
    return formatMergeRequestsData(extendedMergeRequests);
}
