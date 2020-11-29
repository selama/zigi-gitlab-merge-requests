import { config } from '../../config';
import { IRestClientResult, MergeRequestREST } from '../../config/config-interfaces/rest-client-interfaces';
import { fetchPageExtendedData } from './merge-requests-extended-data-fetcher';

const MAX_PER_PAGE = 100;
const OPEN_MERGE_REQUEST_STATE = 'opened';
const TOTAL_PAGES_COUNT_HEADER_KEY = 'x-total-pages';

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

const fetchSingleExtendedPage = async (pageResultPromise: Promise<IRestClientResult<MergeRequestREST[]>>) => {
    const page = await pageResultPromise;
    const mergeRequests = page.getData();
    const mergeRequestsIids = mergeRequests.map(({iid}) => String(iid));
    return fetchPageExtendedData(mergeRequestsIids);
}

const fetchSinglePage = async (groupId: string, query: Record<string, string | number>) => {
    return config.gitlabRestClient.get<MergeRequestREST[]>(`groups/${groupId}/merge_requests`, {...query});
}

const fetchRestOfPages = (groupId: string, query: Record<string, string | number>, totalPagesCount: number) => {
    const pageNumbers = range(2, totalPagesCount); // gitlab's paging count starts at 1
    const pagePromises = pageNumbers.map(n => fetchSinglePage(groupId, {...query, page: n}));
    return pagePromises;
}

export const fetchMergeRequestsPages = async (groupId: string, query: Record<string, string>) => {
    const mergeRequestsQuery = getMergeRequestsQuery(query);

    const firstPagePromise = fetchSinglePage(groupId, mergeRequestsQuery);
    const firstPage = await firstPagePromise;

    const totalPagesCount = Number(firstPage.getHeaders()[TOTAL_PAGES_COUNT_HEADER_KEY]);
    const restOfPagesPromises = fetchRestOfPages(groupId, mergeRequestsQuery, totalPagesCount);

    const allPagesPromises = [firstPagePromise, ...restOfPagesPromises];

    return Promise.all(allPagesPromises.map(fetchSingleExtendedPage));
}
