
export type MergeRequestDTO = {
    iid: string;
    project_id: string;
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
    notes: DiscussionNoteDTO;
}

export type CommitsDTO = {
    author_email: string;
    author_name: string;
    message: string;
}
