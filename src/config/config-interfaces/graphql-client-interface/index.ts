import { 
    ProjectExtendedMergeRequestsQueryGQL,
    ProjectExtendedMergeRequestsQueryVariablesGQL
} from '../../../../generated/graphql/graphql-sdk';

export interface IGitlabGraphqlClient {
    getProjectExtendedMergeRequests(variables: ProjectExtendedMergeRequestsQueryVariablesGQL): Promise<ProjectExtendedMergeRequestsQueryGQL> 
}
