import { NextFunction, Response, Request } from 'express';

export const requestStartedLogger = (req: Request, _res: Response, next: NextFunction) => {
    req.log.info('request started');
    next();
};
