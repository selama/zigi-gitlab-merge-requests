import { IRestClient } from './rest-client-interfaces';

type Config = {
    gitlabRestClient: IRestClient;
    groupId: string;
}

const _config: Partial<Config> = {};

export const setConfig = ({ gitlabRestClient, groupId }: Config) => {
    _config.gitlabRestClient = gitlabRestClient;
    _config.groupId = groupId;
}

export const config = {
    get restClient() {
        return _config.gitlabRestClient;
    },
    get groupId() {
        return _config.groupId;
    }
}
