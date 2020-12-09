import { createConcurrencyLimitter } from "../concurrency-limitter";
import { fakeLogger, createAsyncResource } from './concurrency-limitter.test.helpers';

describe('concurrency-limitter', () => {

    it('should allow up to max concurrent asyncActions', async () => {
        //given
        const maxConcurrent = 3;
        const executionCount = 10;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);
        
        const asyncResource = createAsyncResource();

        //when
        const executionPromises = [];
        for (let i=0; i<executionCount; i++) {
            executionPromises.push(
                concurrencyLimitter.add(() => asyncResource.request())
            )
        }

        await Promise.all(executionPromises);

        // assert
        expect(asyncResource.getMaxConcurrentExecuted()).toBeLessThanOrEqual(maxConcurrent);
    });

    it('should pause executions, and resume after timeout', async () => {
        //given
        const timeout = 200;
        const maxConcurrent = 3;
        const executionCount = 10;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);
        
        const asyncResource = createAsyncResource();

        //when
        const executionPromises = [];
        for (let i=0; i<executionCount; i++) {
            executionPromises.push(
                concurrencyLimitter.add(() => asyncResource.request())
            )
        }
        concurrencyLimitter.pause(timeout);

        await Promise.all(executionPromises);

        //assert
        const executionTimestamps = asyncResource.getExecutionTimestamps();
        const beforePauseExecution = executionTimestamps[maxConcurrent-1];
        const afterPauseExecution = executionTimestamps[maxConcurrent];

        const diff = afterPauseExecution - beforePauseExecution;

        expect(diff).toBeGreaterThanOrEqual(timeout);
    });

    it('should resolve a promise for "add" action with added action resolved value', async () => {
        //given
        const values = ['eden', 'zohar', 'lili', 'cayo', 'hadar', 'sela'];
        const maxConcurrent = 3;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);

        const asyncResource = createAsyncResource();

        //when
        const executionPromises = values.map(value => concurrencyLimitter.add(() => asyncResource.request(value)));

        const resolvedValues = await Promise.all(executionPromises);

        // //assert
        expect(resolvedValues).toEqual(values);
    });

});
