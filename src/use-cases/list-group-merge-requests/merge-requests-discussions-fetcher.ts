import { config } from '../../config';
import { MergeRequestDTO, DiscussionDTO } from '../../types/dto';

const fetchAllMergeRequestDiscussions = async ({ project_id, iid }: MergeRequestDTO) => {
    const firstPagePromise = config.requestsManager.get<DiscussionDTO[]>(`/projects/${project_id}/merge_requests/${iid}/discussions`);

    const firstPage = await firstPagePromise;

    return firstPage.getData();
}

export const addDiscussionsDataToMergeRequests = (mergeRequests: MergeRequestDTO[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        return {
            ...mergeRequest,
            discussions: await fetchAllMergeRequestDiscussions(mergeRequest)
        }
    }));
}
