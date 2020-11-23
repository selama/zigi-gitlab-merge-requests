import { config } from '../../config';

const MAX_PER_PAGE = 100;
const OPEN_MERGE_REQUEST_STATE = 'opened';
const TOTAL_PAGES_COUNT_HEADER_KEY = 'x-total-pages';

const mrPagesArrToMrArr = (mrArr: any[], mrPage: any[]) => [...mrArr, ...mrPage];

const range = (inclusiveStart: number, inclusiveEnd: number) => {
    const rangeArr: number[] = [];
    for (let n=inclusiveStart; n<=inclusiveEnd; n++) {
        rangeArr.push(n);
    }
    return rangeArr;
}

const getMergeRequestsQuery = (query: Record<string, string>) => {
    const { since } = query;
    const useCaseQuery = since ? {
        updated_after: since
    } : {
        state: OPEN_MERGE_REQUEST_STATE
    };
    return {per_page: MAX_PER_PAGE, ...useCaseQuery};
}

const fetchSingleMergeRequestsPage = async (groupId: string, query: Record<string, string | number>) => {
    return config.restClient.get<any[]>(`groups/${groupId}/merge_requests`, {...query});
}

const fetchRestOfMergeRequestsPages = async (groupId: string, query: Record<string, string | number>, totalPagesCount: number) => {
    const nextPageToFetch = 2; // gitlab's paging count starts at 1
    const lastPageToFetch = totalPagesCount; // gitlab's paging count starts at 1
    const pageNumbers = range(nextPageToFetch, lastPageToFetch);
    const pagePromises = pageNumbers.map(n => fetchSingleMergeRequestsPage(groupId, {...query, page: n}))
    return Promise.all(pagePromises);
}

const fetchAllPagesResults = async (groupId: string, query: Record<string, string>) => {
    const mergeRequestsQuery = getMergeRequestsQuery(query);
    const firstPageResult = await fetchSingleMergeRequestsPage(groupId, mergeRequestsQuery);

    const totalPagesCount = Number(firstPageResult.getHeaders()[TOTAL_PAGES_COUNT_HEADER_KEY]);
    const restOfPagesResult = await fetchRestOfMergeRequestsPages(groupId, mergeRequestsQuery, totalPagesCount);

    return [firstPageResult, ...restOfPagesResult];
}

export const fetchMergeRequests = async (groupId: string, query: Record<string, string>) => {
    const allPagesResults = await fetchAllPagesResults(groupId, query);
    return allPagesResults
        .map(pageResult => pageResult.getData())
        .reduce(mrPagesArrToMrArr, []);
}
