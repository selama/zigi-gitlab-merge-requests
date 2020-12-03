import { IRequestsManager } from './config-interfaces';

type Config = {
    requestsManager: IRequestsManager;
    groupId: string;
}

const _config: Partial<Config> = {};

export const setConfig = ({ requestsManager, groupId }: Config) => {
    _config.requestsManager = requestsManager;
    _config.groupId = groupId;
}

export const config = {
    get requestsManager() {
        return _config.requestsManager;
    },
    get groupId() {
        return _config.groupId;
    },
}
