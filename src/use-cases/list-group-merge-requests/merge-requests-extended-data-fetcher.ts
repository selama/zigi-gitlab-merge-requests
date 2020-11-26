import { ExtendedMergeRequest } from '../../types'

type FetchPageExtendedData = (mergeRequestsIids: string[]) => Promise<ExtendedMergeRequest>

export const fetchPageExtendedData: FetchPageExtendedData = async (mergeRequestsIids: string[]) => {

}
