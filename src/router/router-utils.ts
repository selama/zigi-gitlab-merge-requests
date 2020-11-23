import { RequestHandler, Request, Response, NextFunction } from "express";
import { validationResult } from 'express-validator';
import { param as paramValidator, query as queryValidator } from 'express-validator';
import { isValidISODateString } from 'iso-datestring-validator';

export const wrapWithErrorCatcher = (handler: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!validationResult(req).isEmpty()) {
                throw new Error(JSON.stringify(validationResult(req).mapped()))
            }
            handler(req, res, next);
        } catch (error) {
            next(error)
        }
    }

export const sinceValidator = queryValidator('since')
    .custom((since: string) => !since || isValidISODateString(since))
    .withMessage(`'since' parameter is invalid - ISO 8601 formatted string is expected`);

export const groupIdValidator = paramValidator('groupId')
    .isNumeric()
    .withMessage(`'groupId' is expected to be numeric`);
