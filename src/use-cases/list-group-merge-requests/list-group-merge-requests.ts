import { addCommitsDataToMergeRequests } from './merge-requests-commits-fetcher';
import { addDiscussionsDataToMergeRequests } from './merge-requests-discussions-fetcher';
import { fetchAllMergeRequestsForAGroup } from './merge-requests-fetcher';
import { addNotesDataToMergeRequests } from './merge-requests-notes-fetcher';

export const listGroupMergeRequests = async (groupId: string, query: Record<string, string>): Promise<any> => {
    const allMergeRequests = await fetchAllMergeRequestsForAGroup(groupId, query);
    const allMergeRequestsWithNotesAdded = await addNotesDataToMergeRequests(allMergeRequests);
    const allMergeRequestsWithDiscussionsAdded = await addDiscussionsDataToMergeRequests(allMergeRequestsWithNotesAdded);
    const allMergeRequestsWithCommitsAdded = await addCommitsDataToMergeRequests(allMergeRequestsWithDiscussionsAdded);
    return allMergeRequestsWithCommitsAdded;
}
