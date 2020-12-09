import { ILogger } from '../../config/config-interfaces';

export const createAsyncResource = () => {
    let count = 0;
    let max = 0;
    const executionTimestamps: number[] = [];

    const requestStarted = () => {
        count++;
        max = Math.max(count, max);
        executionTimestamps.push(Date.now());
    }

    const requestFinished = () => {
        count--;
    }

    const resolve = async (value?: any) => {
        requestStarted();
        return new Promise(_resolve => setTimeout(() => {
            requestFinished();
            _resolve(value);
        }))
    }

    const reject = async (value?: any) => {
        requestStarted();
        return new Promise((_resolve, _reject) => setTimeout(() => {
            requestFinished();
            _reject(value);
        }))
    }

    const getMaxConcurrentExecuted = () => max;

    const getExecutionTimestamps = () => executionTimestamps;

    return {
        resolve,
        reject,
        getMaxConcurrentExecuted,
        getExecutionTimestamps
    }
}

export const fakeLogger: ILogger = {
    info: () => {}
}
