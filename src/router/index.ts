import { Router } from "express";
import { wrapWithErrorCatcher, sinceValidator, groupIdValidator } from './router-utils';
import { listGroupMergeRequestsHandler } from './list-group-merge-requests-handler';

export const createRouter = () => {
    const router = Router();

    router.get(
        '/:groupId',
        [groupIdValidator, sinceValidator],
        wrapWithErrorCatcher(listGroupMergeRequestsHandler)
    );

    return router;
}
