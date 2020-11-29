import { config } from '../../config';

export const fetchPageExtendedData = async (mergeRequestsIids: string[]) => {
    return config.gitlabGraphqlClient.getExtendedMergeRequestsPage({mergeRequestsIids});
}
