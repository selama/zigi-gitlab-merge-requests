
export type MergeRequestDTO = {
    iid: string;
    project_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    source_branch: string;
    target_branch: string;
    state: string;
    author: {
        username: string;
    },
    labels: string[];
}

export type NoteDTO = {
    id: string;
    body: string;
};

export type DiscussionNoteDTO = NoteDTO & {
    resolved: boolean;
    resolvable: boolean;
    resolved_by: string;
}

export type DiscussionDTO = {
    id: string;
    notes: DiscussionNoteDTO[];
}

export type CommitDTO = {
    author_email: string;
    author_name: string;
    message: string;
}

export type ApprovalStateDTO = {
    rules: {
        approved: boolean;
    }[];
}

export type ProjectDTO = {
    path_with_namespace: string;
    http_url_to_repo: string;
}
