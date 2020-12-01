import { GraphQLClient } from 'graphql-request'
import { getSdk, ProjectExtendedMergeRequestsQueryGQL, ProjectExtendedMergeRequestsQueryVariablesGQL } from '../../../generated/graphql/graphql-sdk';
import { IGitlabGraphqlClient } from '../../config/config-interfaces/graphql-client-interface';

const createQueue = <T>() => {
    const queue: T[] = [];
    return {
        add: (item: T) => {
            queue.push(item);
        },
        pop: () => queue.shift(),
        size: () => queue.length
    };
};

const bindActionInvokerToAPromise = (action: () => Promise<unknown>): [() => Promise<void>, Promise<unknown>] => {
    let resolvePromise: (value?: unknown) => void;
    let rejectPromise: (reason?: any) => void;

    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    const invoker = () => action()
        .then(result => {
            resolvePromise(result);
        })
        .catch(reason => {
            rejectPromise(reason);
        });

    return [invoker, promise];
}

const createConcurrencyLimitter = (maxConcurrentPendingPromises: number = 5) => {
    let currentPendingCount = 0;
    let invokersQueue = createQueue<() => Promise<unknown>>();

    const execute = async () => {
        if (currentPendingCount === maxConcurrentPendingPromises || invokersQueue.size() === 0) {
            return;
        }
        const invoker = invokersQueue.pop();
        currentPendingCount++;
        await invoker()
        currentPendingCount--;
        execute();
    }

    return {
        add: (action: () => Promise<unknown>) => {
            const [invoker, promise] = bindActionInvokerToAPromise(action);
            invokersQueue.add(invoker);
            execute();
            return promise;
        }
    }
}

const splitIids = (mergeRequestsIids: string[]) => {
    const iids1 = mergeRequestsIids.slice(0, Math.ceil(mergeRequestsIids.length/2));
    const iids2 = mergeRequestsIids.slice(Math.ceil(mergeRequestsIids.length/2));
    return [iids1, iids2];
}

const mergeResults = (
    result1: ProjectExtendedMergeRequestsQueryGQL,
    result2: ProjectExtendedMergeRequestsQueryGQL
    ): ProjectExtendedMergeRequestsQueryGQL => {
    const mergeRequests1 = result1.projects.nodes[0].mergeRequests;
    const mergeRequests2 = result2.projects.nodes[0].mergeRequests;
    return {
        projects: {
            nodes: [
                {
                    mergeRequests: {
                        pageInfo: {
                            endCursor: `[${mergeRequests1.pageInfo.endCursor},${mergeRequests2.pageInfo.endCursor}]`,
                            hasNextPage: mergeRequests1.pageInfo.hasNextPage || mergeRequests2.pageInfo.hasNextPage
                        },
                        nodes: [
                            ...mergeRequests1.nodes,
                            ...mergeRequests2.nodes,
                        ]
                    }
                }
            ]
        }
    }
}

export class GitlabGraphqlClient implements IGitlabGraphqlClient {

    private sdk: ReturnType<typeof getSdk>;
    private concurrencyLimitter = createConcurrencyLimitter(5);

    constructor(url: string, headers: Record<string, string>) {
        const client = new GraphQLClient(url, { headers });
        this.sdk = getSdk(client);
    }

    _retry = (
        {projectId, mergeRequestsIids}: ProjectExtendedMergeRequestsQueryVariablesGQL,
        attempt: number = 0): Promise<ProjectExtendedMergeRequestsQueryGQL> => {
        const maxRetries = 5;
        return this.concurrencyLimitter
            .add(() => this.sdk.projectExtendedMergeRequests({projectId, mergeRequestsIids}))
            .catch(async (err) => {
                if (attempt < maxRetries) {
                    const [iids1, iids2] = splitIids(mergeRequestsIids);
                    const [result1, result2] = await Promise.all([
                        this._retry({projectId, mergeRequestsIids: iids1}, attempt + 1),
                        this._retry({projectId, mergeRequestsIids: iids2}, attempt + 1),
                    ]);
                    return mergeResults(result1, result2);
                }
                throw err;
            });
    }

    getProjectExtendedMergeRequests = ({projectId, mergeRequestsIids}: ProjectExtendedMergeRequestsQueryVariablesGQL) => {
        return this._retry({projectId, mergeRequestsIids})
    }
}
