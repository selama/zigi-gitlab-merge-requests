import { Router } from "express";
import { wrapWithErrorCatcher, sinceValidator } from './router-utils';
import { listGroupMergeRequestsHandler } from './list-group-merge-requests-handler';

export const createRouter = () => {
    const router = Router();

    router.get(
        '/refresh',
        [sinceValidator],
        wrapWithErrorCatcher(listGroupMergeRequestsHandler)
    );

    return router;
}
