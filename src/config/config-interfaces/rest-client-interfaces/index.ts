
export interface IRestClientResult<T> {
    getData(): T;
    getHeaders(): Record<string, string>;
}

export interface IRestClient {
    get<T>(resource: string, query?: Record<string, string | number>): Promise<IRestClientResult<T>>
}

export type MergeRequestREST = {
    iid: string;
    project_id: string;
}

export type NoteREST = {
    id: string;
    body: string;
};

export type DiscussionNoteREST = NoteREST & {
    resolved: boolean;
    resolvable: boolean;
    resolved_by: string;
}

export type DiscussionREST = {
    id: string;
    notes: DiscussionNoteREST;
}

export type CommitsREST = {
    author_email: string;
    author_name: string;
    message: string;
}
