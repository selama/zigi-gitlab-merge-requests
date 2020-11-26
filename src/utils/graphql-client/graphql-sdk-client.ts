import { GraphQLClient } from 'graphql-request'
import { getSdk } from '../../generated/graphql/graphql-sdk';
// import axios from 'axios';
const client = new GraphQLClient('https://gitlab.com/api/graphql', {
    // fetch: axios,
    headers: {
        'PRIVATE-TOKEN': 'CTCvMLvoqeB8hAHCVGvt'
    }
})
const sdk = getSdk(client);

const mergeRequestsIids = ["48490", "48489", "48488", "12", "48487", "1353", "48486", "48485", "48484", "1674", "48483", "48482", "48481", "707", "1", "48478", "48477", "48476", "48475", "2837", "12", "1", "2", "48474", "48473", "48472", "48471", "11", "48470", "48469", "48468", "48467", "48466", "2836", "48465", "130", "48463", "1704", "48462", "48461", "25", "48460", "48459", "48457", "48456", "48455", "48453", "97", "48452", "48451", "48450", "1352", "48449", "48448", "48447", "48446", "48445", "661", "48444", "48443", "48442", "1349", "48441", "48440", "48439", "4785", "1673", "1703", "1702", "48437", "48436", "48435", "48434", "179", "17", "48433", "28", "48431", "48430", "48429", "48428", "48427", "48426", "2180", "48424", "48423", "48422", "4784", "48421", "48419", "48418", "48417", "48416", "2179", "20", "346", "48414", "48413", "1672", "557"];

export const testGraphqlSDKClient = () => sdk.groupExtendedMergeRequests({mergeRequestsIids});
