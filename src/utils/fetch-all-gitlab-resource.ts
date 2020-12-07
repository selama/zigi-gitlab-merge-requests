import { config } from '../config';

const TOTAL_PAGES_COUNT_HEADER_KEY = 'x-total-pages';
const MAX_PER_PAGE = 100;

const extractResourcesFromPages = <T>(resourcePages: T[][]) => {
    return resourcePages.reduce((resources: T[], page: T[]) => [...resources, ...page], []);
}

const range = (inclusiveStart: number, inclusiveEnd: number) => {
    const rangeArr: number[] = [];
    for (let n=inclusiveStart; n<=inclusiveEnd; n++) {
        rangeArr.push(n);
    }
    return rangeArr;
}

const fetchRestOfPages = <T>(resource: string, query: Record<string, string | number>, totalPagesCount: number) => {
    const pageNumbers = range(2, totalPagesCount); // gitlab's paging count starts at 1
    const pagePromises = pageNumbers.map(n => config.requestsManager.get<T[]>(resource, {...query, page: n}));
    return pagePromises;
}

const fetchGitlabResourcePages = async <T>(
    resource: string, 
    query: Record<string, string | number> = {}
) => {
    const maxPerPageQuery = {per_page: MAX_PER_PAGE, ...query}
    const firstPagePromise = config.requestsManager.get<T[]>(resource, maxPerPageQuery);
    const firstPage = await firstPagePromise;

    const totalPagesCount = Number(firstPage.getHeaders()[TOTAL_PAGES_COUNT_HEADER_KEY]);
    totalPagesCount > 1 && console.log('totalPagesCount', totalPagesCount);
    const restOfPagesPromises = fetchRestOfPages<T>(resource, maxPerPageQuery, totalPagesCount);

    const resourcePages = await Promise.all([firstPagePromise, ...restOfPagesPromises]);
    return resourcePages.map(page => page.getData());
}

export const fetchGitlabResources = async <T>(
    resource: string, 
    query?: Record<string, string | number>
) => {
    const resourcePages = await fetchGitlabResourcePages<T>(resource, query);
    const resources = extractResourcesFromPages(resourcePages);
    return resources;
}
