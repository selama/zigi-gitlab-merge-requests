import { config } from '../../config';
import { MergeRequestREST, CommitsREST } from '../../config/config-interfaces/rest-client-interfaces';

const fetchAllMergeRequestCommits = async ({ project_id, iid }: MergeRequestREST) => {
    const firstPagePromise = config.concurrencyLimitter.add(
        () => {
            return config.gitlabRestClient.get<CommitsREST[]>(`/projects/${project_id}/merge_requests/${iid}/commits`);
        }
    );
    const firstPage = await firstPagePromise;

    return firstPage.getData();
}

export const addCommitsDataToMergeRequests = (mergeRequests: MergeRequestREST[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        return {
            ...mergeRequest,
            commits: await fetchAllMergeRequestCommits(mergeRequest)
        }
    }));
}
