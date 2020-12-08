import { ILogger, IRequestsManager } from './config-interfaces';

export type Config = {
    requestsManager: IRequestsManager;
    groupId: string;
    logger: ILogger;
}

const _config: Partial<Config> = {};

export const setConfig = ({ requestsManager, groupId, logger }: Config) => {
    _config.requestsManager = requestsManager;
    _config.groupId = groupId;
    _config.logger = logger;
}

export const config = {
    get requestsManager() {
        return _config.requestsManager;
    },
    get groupId() {
        return _config.groupId;
    },
    get logger() {
        return _config.logger;
    }
}
