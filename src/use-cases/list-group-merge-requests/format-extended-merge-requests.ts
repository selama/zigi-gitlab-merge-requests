import { MergeResquestDiffStatsQueryGQL } from '../../../generated/graphql/graphql-sdk';
import { 
    ApprovalStateDTO, 
    CommitDTO, 
    DiscussionDTO, 
    MergeRequestDTO, 
    NoteDTO, 
    ProjectDTO,
    Event, 
    ResourceStateEventDTO
} from '../../types/dto';

const getStateEvents = (resourceStateEvents: ResourceStateEventDTO[]): Event[] => {
    const sortedByCreationDateStateEvents = resourceStateEvents
        .slice()
        .sort((ev1, ev2) => ev1.created_at.localeCompare(ev2.created_at));

    const stateEvents = sortedByCreationDateStateEvents
        .map(({
            created_at,
            state,
            user: {
                username
            }
        }, i) => ({
            kind: 'state',
            when: created_at,
            action: 'change',
            data: {
                author: username,
                to: state,
                from: i ? sortedByCreationDateStateEvents[i-1].state : 'open'
            }
        }));
    return stateEvents; 
}

const getCommitEvents = (commits: CommitDTO[]): Event[] => {
    const commitEvents = commits.map(({
        author_email,
        created_at,
        message
    }) => ({
        kind: 'commit',
        when: created_at,
        action: 'add',
        data: {
            author: author_email,
            message
        }
    }));
    return commitEvents;
}

const getReviewEvents = (discussions: DiscussionDTO[]): Event[] => {
    const notes: NoteDTO[] = discussions.reduce((allNotes, {notes}) => [...allNotes, ...notes], []);
    const discussionNotes = notes.filter(({type}) => type === 'DiscussionNote');
    const reviewEvents = discussionNotes.map(({
        created_at,
        author: {
            username
        },
        body
    }) => ({
        kind: 'review',
        when: created_at,
        action: 'add',
        data: {
            author: username,
            body,
            state: "COMMENTED",
            comments_count: 1 // Gitlab does not have a review entity - the reviewer only adds discussions(one by one) on the Merge Requset.
        }
    }));
    return reviewEvents;
}

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
    commits,
    discussions,
    approvalState,
    stateEvents,
    projectData,
    diffStats
}: {
    mergeRequest: MergeRequestDTO;
    commits: CommitDTO[];
    discussions: DiscussionDTO[];
    approvalState: ApprovalStateDTO;
    stateEvents: ResourceStateEventDTO[];
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
        events: [
            ...getReviewEvents(discussions),
            ...getCommitEvents(commits),
            ...getStateEvents(stateEvents)
        ]
    }
}


export const  formatExtendedMergeRequests = (extendedMergeRequests: {
    mergeRequest: MergeRequestDTO;
    commits: CommitDTO[];
    discussions: DiscussionDTO[];
    approvalState: ApprovalStateDTO;
    stateEvents: ResourceStateEventDTO[];
    projectData: ProjectDTO;
    diffStats: MergeResquestDiffStatsQueryGQL; 
}[]) => {
    return extendedMergeRequests.map(formatSingleMergeRequest);
}
