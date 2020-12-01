import { config } from '../../config';
import { MergeRequestREST, DiscussionREST } from '../../config/config-interfaces/rest-client-interfaces';

const fetchAllMergeRequestDiscussions = async ({ project_id, iid }: MergeRequestREST) => {
    const firstPagePromise = config.concurrencyLimitter.add(
        () => {
            return config.gitlabRestClient.get<DiscussionREST[]>(`/projects/${project_id}/merge_requests/${iid}/discussions`);
        }
    );
    const firstPage = await firstPagePromise;

    return firstPage.getData();
}

export const addDiscussionsDataToMergeRequests = (mergeRequests: MergeRequestREST[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        return {
            ...mergeRequest,
            discussions: await fetchAllMergeRequestDiscussions(mergeRequest)
        }
    }));
}
