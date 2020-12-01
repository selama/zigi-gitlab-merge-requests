import { ProjectExtendedMergeRequestsQueryGQL } from '../../../generated/graphql/graphql-sdk';
import { config } from '../../config';

const projectIdPrefix = 'gid://gitlab/Project/';

export const fetchAllProjectsMergeRequests = async (mergeRequestsIidsGroupedByProjects:  Map<string, string[]>) => {
    const projectMergeRequestsPromises: Promise<ProjectExtendedMergeRequestsQueryGQL>[] = [];
    const projectsIdsIterator = mergeRequestsIidsGroupedByProjects.keys();
    let next = projectsIdsIterator.next();
    while (!next.done) {
        const projectId = next.value;
        const mergeRequestsIids = mergeRequestsIidsGroupedByProjects.get(projectId).map(String);
        projectMergeRequestsPromises.push(
            config.gitlabGraphqlClient.getProjectExtendedMergeRequests({projectId: `${projectIdPrefix}${projectId}`, mergeRequestsIids})
        );
        next = projectsIdsIterator.next();
    }

    return Promise.all(projectMergeRequestsPromises);
}
