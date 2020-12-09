import { ILogger } from '../config/config-interfaces';

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

const bindActionInvokerToAPromise = <T>(action: () => Promise<T>): [() => Promise<void>, Promise<T>] => {
    let resolvePromise: (value?: T) => void;
    let rejectPromise: (reason?: any) => void;

    const promise = new Promise<T>((resolve, reject) => {
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

export const createConcurrencyLimitter = (maxConcurrentPendingPromises: number, logger: ILogger) => {
    let currentPendingCount = 0;
    let invokersQueue = createQueue<() => Promise<unknown>>();
    let paused: boolean = false;

    const execute = async () => {
        if (currentPendingCount === maxConcurrentPendingPromises || invokersQueue.size() === 0 || paused) {
            return;
        }
        const invoker = invokersQueue.pop();
        currentPendingCount++;
        await invoker()
        currentPendingCount--;
        execute();
    }

    const add = <T>(action: () => Promise<T>) => {
        const [invoker, promise] = bindActionInvokerToAPromise<T>(action);
        invokersQueue.add(invoker);
        execute();
        return promise;
    }

    const resume = () => {
        logger.info('resuming concurrency limitter');
        paused = false;
        for (let i=0; i<maxConcurrentPendingPromises; i++) {
            execute();
        }
    }

    const pause = (timeout: number) => {
        if (paused) {
            return;
        }
        logger.info(`pausing concurrency limitter for ${timeout} ms.`);
        paused = true;
        setTimeout(resume, timeout);
    }

    return {
        add,
        pause
    }
}
