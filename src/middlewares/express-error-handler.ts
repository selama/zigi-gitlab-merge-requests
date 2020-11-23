import { NextFunction, Response, Request } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).send(err.message);
}
