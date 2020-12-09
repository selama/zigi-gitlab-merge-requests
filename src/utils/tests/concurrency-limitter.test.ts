import { createConcurrencyLimitter } from "../concurrency-limitter";
import { fakeLogger, createAsyncResource } from './test.helpers';

describe('concurrency-limitter', () => {

    it('should allow up to max concurrent async actions', async () => {
        //given
        const maxConcurrent = 3;
        const executionCount = 10;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);

        const asyncResource = createAsyncResource();

        //when
        const executionPromises = [];
        for (let i = 0; i < executionCount; i++) {
            executionPromises.push(
                concurrencyLimitter.add(() => asyncResource.resolve())
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
        for (let i = 0; i < executionCount; i++) {
            executionPromises.push(
                concurrencyLimitter.add(() => asyncResource.resolve())
            )
        }
        concurrencyLimitter.pause(timeout);

        await Promise.all(executionPromises);

        //assert
        const executionTimestamps = asyncResource.getExecutionTimestamps();
        const beforePauseExecution = executionTimestamps[maxConcurrent - 1];
        const afterPauseExecution = executionTimestamps[maxConcurrent];

        const diff = afterPauseExecution - beforePauseExecution;

        expect(diff).toBeGreaterThanOrEqual(timeout);
    });

    it('should not pause when concurrencyLimitter already paused', async () => {
        //given
        const timeout = 200;
        const timeout2 = 300;
        const maxConcurrent = 3;
        const executionCount = 10;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);

        const asyncResource = createAsyncResource();

        //when
        const executionPromises = [];
        for (let i = 0; i < executionCount; i++) {
            executionPromises.push(
                concurrencyLimitter.add(() => asyncResource.resolve())
            )
        }
        concurrencyLimitter.pause(timeout);
        concurrencyLimitter.pause(timeout2);

        await Promise.all(executionPromises);

        //assert
        const executionTimestamps = asyncResource.getExecutionTimestamps();
        const beforePauseExecution = executionTimestamps[maxConcurrent - 1];
        const afterPauseExecution = executionTimestamps[maxConcurrent];

        const diff = afterPauseExecution - beforePauseExecution;

        expect(diff).toBeLessThan(timeout2);
    });

    it('should resolve the promise returned from "add" action with added action resolved value', async () => {
        //given
        const values = ['eden', 'zohar', 'lili', 'cayo', 'hadar', 'sela'];
        const maxConcurrent = 3;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);

        const asyncResource = createAsyncResource();

        //when
        const executionPromises = values.map(value => concurrencyLimitter.add(() => asyncResource.resolve(value)));

        const resolvedValues = await Promise.all(executionPromises);

        //assert
        expect(resolvedValues).toEqual(values);
    });

    it('should reject the promise returned from "add" action with added action rejected value', async () => {
        //given
        const values = ['eden', 'zohar', 'lili', 'cayo', 'hadar', 'sela'];
        const maxConcurrent = 3;

        const concurrencyLimitter = createConcurrencyLimitter(maxConcurrent, fakeLogger);

        const asyncResource = createAsyncResource();

        //when
        const executionPromises = values.map((value, i) => concurrencyLimitter.add(() => {
            if (i % 2) {
                return asyncResource.resolve(value)
            }
            return asyncResource.reject(value);
        }));

        const errorHandledPromises = executionPromises.map(p => p.catch((value) => `rejected ${value}`));

        const resolvedValues = await Promise.all(errorHandledPromises);

        //assert
        expect(resolvedValues).toEqual([
            'rejected eden',
            'zohar',
            'rejected lili',
            'cayo',
            'rejected hadar',
            'sela'
        ]);
    });

});
