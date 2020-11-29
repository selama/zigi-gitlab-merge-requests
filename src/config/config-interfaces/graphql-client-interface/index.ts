import { Exact, ExtendedMergeRequestsPageQueryGQL } from '../../../../generated/graphql/graphql-sdk';

export interface IGitlabGraphqlClient {
    getExtendedMergeRequestsPage(variables: Exact<{
        mergeRequestsIids: string[];
    }>): Promise<ExtendedMergeRequestsPageQueryGQL>    
}
