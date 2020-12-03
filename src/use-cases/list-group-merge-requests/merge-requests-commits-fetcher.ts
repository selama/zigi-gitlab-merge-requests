import { config } from '../../config';
import { CommitsDTO, MergeRequestDTO } from '../../types/dto';

const fetchAllMergeRequestCommits = async ({ project_id, iid }: MergeRequestDTO) => {
    const firstPagePromise = config.requestsManager.get<CommitsDTO[]>(`/projects/${project_id}/merge_requests/${iid}/commits`);

    const firstPage = await firstPagePromise;

    return firstPage.getData();
}

export const addCommitsDataToMergeRequests = (mergeRequests: MergeRequestDTO[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        return {
            ...mergeRequest,
            commits: await fetchAllMergeRequestCommits(mergeRequest)
        }
    }));
}
