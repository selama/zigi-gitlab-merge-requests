import { addCommitsDataToMergeRequests } from './merge-requests-commits-fetcher';
import { addDiscussionsDataToMergeRequests } from './merge-requests-discussions-fetcher';
import { fetchAllMergeRequestsForAGroup } from './merge-requests-fetcher';
import { addNotesDataToMergeRequests } from './merge-requests-notes-fetcher';

export const listGroupMergeRequests = async (groupId: string, query: Record<string, string>): Promise<any> => {
    console.log('1');
    const allMergeRequests = await fetchAllMergeRequestsForAGroup(groupId, query);
    console.log('2');
    const allMergeRequestsWithNotesAdded = await addNotesDataToMergeRequests(allMergeRequests);
    console.log('3');
    const allMergeRequestsWithDiscussionsAdded = await addDiscussionsDataToMergeRequests(allMergeRequestsWithNotesAdded);
    console.log('4');
    const allMergeRequestsWithCommitsAdded = await addCommitsDataToMergeRequests(allMergeRequestsWithDiscussionsAdded);
    console.log('5');
    // const mergeRequestsIidsGroupedByProjects = groupMergeRequestsIidsByProjects(allMergeRequests);
    // const projectsMergeRequests = await fetchAllProjectsMergeRequests(mergeRequestsIidsGroupedByProjects);
    // return projectsMergeRequests;
    return allMergeRequestsWithCommitsAdded;
}
