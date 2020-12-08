import { ILogger } from '../../config/config-interfaces';

export const createConcurrencyTracker = () => {
    let counter: number = 0;
    let max: number = 0;
    let executionTimestamps: number[] = [];

    const add = () => {
        executionTimestamps.push(Date.now());
        counter++;
        max = Math.max(max, counter);
    }

    const remove = () => {
        counter--;
    }

    const getMax = () => max;

    const getExecutionTimestamps = () => executionTimestamps;

    const trackedAsyncAction = () => {
        return new Promise(resolve => {
            add();
            setTimeout(() => {
                remove();
                resolve();
            });
        })
    }

    return {
        concurrencyTracker: {
            getMax,
            getExecutionTimestamps
        },
        trackedAsyncAction
    }
}

export const repeat = (count: number, action: () => any) => new Array(count).fill({}).map(action);

export const fakeLogger: ILogger = {
    info: () => {}
}
