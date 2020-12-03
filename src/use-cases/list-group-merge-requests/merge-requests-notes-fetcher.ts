import { config } from '../../config';
import { MergeRequestDTO, NoteDTO } from '../../types/dto';

const fetchAllMergeRequestNotes = async ({ project_id, iid }: MergeRequestDTO) => {
    const firstPagePromise = config.requestsManager.get<NoteDTO[]>(`/projects/${project_id}/merge_requests/${iid}/notes`);
    const firstPage = await firstPagePromise;

    return firstPage.getData();
}

export const addNotesDataToMergeRequests = (mergeRequests: MergeRequestDTO[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        return {
            ...mergeRequest,
            notes: await fetchAllMergeRequestNotes(mergeRequest)
        }
    }));
}
