import { GraphQLClient } from 'graphql-request'
import { getSdk } from '../../generated/graphql/graphql-sdk';

export const createGraphqlClient = (url: string, headers: Record<string, string>) => {
    const client = new GraphQLClient(url, { headers });
    const sdk = getSdk(client);
    return {
        getMergeResquestDiffStats: (projectId: string, mergeRequestsId: string) => {
            return sdk.mergeResquestDiffStats({ projectId, mergeRequestsId});
        }    
    }
}
