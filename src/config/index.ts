import { IGitlabGraphqlClient } from './config-interfaces/graphql-client-interface';
import { IRestClient } from './config-interfaces/rest-client-interfaces';

type Config = {
    concurrencyLimitter: {add<T>(action: () => Promise<T>): Promise<T>};
    gitlabRestClient: IRestClient;
    gitlabGraphqlClient: IGitlabGraphqlClient;
    groupId: string;
}

const _config: Partial<Config> = {};

export const setConfig = ({ gitlabRestClient, groupId, gitlabGraphqlClient, concurrencyLimitter }: Config) => {
    _config.gitlabRestClient = gitlabRestClient;
    _config.groupId = groupId;
    _config.gitlabGraphqlClient = gitlabGraphqlClient;
    _config.concurrencyLimitter = concurrencyLimitter;
}

export const config = {
    get gitlabRestClient() {
        return _config.gitlabRestClient;
    },
    get groupId() {
        return _config.groupId;
    },
    get gitlabGraphqlClient() {
        return _config.gitlabGraphqlClient;
    },
    get concurrencyLimitter() {
        return _config.concurrencyLimitter;
    }
}
