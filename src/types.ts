export enum MergeRequestState {
    OPENED = 'opened',
};

export type MergeRequest = {
    id: string;
    iid: string;
    project_id: string;
    title: string;
    updated_at: string;
    state: MergeRequestState;
};
