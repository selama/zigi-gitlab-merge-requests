import { ILogger } from '../../config/config-interfaces';

export const createAsyncResource = () => {
    let count = 0;
    let max = 0;
    const executionTimestamps: number[] = [];

    const request = async (value?: any) => {
        count++;
        max = Math.max(count, max);
        executionTimestamps.push(Date.now());
        return new Promise(resolve => setTimeout(() => {
            count--;
            resolve(value);
        }))
    }

    const getMaxConcurrentExecuted = () => max;

    const getExecutionTimestamps = () => executionTimestamps;

    return {
        request,
        getMaxConcurrentExecuted,
        getExecutionTimestamps
    }
}

export const fakeLogger: ILogger = {
    info: () => {}
}
