import { config } from '../../config';
import { 
    CommitDTO, 
    DiscussionDTO, 
    MergeRequestDTO, 
    ApprovalStateDTO, 
    ProjectDTO, 
    ResourceStateEventDTO
} from '../../types/dto';
import { fetchGitlabResources } from '../../utils/fetch-all-gitlab-resource';

const fetchMergeRequestCommits = (project_id: string, iid: string) => {
    return fetchGitlabResources<CommitDTO>(`/projects/${project_id}/merge_requests/${iid}/commits`);
}

const fetchMergeRequestDiscussions = (project_id: string, iid: string) => {
    return fetchGitlabResources<DiscussionDTO>(`/projects/${project_id}/merge_requests/${iid}/discussions`);
}

const fetchMergeRequestApprovalState = async (project_id: string, iid: string) => {
    const approvalState = await config.requestsManager.get<ApprovalStateDTO>(`/projects/${project_id}/merge_requests/${iid}/approval_state`);
    return approvalState.getData();
}

const fetchMergeRequestResourceStateEvents = async (project_id: string, iid: string) => {
    return fetchGitlabResources<ResourceStateEventDTO>(`/projects/${project_id}/merge_requests/${iid}/resource_state_events`);
}

const fetchProjectData = async (project_id: string) => {
    const projectData = await config.requestsManager.get<ProjectDTO>(`/projects/${project_id}`);
    return projectData.getData();
}

const fetchMergeResquestDiffStats = async (project_id: string, iid: string) => {
    return config.requestsManager.getMergeResquestDiffStats(String(project_id), String(iid));
}

export const fetchExtendedMergeRequests = (mergeRequests: MergeRequestDTO[]) => {
    return Promise.all(mergeRequests.map(async (mergeRequest) => {
        const { project_id, iid } = mergeRequest;
        const [
            commits, 
            discussions, 
            approvalState,
            stateEvents,
            projectData,
        ] = await Promise.all([
            fetchMergeRequestCommits(project_id, iid),
            fetchMergeRequestDiscussions(project_id, iid),
            fetchMergeRequestApprovalState(project_id, iid),
            fetchMergeRequestResourceStateEvents(project_id, iid),
            fetchProjectData(project_id),
        ]);
        const diffStats = await fetchMergeResquestDiffStats(projectData.path_with_namespace, iid);
        return {
            mergeRequest,
            commits,
            discussions,
            approvalState,
            stateEvents,
            projectData,
            diffStats
        }
    }));
}
