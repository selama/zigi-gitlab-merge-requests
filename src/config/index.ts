import { IRestClient } from './rest-client-interfaces';

type Config = {
    gitlabRestClient: IRestClient;
}

const _config: Partial<Config> = {};

export const setConfig = ({ gitlabRestClient }: Config) => {
    _config.gitlabRestClient = gitlabRestClient;
}

export const config = {
    get restClient() {
        return _config.gitlabRestClient;
    }
}
