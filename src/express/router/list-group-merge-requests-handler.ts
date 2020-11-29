import { Request, Response } from "express";
import { listGroupMergeRequests } from '../../use-cases/list-group-merge-requests';
import { config } from '../../config';

export const listGroupMergeRequestsHandler = async (req: Request, res: Response) => {
    const groupId = config.groupId;
    const { query } = req;
    return res.send(await listGroupMergeRequests(groupId, query as Record<string, string>));
}
