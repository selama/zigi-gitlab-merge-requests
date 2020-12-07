
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
    type?: string;
    author: {
        username: string;
    };
    created_at: string; 
    resolved: boolean;
    resolvable: boolean;
    resolved_by: string;
};

export type DiscussionDTO = {
    id: string;
    notes: NoteDTO[];
}

export type CommitDTO = {
    author_email: string;
    author_name: string;
    message: string;
    created_at: string;
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

export type ResourceStateEventDTO = {
    created_at: string;
    state: string;
    user: {
        username: string;
    }
}

export type Event = {
    kind: string;
    when: string;
    action: string;
    data: any;
}
