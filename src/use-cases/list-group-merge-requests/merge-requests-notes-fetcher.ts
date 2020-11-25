import { MergeRequest, Note } from '../../types';
import { config } from '../../config';

const fetchSinglePage = async (project_id: string, iid: string) => {
    return config.restClient.get<Note[]>(`projects/${project_id}/merge_requests/${iid}/notes`);
}

export const fetchMergeRequestNotes = async (mergeResqust: MergeRequest) => {
    const { project_id, iid } = mergeResqust;
    const firstPage = await fetchSinglePage(project_id, iid);

    return firstPage.getData();
}
