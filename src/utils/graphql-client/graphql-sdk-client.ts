import { GraphQLClient } from 'graphql-request'
import { Exact, ExtendedMergeRequestsPageQueryGQL, getSdk } from '../../../generated/graphql/graphql-sdk';
import { IGitlabGraphqlClient } from '../../config/config-interfaces/graphql-client-interface';

const promisedTimeout = (timeout: number) =>  new Promise(resolve => setTimeout(resolve, timeout));

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

const splitIids = (iids: string[]) => {
    const part1Ids = iids.slice(0, Math.ceil(iids.length/2));
    const part2Ids = iids.slice(Math.ceil(iids.length/2));
    return [part1Ids, part2Ids];
}

const mergeResults = (part1Result: ExtendedMergeRequestsPageQueryGQL, part2Result: ExtendedMergeRequestsPageQueryGQL) => {
    return {
        group: {
            mergeRequests: {
                nodes: [
                    ...part1Result.group.mergeRequests.nodes,
                    ...part2Result.group.mergeRequests.nodes
                ]
            }
        }
    };
};

type RetryFunction = (variables: Exact<{ mergeRequestsIids: string[]; }>, attempt?: number) => 
    Promise<ExtendedMergeRequestsPageQueryGQL>;

export class GitlabGraphqlClient implements IGitlabGraphqlClient {

    private sdk: ReturnType<typeof getSdk>;
    private concurrencyLimitter = createConcurrencyLimitter(5);

    constructor(url: string, headers: Record<string, string>) {
        const client = new GraphQLClient(url, { headers });
        this.sdk = getSdk(client);
    }

    // since the gitlab API is very fragile - adding this resiliant retry mechanism.
    // 1 - it uses a concurrency limiter mechanism - ensure that no more than 5 requests are being 
    // in pending state(fetching) concurrently.
    // 2 - the original request is trying to fetch a whole page data (100 merge requests), but if
    // a request has failed, this retry mechanism, will try 2 requests of 50 merge requests.
    // a fail for 50 merge requests fetching will lead to 25 merge requests fetcing and so on up to 10 iterations.
    _retry: RetryFunction = async (variables: Exact<{ mergeRequestsIids: string[]; }>, attempt: number = 0) => {
        const maxRetries = 10;
        try {
            const result = await this.concurrencyLimitter.add(
                () => promisedTimeout(attempt * 100).then(() => this.sdk.extendedMergeRequestsPage(variables))
            );
            return result;
        } catch (err) {
            if (attempt < maxRetries) {
                const [part1Iids, part2Iids] = splitIids(variables.mergeRequestsIids);
                const [part1Result, part2Result]: ExtendedMergeRequestsPageQueryGQL[] = await Promise.all([
                    this._retry({ mergeRequestsIids: part1Iids }, attempt + 1),
                    this._retry({ mergeRequestsIids: part2Iids }, attempt + 1),
                ]);
                return mergeResults(part1Result, part2Result);
            } else {
                console.log('failed', variables.mergeRequestsIids);
                throw err;
            }
        }
    }

    getExtendedMergeRequestsPage = (variables: Exact<{ mergeRequestsIids: string[]; }>) => {
        return this._retry(variables);
    }
}
