import { NextFunction, Response, Request } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.response?.status || 500).send(err.data?.message || err.message);
}
