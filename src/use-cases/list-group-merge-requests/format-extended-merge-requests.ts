import { MergeResquestDiffStatsQueryGQL } from '../../../generated/graphql/graphql-sdk';
import { 
    ApprovalStateDTO, 
    // CommitDTO, 
    DiscussionDTO, 
    MergeRequestDTO, 
    // NoteDTO, 
    ProjectDTO 
} from '../../types/dto';

const calcReviewDecision = (discussions: DiscussionDTO[], approvalState: ApprovalStateDTO) => {
    const resolvableDiscussions = discussions.filter((discussion) => {
        return discussion.notes.some(({resolvable}) => resolvable);
    });
    const changesWereRequested = resolvableDiscussions.length;
    const isApproved = approvalState.rules.every(({approved}) => approved);
    if (!isApproved && !changesWereRequested) {
        return null;
    }
    return isApproved ? 'approved' : 'change_requests';
}

const formatSingleMergeRequest = ({
    mergeRequest,
    // commits,
    // notes,
    discussions,
    approvalState,
    projectData,
    diffStats
}: {
    mergeRequest: MergeRequestDTO;
    // commits: CommitDTO[];
    // notes: NoteDTO[];
    discussions: DiscussionDTO[];
    approvalState: ApprovalStateDTO;
    projectData: ProjectDTO;
    diffStats: MergeResquestDiffStatsQueryGQL;
}) => {
    const {
        iid,
        project_id,
        title,
        created_at,
        updated_at,
        source_branch,
        target_branch,
        state,
        author : {
            username
        },
        labels
    } = mergeRequest;

    return {
        id: iid,
        repo_id: project_id,
        repo: projectData.path_with_namespace,
        title,
        created_at,
        updated_at,
        head_ref: source_branch,
        base_ref: target_branch,
        review_decision: calcReviewDecision(discussions, approvalState),
        // review_requests: not available through API yet - comming soon: (https://gitlab.com/gitlab-org/gitlab/-/issues/290998)
        state,
        user_id: username,
        additions: diffStats?.project?.mergeRequests?.nodes[0]?.diffStatsSummary?.additions,
        deletions: diffStats?.project?.mergeRequests?.nodes[0]?.diffStatsSummary?.deletions,
        labels,
        url: projectData.http_url_to_repo,
        // events: []
    }
}


export const  formatExtendedMergeRequests = (extendedMergeRequests: {
    mergeRequest: MergeRequestDTO;
    // commits: CommitDTO[];
    // notes: NoteDTO[];
    discussions: DiscussionDTO[];
    approvalState: ApprovalStateDTO;
    projectData: ProjectDTO;
    diffStats: MergeResquestDiffStatsQueryGQL; 
}[]) => {
    return extendedMergeRequests.map(formatSingleMergeRequest);
}
