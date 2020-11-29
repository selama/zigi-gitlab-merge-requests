// import { MockedResponseFactory, MockedResultFactory } from '../../../../__tests__/mocks/gitlab-rest-client';
// import { MergeRequest } from '../../../types';

// type MockOpenedMergeRequestsResponseInput = {
//     groupId: string,
//     mergeRequests: MergeRequest[],
//     totalPagesCount?: number,
//     page?: number
// }

// export const mockOpenedMergeRequestsResponse = ({
//     groupId, 
//     mergeRequests, 
//     totalPagesCount = 1, 
//     page}: MockOpenedMergeRequestsResponseInput) => {
//     const mockedResult = new MockedResultFactory()
//         .withData(mergeRequests)
//         .withHeaders({ 'x-total-pages': `${totalPagesCount}` })
//         .getMockedResult();

//     const pageQuery = page ? { page } : {};

//     return new MockedResponseFactory()
//         .forResource(`groups/${groupId}/merge_requests`)
//         .forQuery({ per_page: 100, state: 'opened', ...pageQuery })
//         .withResult(mockedResult)
//         .getMockedResponse();
// }

// export const mockMergeRequestsUpdatedSinceResponse = (
//     groupId: string,
//     mergeRequests: MergeRequest[],
//     since: string,
//     totalPagesCount: number = 1
//     ) => {

//     const mockedResult = new MockedResultFactory()
//         .withData(mergeRequests)
//         .withHeaders({ 'x-total-pages': `${totalPagesCount}` })
//         .getMockedResult();

//     return new MockedResponseFactory()
//         .forResource(`groups/${groupId}/merge_requests`)
//         .forQuery({ per_page: 100, updated_after: since})
//         .withResult(mockedResult)
//         .getMockedResponse();

// }
