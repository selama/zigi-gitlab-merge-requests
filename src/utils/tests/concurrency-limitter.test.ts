import { createConcurrencyLimitter } from "../concurrency-limitter";
import { createConcurrencyTracker, fakeLogger, repeat } from './concurrency-limitter.test.helpers';

describe('concurrency-limitter', () => {

    it('should allow up to max concurrent asyncActions', async () => {
        //given
        const maxConcurrent = 3;
        const executionCount = 10;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);
        const { concurrencyTracker, trackedAsyncAction } = createConcurrencyTracker();

        //when
        const executionPromises = repeat(executionCount, () => concurrencyLimitter.add(trackedAsyncAction));

        await Promise.all(executionPromises);

        //assert
        expect(concurrencyTracker.getMax()).toBeLessThanOrEqual(maxConcurrent);
    });

    it('should pause executions, and resume after timeout', async () => {
        //given
        const timeout = 200;
        const maxConcurrent = 3;
        const executionCount = 10;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);
        const { concurrencyTracker, trackedAsyncAction } = createConcurrencyTracker();

        //when
        const executionPromises = repeat(executionCount, () => concurrencyLimitter.add(trackedAsyncAction));
        concurrencyLimitter.pause(timeout);

        await Promise.all(executionPromises);

        //assert
        const executionTimestamps = concurrencyTracker.getExecutionTimestamps();
        const beforePauseExecution = executionTimestamps[maxConcurrent-1];
        const afterPauseExecution = executionTimestamps[maxConcurrent];

        const diff = afterPauseExecution - beforePauseExecution;

        expect(diff).toBeGreaterThanOrEqual(timeout);
    });

});
