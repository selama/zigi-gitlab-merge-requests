import { config } from '../../config';
import { MergeRequestREST, NoteREST } from '../../config/config-interfaces/rest-client-interfaces';

const fetchAllMergeRequestNotes = async ({ project_id, iid }: MergeRequestREST) => {
    const firstPagePromise = config.concurrencyLimitter.add(
        () => {
            return config.gitlabRestClient.get<NoteREST[]>(`/projects/${project_id}/merge_requests/${iid}/notes`);
        }
    );
    const firstPage = await firstPagePromise;

    return firstPage.getData();
}

export const addNotesDataToMergeRequests = (mergeRequests: MergeRequestREST[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        return {
            ...mergeRequest,
            notes: await fetchAllMergeRequestNotes(mergeRequest)
        }
    }));
}
