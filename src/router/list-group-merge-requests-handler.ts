import { Request, Response } from "express";
import { listGroupMergeRequests } from '../use-cases/list-group-merge-requests';

export const listGroupMergeRequestsHandler = async (req: Request, res: Response) => {
    const { params: { groupId } } = req;
    const { query } = req;
    return res.send(await listGroupMergeRequests(groupId, query as Record<string, string>))
}
