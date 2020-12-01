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

export const createConcurrencyLimitter = (maxConcurrentPendingPromises: number = 5) => {
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
        add: <T>(action: () => Promise<T>) => {
            const [invoker, promise] = bindActionInvokerToAPromise<T>(action);
            invokersQueue.add(invoker);
            execute();
            return promise;
        }
    }
}