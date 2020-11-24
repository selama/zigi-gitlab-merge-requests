import { listGroupMergeRequests } from '..';
import { setConfig } from '../../../config';
import { MockedRestClient } from '../../../../__tests__/mocks/gitlab-rest-client';
import { mockOpenedMergeRequestsResponse, mockMergeRequestsUpdatedSinceResponse } from './helpers';

describe('listGroupMergeRequests', () => {
    it('should return all opened merged requests when "since" is not provided', async () => {
        const groupId = '12345';

        const openMergeRequests = [
            { title: 'Merge Request 1', updated_at: '2020-11-19T12:00:00', state: 'opened' },
            { title: 'Merge Request 2', updated_at: '2019-11-19T12:00:00', state: 'opened' },
            { title: 'Merge Request 3', updated_at: '2020-10-17T12:00:00', state: 'opened' },
            { title: 'Merge Request 4', updated_at: '2017-11-19T12:00:00', state: 'opened' },
            { title: 'Merge Request 5', updated_at: '2020-01-01T12:00:00', state: 'opened' }
        ];
        const response = mockOpenedMergeRequestsResponse({groupId, mergeRequests: openMergeRequests});

        const gitlabRestClient = new MockedRestClient();
        gitlabRestClient.addMockedResponse(response);
        setConfig({ gitlabRestClient, groupId });

        const result = await listGroupMergeRequests(groupId, {});

        expect(result).toEqual(openMergeRequests);
    });

    it('should return all merge requests which were updated after the given "since"', async () => {
        const groupId = '12345';
        const since = '2020-11-11T12:00:00';
        const updatedMergeRequests = [
            { title: 'Merge Request 1', updated_at: '2020-11-19T12:00:00', state: 'opened' },
            { title: 'Merge Request 6', updated_at: '2020-11-11T12:00:00', state: 'merged' },
            { title: 'Merge Request 7', updated_at: '2020-11-20T12:00:00', state: 'merged' }
        ];
        const response = mockMergeRequestsUpdatedSinceResponse(groupId, updatedMergeRequests, since);

        const gitlabRestClient = new MockedRestClient();
        gitlabRestClient.addMockedResponse(response);
        setConfig({ gitlabRestClient, groupId });

        const result = await listGroupMergeRequests(groupId, { since });

        expect(result).toEqual(updatedMergeRequests);
    });

    it('should aggregate result from paged response', async () => {
        const groupId = '12345';

        const page1 = [
            { title: 'Merge Request 1', updated_at: '2020-11-19T12:00:00', state: 'opened' },
            { title: 'Merge Request 2', updated_at: '2019-11-19T12:00:00', state: 'opened' },
        ];
        const response1 = mockOpenedMergeRequestsResponse({groupId, mergeRequests: page1, totalPagesCount: 3});

        const page2 = [
            { title: 'Merge Request 3', updated_at: '2020-11-19T12:00:00', state: 'opened' },
            { title: 'Merge Request 4', updated_at: '2019-11-19T12:00:00', state: 'opened' },
        ];
        const response2 = mockOpenedMergeRequestsResponse({groupId, mergeRequests: page2, totalPagesCount:3, page: 2});

        const page3 = [
            { title: 'Merge Request 5', updated_at: '2020-11-19T12:00:00', state: 'opened' },
        ];
        const response3 = mockOpenedMergeRequestsResponse({groupId, mergeRequests: page3, totalPagesCount:3, page: 3});

        const gitlabRestClient = new MockedRestClient();
        gitlabRestClient.addMockedResponse(response1);
        gitlabRestClient.addMockedResponse(response2);
        gitlabRestClient.addMockedResponse(response3);
        setConfig({ gitlabRestClient, groupId });

        const result = await listGroupMergeRequests(groupId, {});

        expect(result).toEqual([...page1, ...page2, ...page3]);

    });
});
