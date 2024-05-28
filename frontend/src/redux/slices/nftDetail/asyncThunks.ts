import { createAsyncThunk } from '@reduxjs/toolkit';
import { GraphQLResult } from '../../../utils/global-types';
import { Nft, QueryGetNftInfoArgs, GetNftInfoOutput, Listing_Type, QueryGetNftOwnersArgs, QueryGetNftListingsOfSameTokenArgs, GetNftOwnersOutput, GetNftListingsOfSameTokenOutput } from '../../../graphql/types'
import * as q from '../../../graphql/queries';
// import { getNftInfo, getNftOwners, getNftListingsOfSameToken } from '../../../graphql/queries';
import { } from '../../../graphql/mutations';
import { API } from 'aws-amplify';
import { RootStateType } from '../../store';
import { APPSYNC_GRAPHQL } from '../../../app-config';


// type GetNftInfoProps = { callback?: (err?: any, res?: string) => void };
export const getNftInfo = createAsyncThunk(
    'query/getNftInfo',
    async ({ tokenId }: { tokenId: string }, thunkAPI) => {
        try {
            const { data } = await API.graphql({
                query: q.getNftInfo,
                variables: { input: { tokenId }, } as QueryGetNftInfoArgs,
            },
                { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
            ) as GraphQLResult<{ getNftInfo: GetNftInfoOutput }>;
            thunkAPI.dispatch(getNftOwners({ tokenId, }));
            thunkAPI.dispatch(getNftListingsOfSameToken({ tokenId, }));
            data && data.getNftInfo.listingInfo &&
                thunkAPI.dispatch(getListingDetailsOfListingType({
                    listingId: data.getNftInfo.listingInfo.listingId,
                    listingType: data.getNftInfo.listingInfo.listingType!
                }));

            return data;

        } catch (err) {
            const error: GraphQLResult<any> = err as any;
            // (thunkAPI.getState() as RootStateType).alerts
            //     .showDialog("error", "Error!", error.errors![0].message)
            throw JSON.stringify(error);
        }
    }
);


export const getNftOwners = createAsyncThunk(
    'query/getNftOwners',
    async ({ tokenId, cursor }: { tokenId: string, cursor?: string }, thunkAPI) => {
        try {
            const { data } = await API.graphql({
                query: q.getNftOwners,
                variables: { input: { tokenId, cursor, limit: 6 }, } as QueryGetNftOwnersArgs,
            },
                { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
            ) as GraphQLResult<{ getNftOwners: GetNftOwnersOutput }>;
            return data;

        } catch (err) {
            const error: GraphQLResult<any> = err as any;
            // (thunkAPI.getState() as RootStateType).alerts
            //     .showDialog("error", "Error!", error.errors![0].message)
            throw JSON.stringify(error);
        }
    }
);

export const getNftListingsOfSameToken = createAsyncThunk(
    'query/getNftListingsOfSameToken',
    async ({ tokenId, after }: { tokenId: string, after?: string[] }, thunkAPI) => {
        try {
            const { data } = await API.graphql({
                query: q.getNftListingsOfSameToken,
                variables: { input: { tokenId, after, pageSize: 6 }, } as QueryGetNftListingsOfSameTokenArgs,
            },
                { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
            ) as GraphQLResult<{ getNftListingsOfSameToken: GetNftListingsOfSameTokenOutput }>
            return data;

        } catch (err) {
            const error: GraphQLResult<any> = err as any;
            // (thunkAPI.getState() as RootStateType).alerts
            //     .showDialog("error", "Error!", error.errors![0].message)
            throw JSON.stringify(error);
        }
    }
);


export const getListingDetailsOfListingType = createAsyncThunk(
    'market/contract/getListingDetailsOfListingType',
    async ({ listingId, listingType }: { listingId: any, listingType: Listing_Type }, thunkAPI) => {
        const marketContract = (thunkAPI.getState() as RootStateType).contract.marketContract;
        try {
            if (!marketContract) { return { auctionDetails: null, sellingDetails: null } }

            if (listingType === Listing_Type.AUCTION) {
                const [bid, auction] = await Promise.all([
                    marketContract.getBiddingDetails(listingId),
                    marketContract.getAuctionDetails(listingId)
                ])
                return { auctionDetails: { bid, auction }, sellingDetails: null }
            }

            if (listingType === Listing_Type.SELL) {
                return { sellingDetails: await marketContract.getSellingDetails(listingId), auctionDetails: null }
            }

        } catch (err) {
            const error: GraphQLResult<any> = err as any;
            // (thunkAPI.getState() as RootStateType).alerts
            //     .showDialog("error", "Error!", error.errors![0].message)
            throw JSON.stringify(error);
        }
    }
)
