import { NextFunction, Response, Request } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.response?.status || 500;
    const message = err.data?.message || err.message;
    if (status < 500) {
        req.log.warn(message)
    } else {
        req.log.error(message);
    }
    
    res.status(status).send(message);
}
